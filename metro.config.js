const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Apply graceful-fs patch to handle EMFILE errors
require("./graceful-fs-patch");

const config = getDefaultConfig(__dirname);

// Configure Metro to handle a large number of files
config.watchFolders = [__dirname];

// Exclude unnecessary folders from being watched
config.resolver = config.resolver || {};
config.resolver.blockList = [/\.git\/.*/];

// Add file watcher config to prevent EMFILE errors
config.watcher = {
  ...config.watcher,
  watchman: {
    deferStates: ["hg.update"],
    healthCheck: true,
  },
};

// Optimize the transformer
config.transformer = {
  ...config.transformer,
  minifierPath: "metro-minify-terser",
  minifierConfig: {
    // Terser options
    compress: { drop_console: false },
    mangle: true,
  },
};

// Reduce the number of workers to prevent resource exhaustion
config.maxWorkers = 2;

module.exports = withNativeWind(config, { input: "./global.css" });
