---
title: "Getting started with containers"
meta_title: ""
description: "What is a container and how do you get started with using containers?"
date: 2025-03-14T00:00:00Z
categories: ["containers"]
author: "Peter Nylander"
tags: ["docker", "podman"]
draft: false
---

This is the first post in a series of posts about containers. In this post, we will take a look at what a container is and how you can get started with using containers.

## Introduction
Container images and containers are closely related but distinct concepts in containerization technology.
A container image is an immutable, static file that includes everything needed to run a piece of software, including the code, a runtime, libraries, environment variables, and configuration files.
Think of it as a read-only template containing instructions for creating a container and can be easily shared, versioned and deployed across different environments.

A container on the other hand is a running instance of a container image. It is an executable unit of software that packages application code along with its dependencies. Containers can be modified during their lifecycle and can be stopped, started, and deleted. They provide a lightweight, isolated environment for running applications.

An image is composed of multiple layers. Each layer represents a change to the image. When you run a container from an image, the container is created by stacking the layers on top of each other. This allows you to reuse layers across multiple images and containers, which makes images lightweight and fast to download and run.
The image is typically defined in a Dockerfile, which is a text file that contains a set of instructions for building the image. We will take a closer look at Dockerfiles in a later post.

## How do you get started with containers?
To get started with containers you need to install a container runtime. The most popular container runtime is Docker. Docker is a platform for developing, shipping, and running applications in containers. Docker provides the ability to package and distribute applications as containers, which are isolated environments that contain everything an application needs to run.
Other alternatives to Docker are Podman, containerd and Rancher. I will be using Docker in this series of posts but also briefly touch on Podman in a later post.

### Where do you get container images?
Container images are typically stored in a container registry. A container registry is a repository for storing and distributing container images. The most popular container registry is Docker Hub, which is a public registry that contains thousands of container images that you can use to run containers. But there are also other public registries such as Microsoft Container Registry (MCR), Google Container Registry (GCR), and Amazon Elastic Container Registry (ECR) as well as GitHub Container Registry (GHCR). You can also run your own private registry if you want to keep your images private. A good choice for a private registry is Azure Container Registry (ACR).

### Installing Docker
Start by installing Docker on your system. Download from here https://www.docker.com/products/docker-desktop
Then follow the setup guide.

## Running containers
A docker image is not useful if it is not running. When you run a container from an image, you create an instance of the image. The container is a running instance of the image.
Let's explore how to run a container with Docker and some of the options that you can use when running a container.

The first thing you need to do is to pull an image from a registry. You can do this by using the **docker pull** command followed by the name of the image.
```bash
docker pull nginx
```

Once you have pulled an image you can run a container from the image by using the **docker run** command followed by the name of the image.
```bash
docker run nginx
```

This will run the nginx container in the foreground and you will see the output from the container in the terminal. To stop the container you can press **Ctrl+C**.
You can skip the pull step and run the container directly by using the **docker run** command followed by the name of the image. Docker will automatically pull the image if it is not already available.

If you want to automatically remove the container when it exits you can use the **--rm** flag.
```bash
docker run --rm nginx
```

### Port mapping aka publishing ports
In the last example above we ran the nginx container without any options. This will run the container in the foreground and you will see the output from the container in the terminal. But there's no way to interact or communicate with the container from the host. To be able to interact with the container from the host you need to map a port on the host to a port on the container.
To map a port you use the **-p** flag followed by the port on the host and the port on the container. The p parameter actually stands for publish and it is used to publish a container's port(s) to the host.

For example, if you want to run nginx in a container that listens on port 8080 on the host and port 80 on the container you use the -p flag like this **-p 8080:80**.
```bash
docker run -p 8080:80 nginx
```

This will allow you to access the web server from the host by going to http://localhost:8080 in your browser. Multiple ports can be mapped by using the -p flag multiple times like this:
```bash	
docker run -p 10000:10000 -p 10001:10001 -p 10002:10002 mcr.microsoft.com/azure-storage/azurite:latest
```

### Detached mode and logs
When you run a container with Docker you can run it in detached mode by using the **-d** flag. This will run the container in the background.
```bash
docker run -d -p 8080:80 nginx
```

When the command above is run docker will output the container id of the container that was started. You can use this id to view the logs of the container. It's enough to use the first few characters of the container id.
```bash
docker logs <container-id>
```

You can attach to a running container by using the **docker attach** command followed by the container id.
```bash
docker attach <container-id>
```

This is the same thing as running the container without the **-d** flag. The container will run in the foreground and you will see the output from the container in the terminal.

### Naming containers
When you run a container with Docker you can give it a name by using the **--name** flag. This can be useful if you want to refer to the container by name instead of by id. 
It's also useful if you want to run multiple containers of the same image, then you can give each container a unique name.
```bash
docker run --name my-container -d -p 8080:80 nginx
```

