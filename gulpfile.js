var gulp = require( 'gulp' ),
	Handlebars = require( 'handlebars' ),
	handlebars = require( 'gulp-handlebars' ),
	defineModule = require( 'gulp-define-module' ),
	concat = require( 'gulp-concat' ),
	compressor = require( 'gulp-compressor' ),
	uglify = require( 'gulp-uglify' ),
	rename = require( 'gulp-rename' );

gulp.task( 'templates', function( ){
	gulp.src( [ 'source/templates/**' ] )
/*		.pipe( compressor({
			'remove-intertag-spaces': true,
			'remove-surrounding-spaces': "all",
			'disable-optimizations': true,
			'compress-js': true,
			'nomunge': true
		 }))*/
		.pipe( handlebars({
			handlebars: Handlebars
		}))
		.pipe( defineModule( 'node' ) )
		.pipe( compressor( ) )
		.pipe( gulp.dest( 'templates/' ) );
});

gulp.task( 'js', function( ){
	gulp.src( [ 'source/js/**' ] )
		.pipe( concat( 'all.js' ) )
		.pipe( uglify({
			compress: {
				booleans: false
			}
		}))
		.pipe( rename({
			suffix: '.min',
			extname: '.js'
		}))
		.pipe( gulp.dest( 'assets/js/' ) );
});

gulp.task( 'css', function( ){
	gulp.src( [ 'source/css/**' ] )
		.pipe( concat( 'all.css' ) )
		.pipe( gulp.dest( 'assets/css/' ) );
});

gulp.task( 'default', function ( ) {
	var templateCompile = [ 'templates' ];
	var jsCompile = [ 'js' ];
	var cssConcat = [ 'css' ];
	gulp.watch( 'source/templates/**', templateCompile );
	gulp.watch( 'source/js/**', jsCompile );
	gulp.watch( 'source/css/**', cssConcat );
});
