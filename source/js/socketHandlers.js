/**
 * Websockets events handlers
 */
$( document ).ready( function ( ) {
	socket.on( 'mega:teamspeak.reload', function ( data ) {
		methods.reload.teamspeak( );
	});

	socket.on( 'mega:online.reload', function ( data ) {
		methods.reload.online( );
	});

	socket.on( 'mega:teamspeak.events', function ( data ) {

		if ( 'online' === data.key || 'offline' === data.key ) {
			methods.reload.online( );
		}

		if ( 'online' === data.key ) {
			var client = $( data.body )
				.hide( )
				.css( 'visibility', 'hidden' )
				.animate({ backgroundColor: '#3AB261' }, 0 )
				.appendTo( '#ts-channel-clients-' + data.cid )
				.show( 'slow', function ( ) {
					$( this ).resizeClientHeader( );
				})
				.addClass( 'slideRight' )
				.one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function ( ) {
					$( this ).css( 'visibility', '' )
						.removeClass( 'slideRight' )
						.animate({ backgroundColor: '' }, 1000, function ( ) {
							$( this ).css( 'backgroundColor', '' );
						});
				});
			return;
		}

		if ( 'offline' === data.key ) {
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

		if ( 'change' === data.key ) {
			var client_old = $( '#ts-client-' + data.clid );
			var client_new = $( data.body );
			var cid = client_old.closest( '.ts-channel-clients' ).attr( 'id' );
				cid = parseInt( cid.substr( cid.lastIndexOf( '-' ) + 1 ), 10 );

			if ( cid === data.cid ) {
				client_old.replaceWith( client_new );
				client_new.resizeClientHeader( );
				return;
			}

			client_old.hide( 'medium', function ( ) {
				client_new.animate({ backgroundColor: '#7787FF' }, 0 );
				client_old
					.appendTo( '#ts-channel-clients-' + data.cid )
					.replaceWith( client_new );

				client_new
					.css( 'visibility', 'hidden' )
					.hide( )
					.show( 'medium', function ( ) {
						$( this ).resizeClientHeader( );
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