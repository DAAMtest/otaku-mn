module.exports = {
  expo: {
    name: "AnimetempO",
    slug: "animetempo",
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
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "animetempo",
      },
      // Increase the file watcher limit to prevent EMFILE errors
      watcherMaxFiles: 10000,
    },
    plugins: [
      [
        "expo-router",
        {
          asyncRoutes: true,
        },
      ],
      "expo-secure-store"
    ],
    // Optimize Metro packager options
    packagerOpts: {
      sourceExts: ["js", "jsx", "ts", "tsx", "json"],
      maxWorkers: 2,
      config: "metro.config.js",
    },
    scheme: "animetempo",
  },
};
