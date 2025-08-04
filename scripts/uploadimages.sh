#!/bin/bash
set -e

# This script uploads Docker images saved in the /images directory to an Artifactory repository.
# Usage: ./uploadimages.sh <artifactory_repo_url>
# Example: ./uploadimages.sh myartifactory.example.com/docker-local

# Check if repository URL is provided
if [ $# -ne 1 ]; then
  echo "Error: Artifactory repository URL is required."
  echo "Usage: ./uploadimages.sh <artifactory_repo_url>"
  echo "Example: ./uploadimages.sh myartifactory.example.com/docker-local"
  exit 1
fi

ARTIFACTORY_REPO=$1
IMAGES_DIR="../images"

# Check if images directory exists
if [ ! -d "$IMAGES_DIR" ]; then
  echo "Error: Images directory $IMAGES_DIR does not exist."
  echo "Please run getimages.sh first to download the images."
  exit 1
fi

# Check if docker is available
if ! command -v docker &> /dev/null; then
  echo "Error: docker command not found. Please install Docker."
  exit 1
fi

# AWS ECR registry for OpenReplay components
ECR_REGISTRY="public.ecr.aws/p1t3u8a3"
version="v1.22.0"

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

# Function to upload an image with retry
upload_with_retry() {
  local image=$1
  local target_image=$2
  local max_retries=3
  local retry=0
  local success=false

  while [ $retry -lt $max_retries ] && [ "$success" = false ]; do
    echo "Pushing image: $target_image (Attempt $(($retry + 1))/$max_retries)"

    if docker push "$target_image"; then
      success=true
      echo "Successfully pushed: $target_image"
    else
      retry=$((retry + 1))

      if [ $retry -lt $max_retries ]; then
        echo "Failed to push image: $target_image. Retrying in 5 seconds..."
        sleep 5
      else
        echo "Failed to push image after $max_retries attempts: $target_image"
        return 1
      fi
    fi
  done

  return 0
}

echo "Starting to upload OpenReplay component images to Artifactory..."

# Upload OpenReplay component images
for component in "${OPENREPLAY_COMPONENTS[@]}"; do
  image_file="$IMAGES_DIR/${component}.tar"
  
  if [ -f "$image_file" ]; then
    echo "Loading image from $image_file..."
    docker load -i "$image_file" || { echo "Failed to load $image_file, continuing..."; continue; }
    
    # Get the original image name
    original_image="${ECR_REGISTRY}/${component}:${version}"
    
    # Create the new image name for Artifactory
    artifactory_image="${ARTIFACTORY_REPO}/${component}:${version}"
    
    echo "Tagging $original_image as $artifactory_image..."
    docker tag "$original_image" "$artifactory_image" || { echo "Failed to tag $original_image, continuing..."; continue; }
    
    # Push the image to Artifactory
    upload_with_retry "$original_image" "$artifactory_image" || continue
    
    # Add a small delay between pushes
    echo "Waiting 2 seconds before next push..."
    sleep 2
  else
    echo "Warning: Image file $image_file not found, skipping..."
  fi
done

echo "Starting to upload database images to Artifactory..."

# Upload database images
for image in "${DATABASE_IMAGES[@]}"; do
  # Extract image name without tag for filename
  image_name=$(echo "${image}" | sed 's/\//-/g' | sed 's/:/-/g')
  image_file="$IMAGES_DIR/${image_name}.tar"
  
  if [ -f "$image_file" ]; then
    echo "Loading image from $image_file..."
    docker load -i "$image_file" || { echo "Failed to load $image_file, continuing..."; continue; }
    
    # Extract repository and tag from the original image
    repo=$(echo "$image" | cut -d':' -f1)
    tag=$(echo "$image" | cut -d':' -f2)
    
    # Create the new image name for Artifactory
    # For images like redis:7.2, we want artifactory.example.com/redis:7.2
    # For images like minio/minio:2023.11.20, we want artifactory.example.com/minio/minio:2023.11.20
    artifactory_image="${ARTIFACTORY_REPO}/${repo}:${tag}"
    
    echo "Tagging $image as $artifactory_image..."
    docker tag "$image" "$artifactory_image" || { echo "Failed to tag $image, continuing..."; continue; }
    
    # Push the image to Artifactory
    upload_with_retry "$image" "$artifactory_image" || continue
    
    # Add a small delay between pushes
    echo "Waiting 1 second before next push..."
    sleep 1
  else
    echo "Warning: Image file $image_file not found, skipping..."
  fi
done

echo "Starting to upload tooling images to Artifactory..."

# Upload tooling images
for image in "${TOOLING_IMAGES[@]}"; do
  # Extract image name without tag for filename
  image_name=$(echo "${image}" | sed 's/\//-/g' | sed 's/:/-/g')
  image_file="$IMAGES_DIR/${image_name}.tar"
  
  if [ -f "$image_file" ]; then
    echo "Loading image from $image_file..."
    docker load -i "$image_file" || { echo "Failed to load $image_file, continuing..."; continue; }
    
    # Extract repository and tag from the original image
    repo=$(echo "$image" | cut -d':' -f1)
    tag=$(echo "$image" | cut -d':' -f2)
    
    # Create the new image name for Artifactory
    artifactory_image="${ARTIFACTORY_REPO}/${repo}:${tag}"
    
    echo "Tagging $image as $artifactory_image..."
    docker tag "$image" "$artifactory_image" || { echo "Failed to tag $image, continuing..."; continue; }
    
    # Push the image to Artifactory
    upload_with_retry "$image" "$artifactory_image" || continue
    
    # Add a small delay between pushes
    echo "Waiting 1 second before next push..."
    sleep 1
  else
    echo "Warning: Image file $image_file not found, skipping..."
  fi
done

echo "All images have been uploaded to $ARTIFACTORY_REPO"
echo "Upload process complete."