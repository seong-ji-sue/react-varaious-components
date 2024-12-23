FROM node:18-alpine as base

#mac m1 python3 지정
RUN apk add --no-cache python3 make g++
ENV PYTHON python3

WORKDIR /app

COPY ../package*.json lerna.json ./
COPY ../packages/server/package.json ./packages/server/
COPY ../packages/common ./packages/common/

RUN yarn install

FROM node:18-alpine as runner

WORKDIR /app

COPY ../package*.json lerna.json ./

# COPY ./config/.env.production ./config/
COPY ../packages/server ./packages/server

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/server/node_modules ./packages/server/node_modules
COPY --from=base /app/packages/common/ ./packages/common/

CMD ["yarn", "run", "run-server"]