.PHONY: help install dev build start pnpm-install bun-install docker-build docker-up docker-down clean

help:
	@echo "Makefile commands (Bun & pnpm optimized):"
	@echo "  make bun-install  - Install dependencies with bun (ultra-fast)"
	@echo "  make pnpm-install - Install dependencies with pnpm"
	@echo "  make dev          - Run development server with bun"
	@echo "  make build        - Build production bundle with bun"
	@echo "  make start        - Start production server with bun"
	@echo "  make docker-build - Build docker image with oven/bun:alpine"
	@echo "  make docker-up    - Start services with docker-compose"
	@echo "  make docker-down  - Stop docker-compose services"
	@echo "  make clean        - Clean build artifacts and cache"

bun-install:
	bun install

pnpm-install:
	pnpm install

install:
	bun install

dev:
	bun run dev

build:
	bun run build

start:
	bun run server.ts

docker-build:
	docker build -t job-automation-toolkit:latest .

docker-up:
	docker compose up -d

docker-down:
	docker compose down

clean:
	rm -rf dist node_modules .bun
