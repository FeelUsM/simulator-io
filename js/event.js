var Event = {
	_registered: {},

	send: function(event, arg)
	{
		if(!!this._registered[event])
		{
			for(var i = 0; i < this._registered[event].length; i++)
			{
				this._registered[event][i](arg);
			}
		}
		else
		{
			console.log("NO EVENT LISTENER", event, arg);
		}
	},
	
	on: function(event, cb, where)
	{
		console.log("on",event,where)
		if(!this._registered[event]) this._registered[event] = [];
		this._registered[event].push(cb);
	},
	
	onKey: function(event, key, cb, where)
	{
		this.on(event, function(arg){
			if(arg.key == key) cb(arg);
		}, where);
	}
};