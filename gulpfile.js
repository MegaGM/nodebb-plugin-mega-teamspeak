var gulp = require( 'gulp' ),
	Handlebars = require( 'handlebars' ),
	handlebars = require( 'gulp-handlebars' ),
	defineModule = require( 'gulp-define-module' ),
	compressor = require( 'gulp-compressor' );

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

gulp.task( 'default', function ( ) {
	var templateCompile = [ 'templates' ];
	gulp.watch( 'source/templates/**', templateCompile );
} );
