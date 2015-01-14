'use strict';

var async = require.main.require( 'async' ),
	methods = require( './lib/methods' ),
	renderCldbids = require( './templates/cldbids' ),
	user = require.main.require( './src/user' );


/* ---------------------------------------------
* => Sends:
* ---------------------------------------------*/
module.exports = function ( req, res, next ) {
	var isAdmin;
	if ( !req.user ) req.user = { uid: 0 };

	user.isAdministrator( req.user.uid, function ( err, result ) {
		isAdmin = result;

		if ( isAdmin || req.user.uid == req.params.uid ) {
			methods.getCldbidsByUid( req.params.uid, function ( err, cldbids ) {

				if ( !cldbids ) return res.end( 'false' );
				if ( !cldbids.length ) return res.end( 'false' );

				var data = { idList: [ ] };

				async.each( cldbids, function ( cldbid, callback ) {
					methods.getNicknameByCldbid( cldbid, function ( err, nickname ) {
						data.idList.push( { cldbid: cldbid, nickname: nickname } );
						callback( null );
					});
				}, function ( err, results ) {
					res.end( renderCldbids( data ) );
				});
			});
		} else res.end( 'false' );
	});

};