### Shell access and interactive mode
If we want to run a command in the container we can use the **docker exec** command followed by the container id and the command we want to run.
```bash
docker exec -it <container-id> ls
```
In the example above we are running the **ls** command in the container. The **-it** flag is short for interactive and tty aka interactive terminal.
Another example could be pwd to print the working directory or bash to start a bash shell in the container.
```bash
docker exec -it <container-id> pwd
docker exec -it <container-id> bash
```

Let's say you want to edit the index.html file nginx which is located in the /usr/share/nginx/html directory. Since there's no editor in the container you can't edit the file directly in the container but we can install an editor in the container and then edit the file for example with nano. First start a bash shell in the container.
```bash
docker exec -it <container-id> bash
```
Then install nano in the container.
```bash
root@3a510dcc4e49:/# apt-get update && apt-get install nano
```

Now you can edit the index.html file with nano.
```bash
root@3a510dcc4e49:/# nano /usr/share/nginx/html/index.html
```

Refresh the browser to see the changes.

### Bind mounts
Ok, so we have seen how to install and run an editor in the container to edit a file. But what if we want to edit the file on the host and have the changes reflected in the container? This is where bind mounts come in.
You can mount a volume from the host to a directory in the container by using the **-v** flag. The v parameter actually stands for volume and it is used to bind mount a volume from the host to the container.
Nginx is a web server and it serves files from the /usr/share/nginx/html directory. If you want to serve files from a directory on the host you can bind mount the directory to the container.

Let's map our local folder . to the /usr/share/nginx/html directory in the container. On your host create a folder called html and add an index.html file to it and then run the container with the -v flag.
```bash
docker run -d -p 8080:80 -v .:/usr/share/nginx/html nginx
```

Refresh the browser to see the changes.

To verify that the changes are actually loaded from the mounted volume let's start another container using the same image but not mounting the volume.
```bash
docker run -rm -d -p 8081:80 nginx
```

Refresh the browser to see that the changes are not loaded from the mounted volume.

### Volume mounts
Volume mounts is another way to mount a volume from the host to the container. The difference between bind mounts and volume mounts is that volume mounts are managed by Docker and are stored in a directory on the host. Bind mounts are managed by the user and can be stored anywhere on the host.
To create a volume you use the **docker volume create** command followed by the name of the volume.
```bash
docker volume create my-volume
```

And then use it when you run the container.
```bash
docker run -d -p 8080:80 -v my-volume:/usr/share/nginx/html nginx
```

Volume mounts can also be created using Docker Desktop by going the Volumes tab in the Docker Desktop UI.

### Listing running containers
To view all running containers you use the **docker ps** command.
```bash
docker ps
```

To view all containers, including stopped containers, you use the **docker ps -a** command.
```bash
docker ps -a
```

### Stopping containers
If you need to stop a container you can use the **docker stop** command followed by the container id.
```bash
docker stop <container-id>
```

### Removing containers
When you are done with a container and you want to remove it you can use the **docker rm** command followed by the container id.
```bash
docker rm <container-id>
```

### Environment variables
You can set environment variables in the container by using the **-e** flag followed by the name of the environment variable and its value.
```bash
docker run -d -p 8080:80 -e MY_ENV_VAR=my-value nginx
```

## Summary
In this post, we have taken a look at what a container is and how you can get started with using containers. We have seen how to install Docker, pull images from a registry, run containers, map ports, run containers in detached mode, view logs, attach to running containers, name containers, run commands in containers, bind mounts, volume mounts, list running containers, stop containers, remove containers, and set environment variables in containers.

In the next post, we will take a closer look at Dockerfiles and how to build custom images.

## Reference
- [Docker documentation](https://docs.docker.com/)
- [Docker run reference](https://docs.docker.com/engine/reference/run/)

### Docker run options
- **-d** - Run the container in the background.
- **-p** - Publish a container's port(s) to the host.
- **-v** - Bind mount a volume.
- **-rm** - Automatically remove the container when it exits.
- **-it** - Run the container in interactive mode.
- **-e** - Set an environment variable in the container.

### Docker commands cheat sheet.

| Command                                                       | Description                   |
| ------------------------------------------------------------- | ----------------------------- |
| `docker --help`                                               | Show help                     |
| `docker images`                                               | List all images               |
| `docker pull <image-name>`                                    | Pull an image                 |
| `docker run <image-name> `                                    | Run a container               |
| `docker ps`                                                   | List all running containers   |
| `docker ps -a`                                                | List all containers           |
| `docker stop <container-id>`                                  | Stop a container              |
| `docker rm <container-id>`                                    | Remove a container            |
| `docker exec -it <container-id> ls`                           | List all files in a container |
| `docker exec -it <container-id> <command>`                    | Run a command in a container  |
| `docker cp <container-id>:/path/to/file /path/to/destination` | Copy a file from a container  |
| `docker images`                                               | List all images               |
|                                                               |                               |