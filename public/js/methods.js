/* ---------------------------------------------
* Client-side methods library
* ---------------------------------------------*/
var methods = {
	reload: { }
};

methods.reload.online = function ( ) {
	$.get( RELATIVE_PATH + '/mega/online/builder', {}, function ( data ) {
		$( '#mega-online' ).html( data );
	});
};

methods.reload.teamspeak = function ( ) {
	$.get( RELATIVE_PATH + '/mega/teamspeak/builder', {}, function ( data ) {
		$( '#mega-teamspeak' ).html( data );
	});
};
