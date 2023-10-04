# Fred Standalone


## Requirements

- Docker

## Getting started

Clone the GIT repository with *submodules*.

```
# Clone the main repository
git clone https://gitlab.gwdg.de/loosolab/container/fred-standalone.git

# Change to the main repository directory
cd fred-standalone

# Initialize and update submodules
git submodule update --init --recursive

```

Use `docker-compose up` in the main repository folder to build and start the container.

The Angular Interface is listening on port `4200`.
The Flask APi is listening on port `5000`.

## Additional Information

If used on a VM use port-forwarding to access `localhost:4200` and `localhost:5000` from your browser.