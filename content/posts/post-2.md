---
title: "C# Channel Producer Provider"
meta_title: ""
description: "meta description"
date: 2025-02-12T22:45:00Z
image: "/images/fhc1_fhc.svg"
coverImage: "/images/fhc1_fhc.svg"
categories: ["containers"]
author: "Peter Nylander"
tags: ["docker", "podman"]
draft: false
---

## Installing
```csharp
internal class ChannelProducerProvider : IChannelProducerProvider
{
    private readonly IServiceProvider serviceProvider;

    public ChannelProducerProvider(IServiceProvider serviceProvider) => this.serviceProvider = serviceProvider;

    public IDefaultChannelProducer GetDefaultProducer()
    {
        var defaultChannelProducer = serviceProvider.GetService<IDefaultChannelProducer>();

        return defaultChannelProducer!;
    }

    public IChannelProducer<T> GetProducer<T>()
    {
        var channelProducer = serviceProvider.GetService<IChannelProducer<T>>();

        return channelProducer ?? throw new InvalidOperationException($"No channel producer found for type {typeof(T).Name}");
    }

    public IChannelProducer GetProducer(string serviceKey)
    {
        var channelProducer = serviceProvider.GetKeyedService<IChannelProducer>(serviceKey);
        return channelProducer ?? throw new InvalidOperationException($"No channel producer found for service key {serviceKey}");
    }
}
```