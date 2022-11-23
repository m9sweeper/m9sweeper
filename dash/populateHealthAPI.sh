#!/bin/bash
echo "{\"branch_name\" : \"$(git rev-parse HEAD)\", \"commit_SHA\" : \"$(git rev-parse --abbrev-ref HEAD)\"}" > backend/health-api.json

