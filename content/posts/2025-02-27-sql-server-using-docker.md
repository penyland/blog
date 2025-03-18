---
title: "SQL Server 2022 using Docker"
meta_title: ""
description: "How do you run SQL Server 2022 in a container using Docker on Windows?" 
date: 2025-02-27T13:37:00Z
headerText1: "Hello SQL!"
categories: ["containers", "sqlserver"]
author: "Peter Nylander"
tags: ["docker", "sqlserver", "containers"]
draft: false
---

## Introduction
Continuing on the theme of running services in containers, let's look at how to run SQL Server 2022 in a container using Docker. This is a great way to test SQL Server locally without having to install it on your local machine.

Link: https://learn.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker?view=sql-server-ver16&tabs=cli&pivots=cs1-powershell

## Pull and run the SQL Server Linux container image
To run SQL Server in a Docker container, you need to pull the SQL Server Linux container image from the Microsoft Container Registry. You can do this by running the following command.
```sh
docker pull mcr.microsoft.com/mssql/server:2022-latest
```

As I want to persist the data in the container, I have to create a volume to store the data.
```sh
docker volume create sqldb-data
```

Run the container use the following command.
```powershell frame="terminal"
docker run `
  -e "ACCEPT_EULA=Y" `
  -e "MSSQL_SA_PASSWORD=TestPassword123#" `
  -e "MSSQL_PID=Developer" `
  -e "MSSQL_AGENT_ENABLED=true" `
  -p 1433:1433 `
  -d `
  --name sqlcontainerwsl `
  --hostname sqlcontainerwsl `
  -v sqldb-data:/var/opt/mssql `
  mcr.microsoft.com/mssql/server:2022-latest
```

This starts a new container named `sqlcontainerwsl` with the SQL Server 2022 image. The container is exposed on port 1433, which is the default port for SQL Server. The `MSSQL_SA_PASSWORD` environment variable sets the password for the `sa` user. The `MSSQL_PID` environment variable sets the edition of SQL Server. The `MSSQL_AGENT_ENABLED` environment variable enables the SQL Server Agent service. A data volume named `sqldb-data` is created to store the data.

### Using a bind mount
Another option for storing data is to use a bind mount. We use the same command as above, but we replace the volume with a bind mount.
Change `-v sqldb-data:/var/opt/mssql` to `-v ${pwd}:/var/opt/mssql`.
This will mount the current directory to the `/var/opt/mssql` directory in the container.

Here I encountered a problem with the permissions on the mounted directory. The SQL Server container runs as the `mssql` user, and the user needs to have read and write permissions on the mounted directory.
This turned out to be a larger problem than I first thought. A solution is to change the user that the container runs as, but this is not recommended. 
After some research, I found [this](https://stackoverflow.com/a/66238175) question on StackOverflow that pointed me in the right direction.

In the [official documentation](https://learn.microsoft.com/en-us/sql/linux/sql-server-linux-docker-container-configure?view=sql-server-ver15&pivots=cs1-bash#persist), it says that the entire `/var/opt/mssql` folder cannot be mapped, however, the `data` subdirectory can be mapped without any trouble as well as the `log` and `secrets` subdirectories.

The command to run the container with a bind mount would then look like this.
```powershell
docker run `
  -e "ACCEPT_EULA=Y" `
  -e "MSSQL_SA_PASSWORD=TestPassword123#" `
  -e "MSSQL_PID=Developer" `
  -e "MSSQL_AGENT_ENABLED=true" `
  -p 1433:1433 `
  -d `
  --name sqlcontainerwsl `
  --hostname sqlcontainerwsl `
  -v ${pwd}/data:/var/opt/mssql/data `
  -v ${pwd}/log:/var/opt/mssql/log `
  -v ${pwd}/secrets:/var/opt/mssql/secrets `
  mcr.microsoft.com/mssql/server:2022-latest
```

`$pwd` is a PowerShell command that returns the current directory. This will mount the current directory to the `/var/opt/mssql/data`, `/var/opt/mssql/log`, and `/var/opt/mssql/secrets` directories in the container.

## Connect to SQL Server
Start by running SQL Server Management Studio (SSMS) and connect to the SQL Server instance running in the container. Use `localhost` as the server name, you don't need to specify a port if you are using the default port `1433`, `sa` as the login, and the password you set in the `MSSQL_SA_PASSWORD` environment variable.

![alt text](2025-02-27-sql-server-using-docker-01.png)

When you are connected, you can start working with SQL Server as you would with a regular installation.

## Create a database
So now we have started the SQL Server container, but we don't have a database to work with. Let's create a new database called `TestDB`.
```sql
CREATE DATABASE TestDB
```