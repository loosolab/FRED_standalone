# Build Angular frontend
FROM node:18.10.0 as angular-build
WORKDIR /app/angular-interface
COPY angular-interface/package*.json ./
RUN npm install --force
COPY angular-interface/ .
ARG buildname
RUN npm run build --prod

# Build Flask API
FROM python as flask-api

RUN apt-get update && apt-get install -y \
    python3-pip
WORKDIR /app/flask-gateway
COPY flask-gateway/requirements.txt .
RUN pip3 install -r requirements.txt
COPY flask-gateway/ .
EXPOSE 5000
CMD ["python", "app.py"]

# Final image
FROM nginx:alpine
RUN apk update && apk upgrade
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=angular-build /app/angular-interface/dist/angular-interface /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
