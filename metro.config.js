// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add watchFolders configuration
config.watchFolders = [__dirname];

// Exclude problematic directories from watching
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/lightningcss-darwin-arm64/,
];

// Increase max workers and memory limit
config.maxWorkers = 2;
config.transformer.minifierConfig = {
  compress: { reduce_vars: false },
};

// Configure cache
config.cacheStores = [];

// Configure resolver
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

// Disable source maps in development to reduce memory usage
config.transformer.devConfiguration = {
  dev: true,
  minify: false,
  generateSourceMaps: false,
};

module.exports = config;