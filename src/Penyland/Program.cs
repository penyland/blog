return await Bootstrapper
    .Factory
    .CreateDefault(args)
    .AddThemeFromUri(new Uri("https://github.com/statiqdev/CleanBlog/archive/ad639891c4469a2c9fc1d16b0ef8f99e975e82d8.zip"))
    .AddWeb()
    .ConfigureSettings(settings =>
    {
        settings["GitHubBranch"] = Config.FromSetting<string>("GH_BRANCH", "main");
    })
    .DeployToGitHubPages(
        Config.FromSetting<string>("GH_OWNER", "penyland"),
        Config.FromSetting<string>("GH_REPO", "penyland.github.io"),
        Config.FromSetting<string>("PENYLAND_GITHUB_TOKEN"))
    .RunAsync();
