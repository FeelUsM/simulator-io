/* this is session file. it handles some transitions and event/result distribution. so it's the "misc" file */

var sessionLoginCallback = null;


Event.on('userDataOwn', function(profile) {
	Config.profile = profile;
	updateProfileMeta();
});

Event.on('registerSuccess', function() {
	Event.send('openMessage', {
		title: 'Registration',
		text: 'Registration successful. Please check your emails to verify your address.',
		onClose: function() {
			if(!Backend.isLoggedIn())
			{
				if(Config.loginOnRegisterAuthData)
				{
					var auth = Config.loginOnRegisterAuthData;
					doLogin( auth[0], auth[1] );
					Config.loginOnRegisterAuthData = null;
				}
			}
			else
			{
				console.log("ERROR\tRegister success, but already logged in");
			}
		}
	});
});

Event.on('loginResult', function(result) {
	if(result) // if login was sucessfull, let's wait for the boardList now
	{
		Event.send('loadState', {boardList: true});
	}

	if(!!sessionLoginCallback) // has custom callback?
	{
		var cb = sessionLoginCallback;
		sessionLoginCallback = null;
		cb(result);
	}
	else
	{
		if(result) // login succesful?
		{
			// transit to main user page?
			// always to that, unless the current page is the editor page
			if( !(Pages.getCurrentController() instanceof EditorController) )
			{
				Pages.go('/user/boards');
			}			
		}
	}	
});


function doLogin(login, pass, cb)
{
	Event.send('loadState', {login: true});
	sessionLoginCallback = cb;

	Backend.login(login, pass);
}

function setLoginCallback(cb)
{
	sessionLoginCallback = cb;
}