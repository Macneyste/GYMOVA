// Metro configuration for an npm-workspaces monorepo.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch shared packages so edits in packages/* hot-reload.
config.watchFolders = [workspaceRoot];
// Resolve modules from the app first, then the hoisted workspace root.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules'), path.resolve(workspaceRoot, 'node_modules')];
// Hierarchical lookup stays enabled: npm nests some Expo packages (e.g. expo-asset) under expo/node_modules.

module.exports = config;
