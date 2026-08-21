const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const monorepoRoot = path.resolve(__dirname, '..', '..');
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules');
const babelRuntimeInteropDefault = path.join(
	rootNodeModules,
	'@babel/runtime/helpers/interopRequireDefault.js',
);

const config = {
	watchFolders: [
		rootNodeModules,
		path.join(monorepoRoot, 'apps', 'mobile'),
		path.join(monorepoRoot, 'packages', 'core'),
		path.join(monorepoRoot, 'packages', 'payments'),
	],
	resolver: {
		nodeModulesPaths: [rootNodeModules],
		resolveRequest(context, moduleName, platform) {
			if (moduleName === '@babel/runtime/helpers/interopRequireDefault') {
				return {
					type: 'sourceFile',
					filePath: babelRuntimeInteropDefault,
				};
			}

			return context.resolveRequest(context, moduleName, platform);
		},
		extraNodeModules: {
			'@babel/runtime': path.join(rootNodeModules, '@babel/runtime'),
			'@haulmer/core': path.join(monorepoRoot, 'packages', 'core'),
			'@haulmer/payments': path.join(monorepoRoot, 'packages', 'payments'),
			react: path.join(rootNodeModules, 'react'),
			'react-native': path.join(rootNodeModules, 'react-native'),
		},
	},
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
