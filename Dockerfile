# syntax=docker/dockerfile:experimental
FROM node:18.1.0 as builder

LABEL org.opencontainers.image.source https://github.com/flyteorg/flyteconsole

WORKDIR /my-project/
COPY . /my-project/

RUN : \
  --mount=type=cache,target=/root/.yarn \
  # install production dependencies
  && yarn workspaces focus --all --production \
  && rm -rf node_modules/@flyteconsole \
  && BASE_URL=/console yarn run build:prod \
   # move the production dependencies to the /app folder
  && mkdir /app \
  && mv node_modules /app \
  && mv ./website/dist /app \
  && mv ./website/index.js ./website/env.js ./website/plugins.js /app


FROM gcr.io/distroless/nodejs
LABEL org.opencontainers.image.source https://github.com/flyteorg/flyteconsole

COPY --from=builder /app app
WORKDIR /app
ENV NODE_ENV=production PORT=8080
EXPOSE 8080

USER 1000

CMD ["index.js"]
