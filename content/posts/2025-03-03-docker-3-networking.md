---
title: "Docker networking"
meta_title: ""
description: "A lot about Docker networking" 
date: 2025-03-03T13:37:00Z
image: "/images/fhc1_fhc.svg"
categories: ["containers", "docker"]
author: "Peter Nylander"
tags: ["docker", "containers"]
draft: true
---

## Introduction
Continuing my series on containers, let's look at how Docker networking works. When you run containers, you often need to connect them to each other or to the outside world.
Docker networking provides several options for networking containers together and connecting them to the outside world.

Previous posts in this series:
- [SQL Server 2022 using Docker](/posts/sql-server-2022-using-docker/)
- [Running a web server in a container](/posts/running-a-web-server-in-a-container/)
- [Running a web server in a container using Docker Compose](/posts/running-a-web-server-in-a-container-using-docker-compose/)

## Default network
When you install Docker, it creates three networks by default:
- `bridge`: This is the default network that containers are attached to. It allows containers to communicate with each other and the host machine.
- `host`: This network removes the network isolation between the container and the host machine. The container uses the host's network stack.
- `none`: This network disables networking for the container.
- `overlay`: This network is used when you want to create a multi-host network.

## Bridge network
The `bridge` network is the default network that containers are attached to. It allows containers to communicate with each other and the host machine. When you start a container, Docker connects it to the `bridge` network by default.

You can create your own bridge network using the following command:
```sh
docker network create my-bridge-network
```

### List all networks
You can list all networks using the following command:
```sh
docker network ls
```


## Advanced example of Docker networking
Let's create a more advanced example of Docker networking. In this example, we define the requirements for a network of containers that communicate with each other.
The example consists of the following services:
1. A reverse proxy that forwards all traffic to either the frontend or the api.
2. A frontend web application that communicates with the api.
3. A RESTful API that provides data to the frontend.
4. A database that stores the data for the API. The database should only be accessible from the API.

The only service that is accessible from the outside world is the reverse proxy. The frontend, API, and database are not accessible from the outside world. 

To set up this network, we need to create three networks:
- 'public' - This network is where the proxy container is located. It is the only network that is accessible from the outside world.
- 'internal' - In this network, the frontend and API containers are located. This network is not accessible from the outside world.
- 'database' - This network is used to connect the database container to the API container. The api container is connected to both the internal and database networks.

```sh
docker network create public
docker network create internal
docker network create database
```

### Start the containers
Now that we have created the networks, we can start the containers.

```sh
docker run -d --name proxy --network public nginx
docker run -d --name frontend --network internal my-frontend-image
docker run -d --name api --network internal --network database my-api-image
docker run -d --name database --network database my-database-image
```

### Connect the containers
Now that the containers are running, we need to connect them to the correct networks.

```sh
docker network connect database api
```

### Verify the network setup
To verify that the network setup is correct, you can use the following command to inspect the networks.

```sh
docker network inspect public
docker network inspect internal
docker network inspect database
```

### Docker Compose
You can also use Docker Compose to define the network setup. Here is an example of a `docker-compose.yml` file that defines the network setup.

```yaml
version: '3'

services:
  proxy:
    image: nginx
    networks:
      - public

  frontend:
    image: my-frontend-image
    networks:
      - internal

  api:
    image: my-api-image
    networks:
      - internal
      - database

  database:
    image: my-database-image
    networks:
      - database

networks:
  public:
  internal:
  database:
```


