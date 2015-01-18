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

		if ( 'online' === data.key || 'offline' === data.key ) {
			methods.reload.online( );
		}

		if ( data.key === 'online' ) {
			var client = $( data.body )
				.hide( )
				.css( 'visibility', 'hidden' )
				.animate({ backgroundColor: '#3AB261' }, 0 )
				.appendTo( '#ts-channel-clients-' + data.cid )
				.show( 'slow', function ( ) {
					$( this ).reziseClientHeader( );
				})
				.addClass( 'slideRight' )
				.one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function ( ) {
					$( this ).css( 'visibility', '' )
						.reziseClientHeader( )
						.removeClass( 'slideRight' )
						.animate({ backgroundColor: '' }, 1000, function ( ) {
							$( this ).css( 'backgroundColor', '' );
						});
				});
			return;
		}

		if ( data.key === 'offline' ) {
			var client = $( '#ts-client-' + data.clid )
				.animate({ backgroundColor: '#FF625F' }, 47 )
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
				client_new.animate({ backgroundColor: '#7787FF' }, 0 );
				client_old
					.appendTo( '#ts-channel-clients-' + data.cid )
					.replaceWith( client_new );

				client_new
					.css( 'visibility', 'hidden' )
					.hide( )
					.show( 'slow', function ( ) {
						$( this ).reziseClientHeader( );
					})
					.css( 'visibility', '' )
					.animate({ backgroundColor: '' }, 1000, function ( ) {
						$( this ).css( 'backgroundColor', '' );
					});
			});
			return;
		}
			return;
	});

});