FROM mcr.microsoft.com/vscode/devcontainers/go:1-1.23

RUN apt-get update && apt-get install -y \
    nodejs npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace