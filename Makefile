.PHONY: help install dev build start docker-build docker-up docker-down clean

help:
	@echo "Makefile commands:"
	@echo "  make install      - Install npm dependencies"
	@echo "  make dev          - Run development server"
	@echo "  make build        - Build production bundle"
	@echo "  make start        - Start production server"
	@echo "  make docker-build - Build docker image with alpine"
	@echo "  make docker-up    - Start services with docker-compose"
	@echo "  make docker-down  - Stop docker-compose services"
	@echo "  make clean        - Clean build artifacts and node_modules"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

docker-build:
	docker build -t job-automation-toolkit:latest .

docker-up:
	docker compose up -d

docker-down:
	docker compose down

clean:
	rm -rf dist node_modules
