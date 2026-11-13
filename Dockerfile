FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install --registry=https://registry.npmjs.org/ --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist ./

EXPOSE 80
