---
title: "Hello and welcome to my blog"
meta_title: ""
description: "meta description"
date: 2025-02-11T22:45:00Z
image: "/images/posts/01.jpg"
categories: ["containers"]
author: "Peter Nylander"
tags: ["docker", "podman"]
draft: false
---

Trying out Podman as an alternative to Docker.

## Installing
Start by installing Podman on your system. Download from here https://podman-desktop.io/
Then follow the setup guide.

## Running
podman run -d -p 10000:10000 -p 10001:10001 -p 10002:10002 -v c:/Temp/azurite:/data mcr.microsoft.com/azure-storage/azurite:latest

## Using Podman with the Docker extension for VS Code

To use Podman with the Docker extension for VS Code, you need to set the `DOCKER_HOST` environment variable to `npipe:////./pipe/podman-machine-default`.

Open settings and find the key Docker:Environment. Add the following value:

DOCKER_HOST = npipe:////./pipe/podman-machine-default

![alt text](/images/posts/post-1-image-1.png)