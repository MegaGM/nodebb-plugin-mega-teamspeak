'use strict';

var async = require.main.require( 'async' ),
	config = require( '../config' ),
	_ = require( 'lodash' ),
	winston = require.main.require( 'winston' ),
	methods = require( './methods' );


/* ---------------------------------------------
* % Waterfall
* <= Takes: V, data: { clients, channels, events }
* ---------------------------------------------*/
var acl = [
	{ siteGroup: 'Лидеры', sgid: '17' },
	{ siteGroup: 'Офицеры', sgid: '21' },
	{ siteGroup: 'Рыцари', sgid: '23' }
];
var transparentSgids = [ '2', '8' ];
module.exports = function ( uid, callback ) {
	var user = {
		cldbids: [ ],
		accounts: { }
	};

	async.series([
		function ( callback ) {
			// get user.siteGroups
			methods.getSiteGroupsByUid( [ uid ], function ( err, res ) {
				user.siteGroups = res[ 0 ];
				callback( err );
			});
		},
		function ( callback ) {
			// filter user.siteGroups
			async.map( user.siteGroups, function ( siteGroup, callback ) {
				var match = _.find( acl, { 'siteGroup': siteGroup.name } );
				match ? callback( null, match ) : callback( null, false );
			}, function ( err, results ) {
				user.siteGroups = _.compact( results );
				callback( err );
			});
		},
		function ( callback ) {
			// get user.cldbids
			methods.getCldbidsByUid( uid, function ( err, res ) {
				user.cldbids = res;
				callback( err );
				// probably filter cldbids to array of strings
			});
		},
		function ( callback ) {
			// get sgids for each user.cldbids
			async.each( user.cldbids, function ( cldbid, callback ) {
				methods.getSgidsByCldbid( cldbid, function ( err, res ) {
					var sgids = _.compact( _.filter( res, function ( sgidObj ) {
						sgidObj.sgid = '' + sgidObj.sgid;
						return !_.contains( transparentSgids, sgidObj.sgid );
					}));
					user.accounts[ '' + cldbid ] = { };
					user.accounts[ '' + cldbid ].sgids = sgids;
					user.accounts[ '' + cldbid ].cldbid = cldbid;
					callback( err );
				});
			}, function ( err, results ) {
				callback( err );
			});
		},
		function ( callback ) {
			// remove sgid for each account
			async.each( Object.keys( user.accounts ), function ( accountKey, callback ) {
				var account = user.accounts[ accountKey ];
				if ( !account.sgids ) return callback( null );
				async.each( account.sgids, function ( sgidObj, callback ) {
					var match = _.find( user.siteGroups, { 'sgid': '' + sgidObj.sgid } );
					if ( match ) return callback( null );
					methods.sgidRemove( sgidObj.sgid, account.cldbid, callback );
				}, function ( err, results ) {
					callback( err );
				});
			}, function ( err, results ) {
				callback( err );
			});
		},
		function ( callback ) {
			// add sgid for each account by siteGroups
			async.each( Object.keys( user.accounts ), function ( accountKey, callback ) {
				var account = user.accounts[ accountKey ];
				async.each( user.siteGroups, function ( siteGroup, callback ) {
					var match = _.find( account.sgids, { 'sgid': siteGroup.sgid } );
					if ( match ) return callback( null );
					methods.sgidAdd( siteGroup.sgid, account.cldbid, callback );
				}, function ( err, results ) {
					callback( err );
				});
			}, function ( err, results ) {
				callback( err );
			});
		}], function ( err, results ) {
			callback( err );
		});

};