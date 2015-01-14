
$( document ).ready( function ( ) {
	/* ---------------------------------------------
	* Define initial variables
	* ---------------------------------------------*/

/*	var scroll_old;
	var tsMove = function ( ) {
		var ts = $( '#mega-teamspeak-container' );
		var tsHeight = ts.outerHeight( );
		var scrollTop = $( window ).scrollTop( );
			var tsOffsetTop_Initial = ts.offset( ).top;
			var headerHeight = $( '#header-menu' ).outerHeight( );
			var offsetClear = tsOffsetTop_Initial - headerHeight;
		if ( !scroll_old ) scroll_old = 0;

		console.log( 'tsHeight', tsHeight );
		console.log( 'tsOffsetTop_Initial', tsOffsetTop_Initial );
		console.log( 'headerHeight', headerHeight );
		console.log( 'offsetClear', offsetClear );
		console.log( 'scroll_old', scroll_old );
		console.log( 'scrollTop', scrollTop );
		console.log( 'window.innerHeight', window.innerHeight );

		var redundance = scroll_old - scrollTop;
		if ( scrollTop > scroll_old ) {
			// scrollDown
			if ( ( window.innerHeight + scrollTop ) > ( tsOffsetTop_Initial + tsHeight ) ) {
				ts.addClass( 'ts-fixed' );
				ts.css( 'top', '' );
				ts.css( 'bottom', 0 );
				return;
			}
			ts.css( 'top', parseInt( ts.css( 'top' ), 10 ) + redundance );
			console.log( 'scrollDown is fired' );


		} else {
			// scrollUp
			if ( ( scrollTop + headerHeight ) < ts.offset( ).top ) {
				ts.addClass( 'ts-fixed' );
				ts.css( 'top', headerHeight );
				ts.css( 'bottom', '' );
				return;
			}
			ts.css( 'bottom', parseInt( ts.css( 'bottom' ), 10 ) - redundance );
			console.log( 'scrollUp is fired' );
		}

		scroll_old = scrollTop;
	}*/;
		/*if ( ( scrollTop + offsetClear + 15 ) > ( headerHeight ) ) {
			if ( ( tsHeight + offsetClear + 15 ) > ( scrollTop + window.innerHeight ) ) {
				ts.addClass( 'ts-fixed' );
				ts.css( 'top', '' );
				ts.css( 'bottom', 0 );
			} else {
				ts.addClass( 'ts-fixed' );
				ts.css( 'top', headerHeight + 15 );
				ts.css( 'bottom', '' );
			}
		} else {
			ts.removeClass( 'ts-fixed' );
			ts.css( 'top', '' );
			ts.css( 'bottom', '' );
		}*/

	/* ---------------------------------------------
	* Register Event Handlers
	* ---------------------------------------------*/
	methods.reload.online( );
	methods.reload.teamspeak( );

	$( document ).on( 'click', 'a.ts-userlink', function ( event ) {
		event.preventDefault( );
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