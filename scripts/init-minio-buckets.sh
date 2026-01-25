#!/bin/bash
# Initialize MinIO Buckets for Source Code Fusion
# Run this script after MinIO is available

MINIO_ENDPOINT="http://192.168.110.246:9000"
MINIO_ACCESS_KEY="OGt2EahfvShE8yYh0a3i"
MINIO_SECRET_KEY="svB22CuhcjFtGLmhfYi3rUasa2lIQd7MuZ2W4RT7"

# Configure mc alias
mc alias set nexus $MINIO_ENDPOINT $MINIO_ACCESS_KEY $MINIO_SECRET_KEY

# Create buckets for each subsystem
mc mb nexus/nexus-public --ignore-existing
mc mb nexus/nexus-crm --ignore-existing
mc mb nexus/nexus-okr --ignore-existing
mc mb nexus/nexus-finance --ignore-existing
mc mb nexus/nexus-products --ignore-existing
mc mb nexus/nexus-lms --ignore-existing
mc mb nexus/nexus-docs --ignore-existing
mc mb nexus/nexus-sys --ignore-existing

# Set public read policy for public bucket
mc anonymous set download nexus/nexus-public

echo "MinIO buckets created successfully!"
