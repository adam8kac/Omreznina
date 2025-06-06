#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

MAIN_APP_PATH="$PROJECT_ROOT/docker/Dockerfile"
IMAGE_NAME="java-app"

DNEVNA_STANJA_APP_PATH="$PROJECT_ROOT/docker/Dockerfile.parser"
IMAGE_PARSER_NAME="dnevna-stanja-helper"

MIN15_PREKORACITVE_APP_PATH="$PROJECT_ROOT/docker/Dockerfile.prekoracitev"
IMAGE_15_MIN_NAME="min15-stanja-helper"

PREDIKCIJA_APP_PATH="$PROJECT_ROOT/docker/Dockerfile.machinLearning"
PREDIKCIJA_NAME="prediction-model"

echo "Building Docker Image ${IMAGE_NAME} from ${MAIN_APP_PATH}"
docker build -f "$MAIN_APP_PATH" -t "$IMAGE_NAME" "$PROJECT_ROOT"
if [ $? -eq 0 ]; then
    echo "Build complete: ${IMAGE_NAME}"
else
    echo "Build failed: ${IMAGE_NAME}"
    exit 1
fi

echo "Building Docker Image ${IMAGE_PARSER_NAME} from ${DNEVNA_STANJA_APP_PATH}"
docker build -f "$DNEVNA_STANJA_APP_PATH" -t "$IMAGE_PARSER_NAME" "$PROJECT_ROOT"
if [ $? -eq 0 ]; then
    echo "Build complete: ${IMAGE_PARSER_NAME}"
else
    echo "Build failed: ${IMAGE_PARSER_NAME}"
    exit 1
fi

echo "🔨 Building Docker Image ${IMAGE_15_MIN_NAME} from ${MIN15_PREKORACITVE_APP_PATH}"
docker build -f "$MIN15_PREKORACITVE_APP_PATH" -t "$IMAGE_15_MIN_NAME" "$PROJECT_ROOT"
if [ $? -eq 0 ]; then
    echo "Build complete: ${IMAGE_15_MIN_NAME}"
else
    echo "Build failed: ${IMAGE_15_MIN_NAME}"
    exit 1
fi

echo "Building Docker Image ${PREDIKCIJA_NAME} from ${PREDIKCIJA_APP_PATH}"
docker build -f "$PREDIKCIJA_APP_PATH" -t "$PREDIKCIJA_NAME" "$PROJECT_ROOT"
if [ $? -eq 0 ]; then
    echo "Build complete: ${PREDIKCIJA_NAME}"
else
    echo "Build failed: ${PREDIKCIJA_NAME}"
    exit 1
fi
