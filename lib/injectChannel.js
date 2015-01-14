'use strict';

var async = require.main.require( 'async' ),
	config = require( '../config' ),
	spacerPatt = /\[([^\]]?)spacer[^\]]\d*\]/i;

/* ---------------------------------------------
* % Helper
* + Inject properties to client object
*
* <= Takes: client
* => Sends: void
* ---------------------------------------------*/
module.exports = function ( channel, data, callback ) {

	var InjectSpacer = function ( callback ) {
		if ( spacerPatt.test( channel.channel_name ) ) {
			var match = spacerPatt.exec( channel.channel_name );
			channel.is_spacer = config.ts.spacers[ match[ 1 ] ];
			channel.channel_name = channel.channel_name.replace( spacerPatt, '' );
		}
		callback( null );
	};


	var InjectLimits = function ( callback ) {
		( function ( ) {
			if ( channel.is_spacer ) return channel.channel_icon = false;
			if ( channel.channel_maxclients === -1 ) return channel.channel_icon = 'channel-open';
			if ( channel.channel_maxclients > channel.total_clients ) return channel.channel_icon = 'channel-open';
			return channel.channel_icon = 'channel-full';
		})( );
		callback( null );
	};

	/*var InjectLevel = function ( callback ) {
		var getLevel = function ( channel, level ) {
			var level = level || 1;
			if ( channel.pid ) return getLevel( _.find( data.channels, { 'cid': channel.pid } ), ++level );
			return level;
		};
		channel.level = getLevel( channel );
		console.log( 'CHANNEL LEVEL: ', channel.level );
	};*/

	/*var InjectLastIndex = function ( callback ) {
		if ( _.any( data.channels, { 'pid': channel.cid } ) ) {
			_.findLast( data.channels, { 'pid': channel.cid } ).last = true;
		}
	};*/

	/*var InjectPrefix = function ( callback ) {
		if ( !channel.prefix ) channel.prefix = [ ];
		var reduceLevel = function ( channel, level ) {
			if ( channel.is_spacer ) return channel.prefix.push( 'line' );
			if ( level === 1 ) {
				if ( channel.last ) return channel.prefix.push( 'end' );
				return channel.prefix.push( 'mid' );
			}

			channel.prefix.push( 'line' );
			return reduceLevel( channel, --level );
		};
		return reduceLevel( channel, channel.level );
	};*/

	var InjectImagePath = function ( callback ) {
		channel.iconPath = config.app.address + config.app.imagePath;
		callback( null );
	};

	async.series([
		InjectSpacer,
		InjectLimits,
		InjectImagePath
	], function ( err, results ) {
		callback( null );
	});

};