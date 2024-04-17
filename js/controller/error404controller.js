function Error404Controller()
{
}

// prototype
Error404Controller.prototype = Object.create(ControllerBase.prototype);

// implementations
Error404Controller.prototype.getView = function()
{
	return 'error404';
}

Error404Controller.prototype.setup = function()
{
}

Error404Controller.prototype.switch = function(args)
{
	LoadingBar.done();
	Event.send('removeAllLoadTags');
}

addController('Error404Controller', Error404Controller);