---
title: "How do you run an ASP.NET Core application with HTTPS in a container?"
meta_title: ""
description: "In this post we take a look at how to run an ASP.NET Core application with HTTPS in a container."
date: 2025-03-14T11:31:00Z
image: "/images/fhc1_fhc.svg"
coverImage: ""
categories: ["containers", "aspnet-core"]
author: "Peter Nylander"
tags: ["docker", "containers", "aspnet-core", "https"]
draft: false
---

In this post we take a look at how to run an ASP.NET Core application with HTTPS in a container.

## Running an ASP.NET Core application with HTTPS

```bash
docker run --rm -it -p 8000:80 -p 8001:443 -e ASPNETCORE_ENVIRONMENT=LocalDevelopment -e ASPNETCORE_URLS="https://+;http://+" -e ASPNETCORE_HTTPS_PORT=8001 -e ASPNETCORE_Kestrel__Certificates__Default__Password="docker" -e ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx -v $env:USERPROFILE\.aspnet\https:/https/ -v $env:APPDATA\microsoft\UserSecrets\:/root/.microsoft/usersecrets odin/api:latest
```