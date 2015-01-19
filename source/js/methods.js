/* ---------------------------------------------
* Client-side methods library
* dependencies: jQuery
* ---------------------------------------------*/
var methods = {
	reload: { }
};

/* ---------------------------------------------
* CONSTANTS and variables
* ---------------------------------------------*/

/* ---------------------------------------------
* METHODS
* ---------------------------------------------*/
methods.reload.online = function ( ) {
	$.get( RELATIVE_PATH + '/mega/online/builder', {}, function ( data ) {
		$( '#mega-online' ).html( data );
	});
};

methods.reload.teamspeak = function ( ) {
	$.get( RELATIVE_PATH + '/mega/teamspeak/builder', {}, function ( data ) {
		$( '#mega-teamspeak' ).html( data ).find( '.ts-client' ).each( function ( index, client ) {
			methods.resizeClientHeader( client );
		});

	});
};

methods.resizeClientHeader = function ( client ) {
	client = client || this;
	// we forced to adjust .ts-client-header size explicity
	// since there is no native way to prevent inline-block DIVs
	// from wrapping to a newline :(
	var clientFlag = 20 + 5; // px
	var groups = 0; // px

	$( client ).find( '.ts-client-info' ).each( function ( index, icon ) {
		groups = groups + $( icon ).width( );
	});

	groups = groups + clientFlag;
	var header = $( client ).width( ) - groups; // px
	console.log( 'CYCLE groups header', groups, header );
	$( client ).find( '.ts-client-header' ).css( 'width', header );
	return $( client );
};

$.fn.extend( { resizeClientHeader: methods.resizeClientHeader } );