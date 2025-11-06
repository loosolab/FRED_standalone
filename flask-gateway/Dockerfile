# Build Flask API
FROM python:3.11 as flask-api

RUN apt-get update && apt-get install -y \
    python3-pip
WORKDIR /app
COPY . /app
RUN pip3 install -r requirements.txt


EXPOSE 5000
CMD ["python", "app.py"]