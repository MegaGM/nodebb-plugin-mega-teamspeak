/**
 * Client-side methods library
 * dependency: jQuery
 */
var methods = {
	reload: { }
};


methods.reload.online = function ( ) {
	$.get( document.location.origin + '/mega/online/builder', {}, function ( data ) {
		$( '#mega-online' ).html( data );
	});
};


methods.reload.teamspeak = function ( ) {
	$.get( document.location.origin + '/mega/teamspeak/builder', {}, function ( data ) {
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