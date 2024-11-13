FROM denoland/deno:1.38.3
ARG VERSION
ENV DENO_DEPLOYMENT_ID=${VERSION}

WORKDIR /app

COPY . .
RUN deno cache main.ts

EXPOSE 5437

CMD ["run", "-A", "--unstable-kv", "main.ts"]