function PassResetController()
{
	this.requestHash = null;
	this.requestMail = null;
}

// prototype
PassResetController.prototype = Object.create(ControllerBase.prototype);

// implementations
PassResetController.prototype.getView = function()
{
	return 'passreset';
}

PassResetController.prototype.setup = function()
{
	var that = this;

	$('section.passReset form.userident').submit(function(e) {
		e.preventDefault();

		var login = $(this).find('input').val();
		$(this).find('button').prop('disabled', true);

		Backend.resetPassword(login, function() {
			$('section.passReset form').hide();
			$('section.passReset .hint2').show();
		});

		return false;
	});


	$('section.passReset form.password').submit(function(e) {
		e.preventDefault();

		var pass = $(this).find('input').val();
		$(this).find('button').prop('disabled', true);

		if(Validation.Pass(pass).valid)
		{
			$(this)[0].reset();
			Backend.resetPasswordFinal(that.requestMail, that.requestHash, pass, function(result) {
				if(result)
				{
					Pages.go('/');
					Event.send('openMessage', {title: 'Password changed', text: 'Your password was successfully changed', onClose: function() {
						openOverlay('Login');
						Event.send('setLoginOverlayCallback', function() {
							Pages.go('/user/boards');	
						});
					}});
				}
				else
				{
					Event.send('openMessage', {error: true, title: 'Error', text: 'Failed to reset password'});
				}
			});
		}
		else
		{
			Event.send('openMessage', {error: true, title: 'Error', text: 'Your password is too weak.'});
			$(this).find('button').prop('disabled', false);
		}

		return false;
	});
}

PassResetController.prototype.switch = function(args)
{
	var that = this;

	$('section.passReset form input').val('');
	$('section.passReset form').show();
	$('section.passReset form button').prop('disabled', false);
	$('section.passReset .step').hide();

	Event.send('loadState', {'resetPasswordLoad': false});

	if(args.length == 0)
	{
		$('section.passReset .step1').show();
		$('section.passReset .step1 .hint2').hide();

		LoadingBar.done();
	}
	else if(args.length == 2)
	{
		Event.send('loadState', {'resetPasswordLoad': true});

		$('section.passReset .step2').show();

		$('section.passReset .step2 .hint.error').hide();
		$('section.passReset .step2 form.password').hide();

		Backend.isPassResetHashValid(args[0], args[1], function(result) {
			that.requestMail = args[0];
			that.requestHash = args[1];

			if(result)
			{
				 $('section.passReset .step2 form.password').show();
			}
			else
			{
				$('section.passReset .step2 .hint.error').show();
			}


			Event.send('loadState', {'resetPasswordLoad': false});
			LoadingBar.done();
		});
	}
	else
	{
		Pages.go('error404');
	}
}

addController('PassResetController', PassResetController);