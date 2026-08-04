FROM golang:1.23-alpine AS build

WORKDIR /src
COPY apps/api/go.mod apps/api/go.sum ./
RUN go mod download
COPY apps/api ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/careeros-api ./cmd/api

FROM alpine:3.20
WORKDIR /app
RUN adduser -D -H careeros
COPY --from=build /out/careeros-api /app/careeros-api
COPY apps/api/migrations /app/migrations
COPY apps/api/seeds /app/seeds
USER careeros
EXPOSE 8080
CMD ["/app/careeros-api"]
