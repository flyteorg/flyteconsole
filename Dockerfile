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
  && yarn workspaces focus @flyteconsole/client-app --production \
  # move the production dependencies to the /app folder
  && mkdir /app \
  && rm -rf node_modules/@flyteorg \
  && cp -R node_modules /app

RUN : \
  --mount=type=cache,target=/root/.yarn \
  # install all dependencies so we can build
  && yarn workspaces focus --all --production \
  && yarn build:types \
  && BASE_URL=/console yarn run build:prod \
  && cp -R ./website/dist/* /app

RUN rm -rf /app/node_modules
RUN rm -f /app/client-stats.json

FROM gcr.io/distroless/nodejs
LABEL org.opencontainers.image.source https://github.com/flyteorg/flyteconsole

COPY --from=builder /app app
WORKDIR /app
ENV NODE_ENV=production PORT=8080
EXPOSE 8080

USER 1000

CMD ["server.js"]

