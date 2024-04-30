var Clipboard = new function(){
	//var cbPaste = null;
	var cbCutDelete = null;

	/*this.registerPaste = function(cb)
	{
		if(cbPaste != null) console.error("ERROR\tDouble register paste handler");
	}*/

	this.registerCutDelete = function(cb)
	{
		if(cbCutDelete != null) console.error("ERROR\tDouble register cutdelete handler");
	}

	this.init = function()
	{
		$(window).bind('storage', function (e) {
			var original = e.originalEvent;
			console.log("clipboard storage",e)
		    //if(original.key == "key")
		});
	}

	this.copy = function(value)
	{
		if(!localStorage) return;
		localStorage.setItem('clipboard', JSON.stringify(value));
	}

	this.get = function()
	{
		if(!localStorage) return null;
		return JSON.parse( localStorage.getItem('clipboard') );
	}

	this.init();
};