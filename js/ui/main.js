var UI = {
	_system: null,
	_systemPrepare: null, // you can pass the system object before boot, so you can use the "ensure" method later
	_inited: false,
	_initQueue: [],
	_showUpdateList: [],
	
	prebootUI: function(system) {
		UI._systemPrepare = system;
	},

	bootUI: function(system) {
		this._system = system;
		for(var i = 0; i < this._initQueue.length; i++)
		{
			this._initQueue[i](system);
		}
		
		this._inited = true;
		
		Event.on('pageChange', function() {
			UI.triggerShowUpdate();
		});
	},
	
	init: function(cb) {
		if(this._inited)
		{
			cb(this._system);
		}
		else
		{
			this._initQueue.push(cb);
		}
	},

	ensure: function() {
		if(!UI._system)
		{
			if(UI._systemPrepare)
			{
				UI.bootUI(UI._systemPrepare);
				UI._systemPrepare = null;
			}
			else
			{
				console.log("ERROR\tSystem object not prepared");
			}
		}
	}
};