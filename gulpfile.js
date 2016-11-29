'use strict';

let
	glob = require('glob'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	path = require('path'),
	rollup = require('rollup'),
	runSequence = require('run-sequence'),

	plugins = gulpLoadPlugins(),
	assets = require('./config/assets'),
	pkg = require('./package.json');


// Banner to append to generated files
let bannerString = '/*! ' + pkg.name + '-' + pkg.version + ' - ' + pkg.copyright + '*/'


/**
 * Validation Tasks
 */

gulp.task('validate-js', () => {

	return gulp.src(assets.src.js)

		// ESLint
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());

});


/**
 * Build
 */

gulp.task('build-js', ['rollup-js'], () => {

	// Uglify
	return gulp.src(path.join(assets.dist.dir, (pkg.artifactName + '.js')))
		.pipe(plugins.uglify({ preserveComments: 'license' }))
		.pipe(plugins.rename(pkg.artifactName + '.min.js'))
		.pipe(gulp.dest(assets.dist.dir));

});

gulp.task('rollup-js', () => {
	return rollup.rollup({
			entry: assets.src.js
		})
		.then((bundle) => {
			return bundle.write({
				dest: path.join(assets.dist.dir, (pkg.artifactName + '.js')),
				format: 'umd',
				moduleName: 'leafletD3',
				sourceMap: true,
				banner: bannerString
			});
		});

});

gulp.task('watch', [ 'build' ], () => {
	gulp.watch([ assets.src.js ], [ 'build' ]);
});


/**
 * --------------------------
 * Main Tasks
 * --------------------------
 */

gulp.task('build', (done) => { runSequence('validate-js', [ 'build-js' ], done); } );

// Default task builds and tests
gulp.task('default', [ 'build' ]);
