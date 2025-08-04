FROM alpine:latest
COPY . /app

ENTRYPOINT ["top", "-b"]