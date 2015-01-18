



/* ---------------------------------------------
* Socket handlers
* ---------------------------------------------*/
$( document ).ready( function ( ) {
	socket.on( 'mega:teamspeak.reload', function ( data ) {
		methods.reload.teamspeak( );
	});

	socket.on( 'mega:online.reload', function ( data ) {
		methods.reload.online( );
	});

	var pingOnline = function ( ) {
		socket.emit( 'modules.pingOnline' );
	};
	setInterval( pingOnline, 59 * 1000 );

	socket.on( 'mega:teamspeak.events', function ( data ) {
		console.log( 'mega:teamspeak.events ', data.key, data );
		if ( 'online' === data.key || 'offline' === data.key ) {
			methods.reload.online( );
		}

		if ( data.key === 'online' ) {
			var client = $( data.body )
				.css( 'display', 'none' )
				.css( 'visibility', 'hidden' )
				.appendTo( '#ts-channel-clients-' + data.cid )
				.show( 'medium' )
				.addClass( 'slideRight' )
				.one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function ( ) {
					$( this ).css( 'visibility', '' )
						.removeClass( 'slideRight' );
				});
			return;
		}

		if ( data.key === 'offline' ) {
			var client = $( '#ts-client-' + data.clid )
				.addClass( 'animated fadeOutLeft' )
				.one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function ( ) {
					$( this ).hide( 'medium', function ( ) {
						this.remove( );
					});
				});
			return;
		}

		if ( data.key === 'change' ) {
			var client_old = $( '#ts-client-' + data.clid );
			var client_new = $( data.body );
			var cid = client_old.closest( '.ts-channel-clients' ).attr( 'id' );
				cid = parseInt( cid.substr( cid.lastIndexOf( '-' ) + 1 ), 10 );

			if ( cid === data.cid )
				return client_old.replaceWith( client_new );

			client_old.hide( 'slow', function ( ) {
				client_new.animate({ backgroundColor: '#CfE3FF' }, 0 );
				client_old
					.appendTo( '#ts-channel-clients-' + data.cid )
					.replaceWith( client_new );
				client_new
					.hide( )
					.show( 'slow' )
					.animate({ backgroundColor: '' }, 1000 );
			});
			return;
		}
			return;
	});


});