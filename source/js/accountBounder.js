$(document).on('ready', function (e) {

	var successIcon = '<i class="fa fa-check"></i>';
	var standardIcon = '<i class="fa fa-circle-o"></i>';
	var iNickname = $('#mega-teamspeak-bounder-input-nickname');
	var iPincode = $('#mega-teamspeak-bounder-input-pincode');
	var bNickname = $('#mega-teamspeak-bounder-nickname-btn');
	var bPincode = $('#mega-teamspeak-bounder-pincode-btn');
	var nNickname = $('#mega-teamspeak-bounder-input-nickname-notify');
	var bShowBounder = $('#mega-teamspeak-bounder-show-btn');

	$('form.no-submit').on('submit', function (event) {
		event.preventDefault();
	});

	$.get(RELATIVE_PATH + '/mega/teamspeak/bounder/uid/' + app.user.uid, {}, function (data) {
		if (data != 'false') {
			$('#mega-teamspeak-bounder-cldbids').html(data);
		}
	});

	bShowBounder.on('click', function (event) {
		event.preventDefault();
		$(this).attr('disabled', true);
		/*bNickname.closest( '.form-horizontal' ).removeClass( 'hidden' );*/
		bNickname.closest('.form-horizontal').slideDown('fast');

	});
	bNickname.on('click', function (event) {
		event.preventDefault();

		var data = {};
		data.nickname = iNickname.val();

		socket.emit('modules.bounder', data, function (fix, data) {
			if (data.err) return app.alertError(data.err);
			/*app.alert({ type: 'info', message: 'Введите пинкод', timeout: 3000 });*/

			iNickname.attr('disabled', true);

			bNickname.closest('.form-actions').addClass('hidden');

			nNickname.html(successIcon)
				.parent().removeClass('alert-danger').addClass('alert-success');

			iPincode.closest('.form-horizontal').slideDown('fast');
		});
	});

	bPincode.on('click', function (event) {
		event.preventDefault();

		var data = {};
		data.pincode = iPincode.val().trim();

		socket.emit('modules.bounder', data, function (fix, data) {
			if (data.err) return app.alertError(data.err);
			if (data.msg) app.alert({
				type: 'success',
				title: 'Успех',
				timeout: 5000,
				message: data.msg,
				clickfn: function () {}
			});

			iNickname.val('');
			iPincode.val('');

			iNickname.attr('disabled', false);

			bNickname.closest('.form-actions').removeClass('hidden');
			bNickname.closest('.form-horizontal').fadeOut('slow');

			nNickname.html(standardIcon)
				.parent().removeClass('alert-danger alert-success');

			iPincode.closest('.form-horizontal').fadeOut('slow');
			bShowBounder.attr('disabled', false);

			$.get(RELATIVE_PATH + '/mega/teamspeak/bounder/uid/' + app.user.uid, {}, function (data) {
				if (data != 'false') {
					$('#mega-teamspeak-bounder-cldbids').html(data);

					var sidebarBtn = $('.sidebar-area__open-options');

					if (0 < sidebarBtn.length && !sidebarBtn.hasClass('--pressed')) {
						sidebarBtn.addClass('--pressed');

						$('#sidebar-area__options').finish().slideDown({
								duration: 300
							})
							.animate({
								'background-color': '#FFF'
							}, {
								duration: 500
							});
					}

				}
			});

		});
	});


});
