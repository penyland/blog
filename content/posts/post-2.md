---
title: "Running PostgreSQL in a container and managing it with pgAdmin"
meta_title: ""
description: "meta description"
date: 2025-02-13T19:53:00Z
image: "/images/posts/01.jpg"
categories: ["containers", "postgres", "databases"]
author: "Peter Nylander"
tags: ["docker", "podman", "postgresql", "databases"]
draft: false
---

# Running PostgreSQL in a container and managing it with pgAdmin.
In this post, we will look at how to run a PostgreSQL database and pgAdmin in containers on your local machine.
This is a great way to get started with PostgreSQL without having to install it on your local machine.

## Pulling the image
Start by pulling the PostgreSQL image from Docker Hub by running the following command.
```
docker pull postgres
```
alternatively
```
podman pull postgres
```

## Create the container
Now that we have the image, we can create a container by running the following command.
```
docker run --name postgres -e POSTGRES_PASSWORD=mysecretpassword -v postgres-data:/var/lib/postgresql/data -p 5432:5432 -d postgres
```
alternatively
```
podman run --name postgres -e POSTGRES_PASSWORD=mysecretpassword -v postgres-data:/var/lib/postgresql/data -p 5432:5432 -d postgres
```

We set the password for the database by setting the environment variable `POSTGRES_PASSWORD`, in this case, to `mysecretpassword`. You should of course replace this with a more secure password.
We also mount a volume to store the data for the database. This way, the data will persist even if the container is removed. The volume is created using the desktop clients Volume feature.
I tried to use the `-v` flag to create a volume, but it did not work with Podman. Instead, I had to create the volume using the desktop client.

The container is exposed on port 5432, which is the default port for PostgresSQL.

## Installing pgAdmin4
Now let's install pgAdmin4 to manage the database. PgAdmin4 is a web-based tool for managing PostgresSQL databases.

First start by pulling the image from Docker Hub.
```
docker pull dpage/pgadmin4
```
alternatively
```
podman pull dpage/pgadmin4
```

Now create the container by running the following command.
```
docker run --name pgadmin -p 5051:80 -e "PGADMIN_DEFAULT_EMAIL=user@domain.com" -e "PGADMIN_DEFAULT_PASSWORD=mysecretpassword" -d dpage/pgadmin4
```
alternatively
```
podman run --name pgadmin -p 5051:80 -e "PGADMIN_DEFAULT_EMAIL=user@domain.com" -e "PGADMIN_DEFAULT_PASSWORD=mysecretpassword" -d dpage/pgadmin4
```

Change the email to a valid email address and the password should be the same as the one you set for the PostgresSQL database.

Browse to `http://localhost:5051` to access pgAdmin4. You can now connect to the PostgresSQL database by adding a new server and entering the connection details.

### Adding a new server
On the dashboard, click on `Add New Server`. Enter a name for the server and go to the `Connection` tab.
Here you need to add the ip address of the PostgresSQL container. You can find this by running the following command.
```
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres
```
alternatively
```
podman inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres
```

In my case, the ip address was `10.88.0.15`. Enter this in the `Host name/address` field. The port should be `5432` and the username is `postgres`. The password is the one you set when creating the container.
Your ip address will most likely be different, so make sure to use the correct one.

Now you should be able to connect to the PostgresSQL database and start working with it.

### Links
https://medium.com/@marvinjungre/get-postgresql-and-pgadmin-4-up-and-running-with-docker-4a8d81048aea
https://www.baeldung.com/ops/postgresql-docker-setup