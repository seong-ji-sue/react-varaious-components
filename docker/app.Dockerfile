FROM node:18-alpine as base

#mac m1 python3 지정
RUN apk add --no-cache python3 make g++
ENV PYTHON python3

WORKDIR /app

COPY ../package*.json lerna.json ./
COPY ../packages/front ./packages/app/
COPY ../packages/common ./packages/common/

RUN yarn install
RUN yarn build

FROM node:18-alpine as runner

WORKDIR /app

COPY ../package*.json lerna.json ./

COPY --from=base /app/packages/app/ ./packages/app/

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/app/node_modules ./packages/app/node_modules
COPY --from=base /app/packages/common/ ./packages/common/

CMD ["yarn", "run", "run-app"]