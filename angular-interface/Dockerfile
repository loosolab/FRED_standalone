FROM node:18.10.0 as build
WORKDIR /app
COPY package.json package-lock.json ./
COPY . .
RUN npm install --force
RUN npm install -g @angular/cli@15
EXPOSE 4200
CMD ng serve --host 0.0.0.0


#FROM nginx:alpine
#RUN apk update
#RUN apk upgrade
#COPY config/nginx.conf /etc/nginx/nginx.conf
#COPY --from=build /app/dist/self-service-website/ /usr/share/nginx/html
#EXPOSE 80
