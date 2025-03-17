// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Apply graceful-fs patch to handle EMFILE errors
require("./graceful-fs-patch");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Configure Metro to handle a large number of files
config.watchFolders = [__dirname];

// Exclude unnecessary folders from being watched
config.resolver = config.resolver || {};
config.resolver.blockList = [/\.git\/.*/];

// Add file watcher config to prevent EMFILE errors
config.watcher = {
  ...config.watcher,
  watchman: {
    deferStates: ["hg.update"]
  },
};

// Add custom resolver aliases
config.resolver.alias = {
  '@': path.resolve(__dirname, './app'),
  '@components': path.resolve(__dirname, './app/components'),
  '@context': path.resolve(__dirname, './app/context'),
  '@lib': path.resolve(__dirname, './app/lib')
};

// Reduce the number of workers to prevent resource exhaustion
config.maxWorkers = Math.max(1, (process.env.MAX_WORKERS ? parseInt(process.env.MAX_WORKERS, 10) : 4));

// Export the config with NativeWind support
module.exports = withNativeWind(config, {
  input: './tailwind.css',
  configPath: './tailwind.config.js'
});
