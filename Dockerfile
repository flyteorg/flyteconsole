# syntax=docker/dockerfile:experimental
# Use node:17 to docker build on M1
FROM --platform=${BUILDPLATFORM} node:16 as builder
LABEL org.opencontainers.image.source https://github.com/flyteorg/flyteconsole

ARG TARGETARCH
ENV npm_config_target_arch "${TARGETARCH}"
ENV npm_config_target_platform linux
ENV npm_config_target_libc glibc

WORKDIR /my-project/
COPY . /my-project/
RUN : \
  --mount=type=cache,target=/root/.yarn \
  # install production dependencies
  && yarn workspaces focus --all --production \
  && yarn build:types \
  && BASE_URL=/console yarn run build:prod \
  && mkdir /app \
  && cp -R ./website/dist/* /app

FROM gcr.io/distroless/nodejs
LABEL org.opencontainers.image.source https://github.com/flyteorg/flyteconsole

COPY --from=builder /app app
WORKDIR /app
ENV NODE_ENV=production PORT=8080
EXPOSE 8080

USER 1000

CMD ["server.js"]

