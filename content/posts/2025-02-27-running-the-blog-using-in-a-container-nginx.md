---
title: "Running the blog in a container using nginx"
meta_title: ""
description: "In this post, we will look at how to run this blog in a container using nginx."
date: 2025-02-27T11:37:00Z
image: "/images/nginx.svg"
coverImage: "/images/nginx.svg"
categories: ["containers", "nginx"]
author: "Peter Nylander"
tags: ["docker", "nginx", "containers"]
draft: true
---

## Introduction
NGINX is a popular web server that is known for its high performance and low resource usage. It is commonly used to serve static content, such as HTML files, CSS files, and images.
It was created by Igor Sysoev and first released in 2004. Learn more about NGINX [here](https://www.nginx.com/).
In this post, we will look at how to run this blog in a container using NGINX. This is a great way to test the blog locally without having to install a web server on your local machine.
  
## Building the blog
Before we can run the blog in a container, we need to build the blog. Browse to the root of the blog and run the following command.
```sh
npm run build
```

## Pulling the image
Let's start by pulling the NGINX image from Docker Hub by running the following command. This isn't strictly necessary, as the image will be pulled automatically when we create the container, but it's a good idea to pull the image beforehand to avoid any issues.
```sh
docker pull nginx
```

## Create the container
When the image is downloaded, we will create the container and mount the content of the blog to the container. This way, we can easily update the content without having to rebuild the image.
```sh
docker run --name nginx-astro -p 80:80 -v ${pwd}/dist:/usr/share/nginx/html nginx
```

If you want to start the container in detached mode, you can add the `-d` flag to the `docker run` command.
```sh	
docker run --name nginx-astro -p 80:80 -v ${pwd}/dist:/usr/share/nginx/html -d nginx
```

The container is exposed on port 80, which is the default port for HTTP traffic. The content of the blog is mounted to `/usr/share/nginx/html` in the container. This is the default location for the NGINX web server. ${pwd} is the current directory where the command is run.
Browse to `http://localhost` to access the blog.

Note that the blog is not running in development mode, so you will not be able to see changes in real-time. You will have to rebuild the blog and restart the container to see the changes.

## Creating a custom NGINX configuration

If you want to use a custom NGINX configuration, you can mount the configuration file to the container. Create a file named `nginx.conf` in the root of the blog with the following content.
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
    }
}
```

Mount the configuration file to the container by adding the `-v` flag to the `docker run` command.
```sh
docker run --name nginx-astro -p 80:80 -v ${pwd}/dist:/usr/share/nginx/html -v ${pwd}/nginx.conf:/etc/nginx/nginx.conf -d nginx
```

The custom configuration file is mounted to `/etc/nginx/nginx.conf` in the container overriding the default configuration file.

## Building the image
If you want to build the image yourself, you can create a `Dockerfile` in the root of the blog with the following content.
```Dockerfile
FROM node:lts AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

The dockerfile consists of two stages. The first stage builds the blog, and the second stage copies the built blog to the NGINX image.
The build stage uses the `node:lts` image, which is a Node.js image with the latest LTS version of Node.js installed. Then the working directory is set to `/app` in the container, `package.json` and `package-lock.json` is copied to the container, the dependencies are installed, and the blog is built.

In the second stage, the `nginx:alpine` image is used, which is a lightweight NGINX image based on Alpine Linux.
The built blog is copied from the build stage to `/usr/share/nginx/html` in the container. This is the default location for the NGINX web server.
At last, port 80 is exposed to allow HTTP traffic to the container.

To build the image, run the following command.
```sh
docker build -t my-blog .
```