using Devlead.Statiq.Themes;

return await Bootstrapper
    .Factory
    .CreateDefault(args)
    .AddThemeFromUri(new Uri("https://github.com/statiqdev/CleanBlog/archive/ad639891c4469a2c9fc1d16b0ef8f99e975e82d8.zip"))
    .AddWeb()
    .RunAsync();
