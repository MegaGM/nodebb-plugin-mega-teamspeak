
$( document ).ready( function ( ) {
	/* ---------------------------------------------
	* Define initial variables
	* ---------------------------------------------*/

/*	var scroll_old;
	var tsMove = function ( ) {
		var ts = $( '#mega-teamspeak-container' );
		var scrollTop = $( window ).scrollTop( );
		if ( !scroll_old ) scroll_old = 0;
		var redundance = scroll_old - scrollTop;
		if ( scrollTop > scroll_old ) {
			// scrollDown
		} else {
			// scrollUp
		}

		scroll_old = scrollTop;
	};*/


	/* ---------------------------------------------
	* Register Event Handlers
	* ---------------------------------------------*/
	methods.reload.online( );
	methods.reload.teamspeak( );

	$( document ).on( 'click', 'div.ts-client[data-userlink]', function ( event ) {
		event.preventDefault( );
		console.log( 'WHAT IS THIS', $( this ) );

		console.log( 'LINK?? ', $( this ).attr( 'data-userlink' ) );
		if ( !$( this ).attr( 'data-userlink' ) ) return;
		/*app.previousUrl = window.location.href;*/
		ajaxify.go( $( this ).attr( 'data-userlink' ) );
	});

/*	$( window ).on( 'action:ajaxify.end', function ( e, data ) {
	});

	$( window ).on( 'action:connected', function ( e, data ) {
	});

*/	/*$( document ).scroll( $.throttle( 10, tsMove ) );*/
	/*$( document ).scroll( tsMove );*/

/*	$( document ).on( 'mega:teamspeak.events', function ( ) {
		console.log( 'document mega:teamspeak.events!!!!!!!!!!!!!', arguments );
	});

	$( window ).on( 'mega:teamspeak.events', function ( ) {
		console.log( 'window mega:teamspeak.events!!!!!!!!!!!!!', arguments );
	});

	$( window ).on( 'action:connected', function ( ) {
		console.log( 'action:connected', arguments );
	});
	socket.on( 'event:disconnect', function ( ) {
		console.log( 'event:disconnect!!', arguments );
	});
	$( window ).on( 'action:disconnected', function ( ) {
		console.log( 'action:disconnected', arguments );
	});
	$( window ).on( 'action:reconnected', function ( ) {
		console.log( 'action:reconnected', arguments );
	});

*/
});