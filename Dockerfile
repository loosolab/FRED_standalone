# Build Angular frontend
FROM node:18.10.0 as angular-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --force
COPY . .
ARG buildname
RUN npm run $buildname

# Build Flask API
FROM python as flask-api

RUN apt-get update && apt-get install -y \
    python3-pip
WORKDIR /app
COPY . /app
RUN pip3 install -r requirements.txt

# Final image
FROM nginx:alpine
RUN apk update && apk upgrade
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY --from=angular-build /app/dist/self-service-website/ /usr/share/nginx/html
COPY --from=flask-api /app /app
EXPOSE 80

CMD ["python3", "gateway_api.py"]
