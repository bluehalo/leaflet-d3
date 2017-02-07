'use strict';

let
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	path = require('path'),
	rollup = require('rollup'),
	runSequence = require('run-sequence'),

	plugins = gulpLoadPlugins(),
	pkg = require('./package.json');


// Banner to append to generated files
let bannerString = '/*! ' + pkg.name + '-' + pkg.version + ' - ' + pkg.copyright + '*/'

// Consolidating asset locations
let assets = {
	build: {
		js: 'gulpfile.js'
	},

	// Source files and directories
	src: {
		entry: 'src/js/index.js',
		js: 'src/js/**/*.js',
	},

	// Distribution related items
	dist: {
		dir: 'dist'
	}
};


/**
 * Validation Tasks
 */

gulp.task('validate-js', () => {

	return gulp.src([ assets.src.js, assets.build.js ])

		// ESLint
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());

});


/**
 * Build
 */

gulp.task('build-js', [ 'rollup-js' ], () => {

	// Uglify
	return gulp.src(path.join(assets.dist.dir, (pkg.artifactName + '.js')))
		.pipe(plugins.uglify({ preserveComments: 'license' }))
		.pipe(plugins.rename(pkg.artifactName + '.min.js'))
		.pipe(gulp.dest(assets.dist.dir));

});

gulp.task('rollup-js', () => {
	return rollup.rollup({
			entry: assets.src.entry
		})
		.then((bundle) => {
			return bundle.write({
				dest: path.join(assets.dist.dir, `${pkg.artifactName}.js`),
				format: 'umd',
				moduleName: 'leafletD3',
				sourceMap: true,
				banner: bannerString
			});
		});

});


/**
 * --------------------------
 * Main Tasks
 * --------------------------
 */

gulp.task('watch', [ 'build' ], () => {
	gulp.watch([ assets.src.js ], [ 'build' ]);
});

// Build and validate the JS
gulp.task('build', (done) => { runSequence('validate-js', 'build-js', done); } );

// Default task builds and tests
gulp.task('default', [ 'build' ]);
