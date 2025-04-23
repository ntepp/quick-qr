# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY . .

# Inject env var
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm install && npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
