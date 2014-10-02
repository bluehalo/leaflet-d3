var gulp = require('gulp'),
	p = require('./package.json'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	plugins = gulpLoadPlugins();

var banner = '/*! ' + p.name + '.js Version: ' + p.version + ' */\n';

gulp.task('default', ['build']);

gulp.task('watch', function(){
	gulp.watch(['src/**/*', '!/src/lib/**/*'], ['build']);
});

gulp.task('build', ['js'] );

gulp.task('js', function(){
	return gulp.src('src/js/**/*.js')

		// JS Hint
		.pipe(plugins.jshint('.jshintrc'))
		.pipe(plugins.jshint.reporter('jshint-stylish'))

		// Concatenate
		.pipe(plugins.concat(p.name + '.js'))
		.pipe(plugins.insert.prepend(banner))
		.pipe(gulp.dest('dist'))
		.pipe(plugins.filesize())

		// Uglify
		.pipe(plugins.uglify())
		.pipe(plugins.rename(p.name + '.min.js'))
		.pipe(plugins.insert.prepend(banner))
		.pipe(gulp.dest('dist'))
		.pipe(plugins.filesize())
		.on('error', plugins.util.log);
});