---
title: "Trying out Podman as an alternative to Docker."
meta_title: ""
description: "meta description"
date: 2025-02-16T22:45:00Z
image: "/images/fhc1_fhc.svg"
coverImage: "/images/fhc1_fhc.svg"
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
To run a container with Podman it essentially the same as with Docker. The only difference is that you use the **podman** command instead of **docker**.

Below is an example of running the Azurite container with Podman.
```bash
podman run -d -p 10000:10000 -p 10001:10001 -p 10002:10002 -v c:/Temp/azurite:/data mcr.microsoft.com/azure-storage/azurite:latest
```

## Using Podman with the Docker extension for VS Code

To use Podman with the Docker extension for VS Code, you need to set the **DOCKER_HOST** environment variable to point to the Podman socket.

Open settings and find the key Docker:Environment. Add the value below.

```bash
DOCKER_HOST = npipe:////./pipe/podman-machine-default`
```

Picture of the settings in VS Code.
![alt text](/images/posts/post-1-image-1.png)

---