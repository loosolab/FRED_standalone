FROM node:latest as build
WORKDIR /app
COPY package.json package-lock.json ./
COPY . .
RUN npm install
RUN npm run build --prod
# EXPOSE 4200
# CMD ng serve --host 0.0.0.0

FROM nginx:alpine
RUN apk update
RUN apk upgrade
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/angular-interface/browser/ /usr/share/nginx/html
EXPOSE 80