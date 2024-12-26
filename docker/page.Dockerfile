FROM node:18-alpine as base

#mac m1 python3 지정
RUN apk add --no-cache python3 make g++
ENV PYTHON python3

WORKDIR /app

COPY ../package*.json lerna.json ./
COPY ../packages/test- ./packages/page/
COPY ../packages/common ./packages/common/

RUN yarn install
RUN yarn build

FROM node:18-alpine as runner

WORKDIR /app

COPY ../package*.json lerna.json ./

COPY --from=base /app/packages/page/ ./packages/page/

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/page/node_modules ./packages/page/node_modules
COPY --from=base /app/packages/common/ ./packages/common/

CMD ["yarn", "run", "run-page"]