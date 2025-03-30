---
title: "Dockerfiles and how to build custom images."
meta_title: ""
description: "In this post, we will take a closer look at Dockerfiles and how to build custom images."
date: 2025-03-15T00:00:00Z
categories: ["containers"]
author: "Peter Nylander"
tags: ["docker", "dockerfile", "containers"]
draft: false
---

This is the second post in a series of posts about containers. In this post, we will take a closer look at Dockerfiles and how to build custom images.
Part 1 of this series can be found [here](2025-03-14-getting-started-with-containers).

## Introduction
Dockerfiles are used to build custom Docker images. A Dockerfile is a text document that contains all the commands a user could call on the command line to assemble an image. Using a Dockerfile allows you to automate the building of your Docker images.
A docker image consists of a series of layers. Each layer represents an instruction in the image’s Dockerfile. Each layer except the last one is read-only. When you change a Docker image, a new layer is created. This new layer is read-write and contains only the changes from the layer below it. This is why Docker images are so efficient and fast.

## The first Dockerfile
Let's create a simple Dockerfile that installs the `nginx` web server. Create a new directory and create a file called `Dockerfile` in that directory. Add the following content to the `Dockerfile`:

```Dockerfile
# Use the official nginx image as a base image
FROM nginx:latest

# Expose port 80
EXPOSE 80
```

This Dockerfile uses the official `nginx` image as a base image. The `FROM` instruction specifies the base image to use. The `EXPOSE` instruction exposes port 80 on the container.

```bash
docker build -t my-nginx-image .
```

This command builds a new Docker image based on the Dockerfile in the current directory. The `-t` flag is used to tag the image with a name. The `.` at the end of the command specifies the build context, which is the directory where the Dockerfile is located.

```bash
docker run -d -p 8080:80 my-nginx-image
```

Voila! You now have a running `nginx` web server in a Docker container. You can access the web server by navigating to `http://localhost:8080` in your web browser.

## Run a simple Node.js application
Let's create a more advanced Dockerfile that runs a simple Node.js application. Create a new directory and create a file called `Dockerfile` in that directory. Add the following content to the `Dockerfile`:

```Dockerfile
# Use the official Node.js image as a base image
FROM node:23-alpine AS base

# Set the working directory
WORKDIR /usr/src/app

# Copy hello.js to the working directory
COPY hello.js .

# Run the hello.js script
CMD ["node", "hello.js"]
```

This Dockerfile uses the node:23-alpine image as a base image as the base layer. Here I chose the alpine version of the Node.js image because it is a lightweight version of the image. The AS base instruction creates a named build stage called base. This allows you to reference the base stage later in the Dockerfile. Then it sets the working directory to `/usr/src/app` inside the container. It copies the `hello.js` file from the host machine to the working directory inside the container. Finally, it specifies the command to run when the container starts, which is `node hello.js`.

## A simple Node.js web server
Let's create a simple Node.js web server that listens on port 3000. Create a new file called `server.js` in the same directory as the Dockerfile and add the following content:

```javascript
const http = require('http');

const hostname = '';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

This Node.js script creates a simple web server that listens on port 3000 and responds with `Hello, World!` when a request is made.

```Dockerfile
# Use the official Node.js image as a base image
FROM node:23-alpine AS base

# Set the working directory
WORKDIR /usr/src/app

# Copy hello.js to the working directory
COPY server.js .

# Expose port 3000
EXPOSE 3000

# Run the server.js script
CMD ["node", "server.js"]
```

Build the Docker image and run the container:
```bash
docker build -t my-nodejs-server .
```

```bash
docker run --rm -d -p 3000:3000 my-nodejs-server
```

```bash
curl http://localhost:3000
```

Voila! You now have a running Node.js web server in a Docker container. You can access the web server by navigating to `http://localhost:3000` in your web browser.

That was easy, right? Now let's take a look at how you can optimize your Dockerfiles and make them more efficient.

## Optimize your Dockerfiles
When you build a Docker image, each instruction in the Dockerfile creates a new layer in the image. The more layers you have, the larger the image size will be. To optimize your Dockerfiles, you should try to minimize the number of layers in your image.

One way to do this is to combine multiple instructions into a single instruction. For example, instead of using multiple `RUN` instructions to install multiple packages, you can combine them into a single `RUN` instruction. This will reduce the number of layers in your image and make it smaller.

Another way to optimize your Dockerfiles is to use multi-stage builds. Multi-stage builds allow you to use multiple `FROM` instructions in a single Dockerfile. Each `FROM` instruction starts a new build stage, and you can copy files from one stage to another using the `COPY` instruction. This allows you to build your application in one stage and then copy the built application to a smaller base image in another stage. This can help reduce the size of your final image and make it more efficient.

### Build a multi-stage Dockerfile
Let's create a multi-stage Dockerfile that builds a simple Node.js application. Create a new directory and create a file called `Dockerfile` in that directory. Add the following content to the `Dockerfile`:

```Dockerfile
# Use the official Node.js image as a base image
FROM node:23-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

# Build the application
RUN npm run build

# Use a smaller base image for the final image
FROM node:23-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the built application from the build stage
COPY --from=build /usr/src/app/dist ./

# Expose port 3000
EXPOSE 3000

# Run the application
CMD ["node", "server.js"]
```

### Build a .NET application
We'll do one more example of a multi-stage build. This time we'll build a simple .NET ASP.NET Core application. And we'll test with the latest preview version of .NET 10.0.

Create a new directory and create a file called `Program.cs` and `Test.csproj` in that directory. Add the following content to the `Program.cs` file:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello, World!");
app.Run();
```

'Test.csproj' file:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

</Project>
```

```Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /app
COPY . .
RUN dotnet build -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview-alpine AS runtime
WORKDIR /app
COPY --from=build /app/build .
CMD ["dotnet", "Test.dll"]
```

This works great but we can also add a stage for publishing the application. Publishing the application will create a self-contained application that can be run on any machine without the need for the .NET runtime to be installed.

```Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build 
WORKDIR /app
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview-alpine AS runtime
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Test.dll"]
```

This Dockerfile has three stages. The first stage builds the application, the second stage publishes the application, and the third stage runs the application. This allows you to build and publish the application in separate stages, which can help reduce the size of the final image.

## Summary
In this post, we have taken a closer look at Dockerfiles and how to build custom images. We have created a simple Dockerfile that installs the `nginx` web server and a more advanced Dockerfile that runs a simple Node.js application. We have also optimized our Dockerfiles by combining multiple instructions into a single instruction and using multi-stage builds. This allows us to create more efficient and smaller Docker images.

