# Fred Standalone

## Requirements

- Docker
- Docker Compose

## Getting started

Clone the GIT repository.

```
git clone https://gitlab.gwdg.de/loosolab/container/fred-standalone.git

```

Use `docker-compose up --build` in the main repository folder to build and start the container. Once the containers have been build only `docker-compose up` can be used.

The Angular Interface is listening on port `8080`.
The Flask APi is listening on port `5000`.

## Additional Information

If used on a VM use port-forwarding to access `localhost:8080` and `localhost:5000` from your browser.
