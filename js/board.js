"use strict";

function Board(system)
{
	var storageOpt = {
		versionLogic: Config.versionLogic,
		versionStorage: Config.versionStorage,
		token: '',
		quadSize: Config.quadSize
	}
	
	this.system = system;
	
	this.logic = new BoardLogic(system, this);
	this.storage = new BoardStorage(system, this, storageOpt);

	this.event = new BoardEventManager(system, this);
	this.users = new UserProvider(system, this);

	//this.logic.test(); // dev tests in logic
	
	this.reset = function()
	{
		this.logic.reset();
		this.storage.reset();
		this.event.reset();
		this.users.reset();
		system.renderer.reset();

		Event.send('triggerLayoutUpdate');
	}
}