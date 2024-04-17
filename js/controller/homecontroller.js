function HomeController()
{
}

// prototype
HomeController.prototype = Object.create(ControllerBase.prototype);

// implementations
HomeController.prototype.getView = function()
{
	return 'home';
}

HomeController.prototype.setup = function()
{
	$('section.bigTeaser .right button').click(function() {
		Pages.go('/board');
	});

	$('section.teaserButton button').click(function() {
		openOverlay('Register');
	});
}

HomeController.prototype.switch = function(args)
{
	LoadingBar.done();
}

HomeController.prototype.onBackendReady = function()
{
	if(location.hash == '#login')
	{
		openOverlay('Login');
	}

	if(location.hash == '#register')
	{
		openOverlay('Login');
	}
}

addController('HomeController', HomeController);