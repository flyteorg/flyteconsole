# syntax=docker/dockerfile:experimental

FROM node:21.6.0 as builder
LABEL org.opencontainers.image.source https://github.com/flyteorg/flyteconsole

ARG TARGETARCH
ENV npm_config_target_arch "${TARGETARCH}"
ENV npm_config_target_platform linux
ENV npm_config_target_libc glibc

WORKDIR /my-project/
COPY . /my-project/

# install production dependencies
RUN : \
  --mount=type=cache,target=/root/.yarn \
  && yarn workspaces focus --production --all

# build console web app
RUN : \
  --mount=type=cache,target=/root/.yarn \
  && BASE_URL=/console yarn workspace @clients/console run build:prod

# copy console build to /app
RUN : \
  --mount=type=cache,target=/root/.yarn \
  && mkdir /app \
  && cp -R ./website/console/dist/* /app

FROM gcr.io/distroless/nodejs18-debian12
LABEL org.opencontainers.image.source https://github.com/flyteorg/flyteconsole

COPY --from=builder /app app
WORKDIR /app
ENV NODE_ENV=production BASE_URL=/console PORT=8080
EXPOSE 8080

USER 1000

CMD ["server.js"]
