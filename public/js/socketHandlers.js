/* ---------------------------------------------
* Socket handlers
* ---------------------------------------------*/
$( document ).ready( function ( ) {
	socket.on( 'mega:teamspeak.reload', function ( data ) {
		$.get( RELATIVE_PATH + '/mega/teamspeak/builder', {}, function ( data ) {
			$( '#mega-teamspeak' ).html( data );
		});
	});

	var pingOnline = function ( ) {
		socket.emit( 'modules.pingOnline' );
	};

	console.log( 'ONBEFORE pingOnline' );
	setInterval( pingOnline, 59 * 1000 );
	pingOnline( );

	socket.on( 'mega:teamspeak.events', function ( data ) {
		if ( data.key === 'online' ) {
			var client = $( data.body ).hide( )
				.appendTo( '#ts-channel-clients-' + data.cid );

			client
				.animate({ backgroundColor: '#90CC74' }, 0 )
				.slideDown( )
				.animate({ backgroundColor: '' }, 1000 );
			return;
		}

		if ( data.key === 'offline' ) {
			$( '#ts-client-' + data.clid )
				.animate({ backgroundColor: '#FF8080' }, 1000 )
				.slideUp( function ( ) {
					this.remove( );
				});
			return;
		}

		if ( data.key === 'change' ) {
			var client_old = $( '#ts-client-' + data.clid );
			var client = $( data.body );
			var cid = client_old.closest( '.ts-channel-clients' ).attr( 'id' );
				cid = parseInt( cid.substr( cid.lastIndexOf( '-' ) + 1 ), 10 );

			if ( cid === data.cid )
				return client_old.replaceWith( client );

			client_old.fadeOut( 'fast', function ( ) {
				client.animate({ backgroundColor: '#CfE3FF' }, 0 );
				client_old
					.appendTo( '#ts-channel-clients-' + data.cid )
					.replaceWith( client )
					.fadeIn( 'slow' );
				client.animate({ backgroundColor: '' }, 1000 );
			});
			return;
		}
			return;
	});


});