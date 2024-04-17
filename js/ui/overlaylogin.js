function initOverlayLogin()
{
	var jqBox = $('#uiOverlayLogin');
	//var currentCb = null;

	jqBox.find('form').submit(function(){
		var login = $(this).find('input[name="login"]').val();
		var pass = $(this).find('input[name="pass"]').val();

		doLogin(login, pass);
		
		return false;
	});
	
	Event.on('loginResult', function(result) {
		if(result)
		{
			$('#uiOverlayLogin .loginerr').hide();
		}
		else
		{
			$('#uiOverlayLogin .loginerr').show();
			$('#uiOverlayLogin').shake(2, 30, 400);
		}

		//if(currentCb) currentCb(result);
	});

	Event.on('overlayOpened', function(name) {
		if(name == 'Login')
		{
			$('#uiOverlayLogin .loginerr').hide();
			jqBox.find('input[name="login"]').focus();
		}
	});

	/*Event.on('setLoginOverlayCallback', function(cb) {
		currentCb = cb;
	});*/
}

Event.onKey('button', 'openLogin', function() {
	openOverlay('Login');
});