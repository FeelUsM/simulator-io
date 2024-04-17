function ControllerBase()
{
	
}

ControllerBase.prototype.defaultProperties = {
	scroll: true,
	showMainNav: true,
};

ControllerBase.prototype.getProperty = function(key) {
	if(!!this.properties && typeof this.properties[key] != 'undefined') return this.properties[key];

	if(typeof this.defaultProperties[key] != 'undefined')
	{
		return this.defaultProperties[key];
	}

	return null;
}

ControllerBase.prototype.setupDone = false;

ControllerBase.prototype.getView = function() {}
ControllerBase.prototype.setup = function() {}
ControllerBase.prototype.switch = function() {
	LoadingBar.done();
}
ControllerBase.prototype.leave = function() {}
ControllerBase.prototype.onBackendReady = function() {} // if page is active in the backend gets ready, this happens


var FrontendControllers = {};
function addController(name, func)
{
	FrontendControllers[name] = func;
}