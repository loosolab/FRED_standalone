# Build Flask API
FROM python:3.11 as flask-api

RUN apt-get update && apt-get install -y \
    python3-pip
WORKDIR /app
COPY . /app
RUN pip3 install -r requirements.txt
# Ensure the 'saved' folder exists and is writable
RUN mkdir -p /app/saved_metadata && chmod 777 /app/saved_metadata
RUN mkdir -p /app/tmp && chmod 777 /app/tmp

EXPOSE 5000
# CMD ["python", "app.py"]
CMD ["gunicorn", "--workers=1","--bind", "0.0.0.0:5000", "app:app"]