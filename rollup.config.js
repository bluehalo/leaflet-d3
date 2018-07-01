const
	path = require('path'),
	pkg = require('./package.json');

export default {
	input: path.posix.resolve('src/js/index.js'),
	external: [
		'd3',
		'd3-hexbin',
		'leaflet'
	],
	output: {
		banner: `/*! ${pkg.name} - ${pkg.version} - ${pkg.copyright} + */`,
		file: path.posix.join('./dist', `${pkg.artifactName}.js`),
		format: 'umd',
		globals: {
			'd3': 'd3',
			'd3-hexbin': 'd3.hexbin',
			'leaflet': 'L'
		},
		name: pkg.moduleName,
		sourcemap: true
	}
};
