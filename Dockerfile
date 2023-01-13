# syntax=docker/dockerfile:experimental
FROM node:18.1.0 as builder

LABEL org.opencontainers.image.source https://github.com/flyteorg/flyteconsole

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

WORKDIR /my-project/
RUN : \
  --mount=type=cache,target=/root/.yarn \
  # install all dependencies so we can build
  && yarn workspaces focus --all --production \
  && yarn build:pack \
  && BASE_URL=/console yarn run build:prod \
  && cp -R ./website/dist/* /app

FROM gcr.io/distroless/nodejs
LABEL org.opencontainers.image.source https://github.com/flyteorg/flyteconsole

COPY --from=builder /app app
WORKDIR /app
ENV NODE_ENV=production PORT=8080
EXPOSE 8080

USER 1000

CMD ["server.js"]

