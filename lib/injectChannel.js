'use strict';

var async = require.main.require( 'async' ),
	config = require( '../config' ),
	nconf = require.main.require( 'nconf' ),
	spacerPatt = /\[([^\]]?)spacer[^\]]\d*\]/i,
	unsignedInt = 4294967295;


/**
 * Inject properties to channel object
 */
module.exports = function ( channel, data, callback ) {
	/**
	 * % Series 1
	 */
	var InjectSpacer = function ( callback ) {
		if ( spacerPatt.test( channel.channel_name ) ) {
			var match = spacerPatt.exec( channel.channel_name );
			channel.is_spacer = config.ts.spacers[ match[ 1 ] ];
			channel.channel_name = channel.channel_name.replace( spacerPatt, '' );
		}
		callback( null );
	};


	/**
	 * % Series 2
	 */
	var InjectLimits = function ( callback ) {
		( function ( ) {
			if ( channel.is_spacer ) return channel.channel_icon = false;
			if ( -1 === channel.channel_maxclients ) return channel.channel_icon = 'channel-open';
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


	/**
	 * % Series 3
	 */
	var InjectImagesPath = function ( callback ) {
		channel.imagesPath = nconf.get( 'url' ) + config.app.imagesPath;
		callback( null );
	};


	/**
	 * % Series 4
	 */
	var InjectChannelIcon = function ( callback ) {
		channel.iconid = function ( ) {
			if ( channel.channel_icon_id > 0 ) return channel.channel_icon_id;
			if ( channel.channel_icon_id < 0 ) return ( unsignedInt + channel.channel_icon_id ) + 1;
			return false;
		}( );
		callback( null );
	};


	/**
	 * % Series Control Flow
	 */
	async.series([
		InjectSpacer,
		InjectLimits,
		InjectImagesPath,
		InjectChannelIcon
	], function ( err, results ) {
		callback( null );
	});
};
