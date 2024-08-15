# Create a builder container
FROM node:20-alpine AS builder

# Update packages
RUN apk update && apk upgrade
# Update NPM
RUN npm install -g npm

# Create working directory /app
WORKDIR /app

# Copy source files
COPY ./src/ ./src/
COPY ./angular.json ./
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./tsconfig.app.json ./
COPY ./tsconfig.json ./
COPY ./tsconfig.spec.json ./

# Install dependencies
RUN npm install --save

# Build Angular project
RUN npm run build


# Create a runtime container
FROM nginx:1.27-alpine AS runtime

# Update packages
RUN apk update && apk upgrade

# Copy Nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf
# Copy built Angular project
COPY --from=builder /app/dist/user-agent/ /usr/share/nginx/html
