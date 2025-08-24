FROM oven/bun:latest

COPY package.json ./
COPY ../bun.lock ./
COPY src ./

RUN bun install

ENTRYPOINT [ "bun", "run", "src/index.ts" ]
