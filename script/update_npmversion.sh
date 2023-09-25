#!/bin/bash

# Update npm version in package.json files
#
# Approximating functionality from:
# https://github.com/semantic-release/npm/blob/master/lib/prepare.js#L14
#
# This script will update the package.json version to the version provided by 
# the release semantic-release pipeline.
# 
# To be used with @semantic-release/exec before @semantic-release/git.
# The version should be consistent with the most recent git tag.
#
# Usage: ./update_npmversion.sh <version>
# Example: ./update_npmversion.sh 1.0.0
#
# Note: for mac users, install GNU SED and add it to your PATH variable
# https://formulae.brew.sh/formula/gnu-sed


# load version from args
VERSION=$1

echo "Updating client-app version to: $VERSION"
WEBSITE_JSON=$(realpath website/package.json)
# replace contents of {"version": "x", ...} with {version: "$VERSION"}
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/g" $WEBSITE_JSON

echo "Updating root package version to: $VERSION"
ROOT_JSON=$(realpath package.json)
# replace contents of {"version": "x", ...} with {version: "$VERSION"}
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/g" $ROOT_JSON
