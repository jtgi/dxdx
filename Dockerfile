FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm install -g pnpm
RUN pnpm install

FROM node:20-alpine AS production-dependencies-env
COPY ./pnpm-lock.yaml ./package.json /app/
WORKDIR /app
RUN npm install -g pnpm
RUN pnpm install

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm install -g pnpm
RUN pnpm run build

FROM node:20-alpine
COPY ./pnpm-lock.yaml ./package.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
RUN npm install -g pnpm
RUN pnpm install
CMD ["pnpm", "run", "start"]