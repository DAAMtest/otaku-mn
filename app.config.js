module.exports = {
  expo: {
    name: "Otaku Mongolia",
    slug: "otaku-mongolia",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#111827",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#111827",
      },
    },
    web: {
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },
    extra: {
      // Increase the file watcher limit to prevent EMFILE errors
      watcherMaxFiles: 10000,
      eas: {
        projectId: "otaku-mongolia",
      },
    },
    plugins: [
      [
        "expo-router",
        {
          asyncRoutes: true,
        },
      ],
    ],
    // Optimize Metro packager options
    packagerOpts: {
      sourceExts: ["js", "jsx", "ts", "tsx", "json"],
      maxWorkers: 2,
      config: "metro.config.js",
    },
  },
};
