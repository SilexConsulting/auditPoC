#!/bin/bash
set -e

# This script downloads Docker images used by OpenReplay from AWS ECR and other repositories
# and saves them to the /images directory for use in an offline K8s cluster.

# Create output directory if it doesn't exist
mkdir -p ../images

# AWS ECR registry for OpenReplay components
ECR_REGISTRY="public.ecr.aws/p1t3u8a3"

# OpenReplay components from the helm charts
OPENREPLAY_COMPONENTS=(
  "frontend"
  "alerts"
  "analytics"
  "assets"
  "assist"
  "assist-stats"
  "canvases"
  "chalice"
  "connector"
  "db"
  "ender"
  "heuristics"
  "http"
  "integrations"
  "quickwit"
  "sink"
  "sourcemapreader"
  "spot"
  "storage"
  "utilities"
  "peers"
  "api"
  "backend"
)
version="v1.22.0"
platform="linux/amd64"
# Database images with their tags
DATABASE_IMAGES=(
  "redis:7.2"
  "postgres:17.2.0"
  "minio/minio:2023.11.20"
  "clickhouse/clickhouse-server:25.1-alpine"
  "bitnami/kafka:3.3"
  "bitnami/zookeeper:latest"
)

# Tooling images
TOOLING_IMAGES=(
  "ghcr.io/kyverno/kyverno:latest"
)

echo "Starting to download OpenReplay images from AWS ECR..."

# Download OpenReplay component images from AWS ECR
for component in "${OPENREPLAY_COMPONENTS[@]}"; do
  echo "Pulling image: ${ECR_REGISTRY}/${component}"
  docker pull "${ECR_REGISTRY}/${component}:${version}" --platform ${platform} || echo "Failed to pull ${ECR_REGISTRY}/${component}, continuing..."
  
  echo "Saving image: ${ECR_REGISTRY}/${component} to ../images/${component}.tar"
  docker save "${ECR_REGISTRY}/${component}" -o "../images/${component}.tar" || echo "Failed to save ${ECR_REGISTRY}/${component}, continuing..."
done

echo "Starting to download database images..."

# Download database images
for image in "${DATABASE_IMAGES[@]}"; do
  echo "Pulling image: ${image}"
  docker pull "${image}" --platform ${platform} || echo "Failed to pull ${image}, continuing..."
  
  # Extract image name without tag for filename
  image_name=$(echo "${image}" | sed 's/\//-/g' | sed 's/:/-/g')
  
  echo "Saving image: ${image} to ../images/${image_name}.tar"
  docker save "${image}" -o "../images/${image_name}.tar" || echo "Failed to save ${image}, continuing..."
done

echo "Starting to download tooling images..."

# Download tooling images
for image in "${TOOLING_IMAGES[@]}"; do
  echo "Pulling image: ${image}"
  docker pull "${image}" --platform ${platform} || echo "Failed to pull ${image}, continuing..."
  
  # Extract image name without tag for filename
  image_name=$(echo "${image}" | sed 's/\//-/g' | sed 's/:/-/g')
  
  echo "Saving image: ${image} to ../images/${image_name}.tar"
  docker save "${image}" -o "../images/${image_name}.tar" || echo "Failed to save ${image}, continuing..."
done

echo "All images have been downloaded and saved to ../images/"
echo "You can now use these images in your offline K8s cluster."