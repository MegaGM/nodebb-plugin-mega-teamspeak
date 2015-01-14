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
			var client = $( data.body ).hide( )
				.appendTo( '#ts-channel-clients-' + data.cid );

			client
				.fadeIn( );
			return;
		}

		if ( data.key === 'offline' ) {
			var client = $( '#ts-client-' + data.clid ).parent( 'a.ts-userlink' ).length
				? $( '#ts-client-' + data.clid ).parent( 'a.ts-userlink' )
				: $( '#ts-client-' + data.clid );
			client
				.fadeOut( function ( ) {
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