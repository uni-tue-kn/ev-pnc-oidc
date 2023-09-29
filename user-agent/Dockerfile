FROM node:20-alpine AS builder

RUN npm install -g npm

WORKDIR /app
COPY ./* ./*
RUN npm install --save
RUN npm run build

FROM nginx:1.25-alpine AS runtime
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/user-agent/ /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
