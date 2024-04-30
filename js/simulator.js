"use strict";

function Simulator(system, board)
{
	var that = this;
	var mode = 0; // 0=build 1=simulate
	var lastTool = -1;
	var dirtyElements = [];
	var dirtyGroups = [];
	
	// simulator status
	this.clockElements = [];
	this.clockStatus = 0; // 0=off 1=infinite 2=wait for stop
	this.clockTicks = 0;
	this.clockStopOnTick = 0;
	this.syncTicks = false;
	this.board = board;

	this.getMode = function()
	{
		return mode;
	}
	
	Event.on('setMode', function(newMode) {
		//if(mode == newMode) console.error("ERROR\tAlready in mode: ", newMode);
		mode = newMode;
		if(mode == 0) that.goBuild();
		if(mode == 1) that.goSimulator();
	});

	Event.on('resetSimulation', function() {
		that.goBuild();
		that.goSimulator();
	})
	
	this.goBuild = function()
	{
		if(lastTool > 0) Event.send('setTool', lastTool); // restore last tool
	
		for(var i = 0; i < board.storage.groupsGlo.length; i++)
		{
			var group = board.storage.groupsGlo[i];
			group.powerCount = 0;
		}
		for(var i = 0; i < board.storage.connectorsGlo.length; i++)
		{
			board.storage.connectorsGlo[i].power = false;
		}
		for(var i = 0; i < board.storage.elementsGlo.length; i++)
		{
			var e = board.storage.elementsGlo[i];
			e.onReset(0);
		}
		
		system.renderer.setDirty(0);
		system.renderer.setDirty(1);
		this.stopClock();
	}
	
	this.goSimulator = function()
	{
		// dbg
		for(var i = 0; i < board.storage.groupsGlo.length; i++)
		{
			var group = board.storage.groupsGlo[i];
			if(group.powerCount > 0) console.error("ERROR\tGroup has still power");
		}
		for(var i = 0; i < board.storage.connectorsGlo.length; i++)
		{
			var con = board.storage.connectorsGlo[i];
			if(con.power) console.error("ERROR\tConnector has still power");
		}
		for(var i = 0; i < board.storage.elementsGlo.length; i++)
		{
			var e = board.storage.elementsGlo[i];
			e.onReset(1);
		}
		
		// set tool
		lastTool = system.tool.getTool();
		Event.send('setTool', 4); // simulator tool
		
		// initially, set all elements as dirty
		for(var i = 0; i < board.storage.elementsGlo.length; i++)
		{
			dirtyElements.push(board.storage.elementsGlo[i]);
		}
		
		// reset simulator state
		this.clockStatus = 0;
		this.clockTicks = 0;
		this.clockElements = [];
		
		// get all clock elements
		for(var i = 0; i < board.storage.elementsGlo.length; i++)
		{
			var element = board.storage.elementsGlo[i];
			if(element instanceof ElementClock)
			{
				this.clockElements.push(element);
			}
		}
		
		Event.send('setClockAvailable', this.clockElements.length == 0 ? false : true);
	}
	
	this.addDirtyElement = function(e)
	{
		if(dirtyElements.indexOf(e) == -1) dirtyElements.push(e);
	}
	
	this.addDirtyGroup = function(group, change)
	{
		if(dirtyGroups.indexOf(group) == -1) dirtyGroups.push(group);

		// update all other groups using diodes
		if(change)
		{
			var valueChange = (group.powerCount == 0) ? -1 : 1;
			
			for(var i = 0; i < group.diodes.length; i++)
			{
				var diode = group.diodes[i];
				if(diode.groupHor == group) // is this group the horizontal part of this group?
				{
					var changedOtherGroup = false;
					if(diode.groupVer.powerCount == 0) changedOtherGroup = true;
					if(diode.groupVer.powerCount == 1 && valueChange == -1) changedOtherGroup = true;
					
					diode.groupVer.powerCount += valueChange;
					
					this.addDirtyGroup(diode.groupVer, changedOtherGroup);
				}
			}
		}
	}

	this.applyPowerOfGroup = function(group)
	{
		for(var i = 0; i < group.connectors.length; i++)
		{
			this.addDirtyElement(group.connectors[i].element);
			
			if(group.connectors[i].type == 0) // is input connector ?
			{
				group.connectors[i].power = (group.powerCount > 0 ? true : false);
			}
		}
	}
	
	this.clickElement = function(element)
	{
		element.onClick(this);
		this.addDirtyElement(element);
	}
	
	this.stopClock = function()
	{
		this.clockStatus = 0;
		Event.send("updateClock");
	}
	
	this.startStableClock = function()
	{
		this.clockStatus = 1;
		Event.send("updateClock");
	}
	
	this.startLimitedClock = function(n)
	{
		this.clockStatus = 2;
		this.clockStopOnTick = this.clockTicks + n;
		Event.send("updateClock");
	}
	
	this.getClockState = function(state)
	{
		return (this.clockStatus != 0);
	}
	
	this.clockTick = function()
	{
		this.clockTicks++;
		
		if(this.clockStatus == 2)
		{
			if(this.clockTicks >= this.clockStopOnTick) this.stopClock();
		}
	}
	
	this.ticks = function()
	{
		if(this.syncTicks)
		{
			this.singleTick();
		}
		else
		{
			var start = new Date().getTime();
			var minLogicTime = 40; // let's simulate at least for minLogicTime
			var count = 0;
			
			do
			{
				this.singleTick();
				count++;
			} while((new Date().getTime() - start) < minLogicTime);
			
			//console.log("Simulated " + count + " ticks. ", ((new Date().getTime() - start) * count / 1000) + "k");
		}
	}
	
	this.singleTick = function()
	{
		if(mode != 1) console.error("ERROR\tLogic tick without simulation");
		
		if(dirtyElements.length == 0)
		{
			this.allowTick = true;
			if(this.clockElements.length == 0) return;
			
			for(var i = 0; i < this.clockElements.length; i++)
			{
				dirtyElements.push(this.clockElements[i]);
			}
		}
		
		var localDirtyElements = dirtyElements;
		dirtyElements = [];
	
		// tick on all dirty elements
		while(localDirtyElements.length > 0)
		{
			var e = localDirtyElements.pop();
			e.onTick(this);
		}

		// apply new power to all connectors of dirty groups
		while(dirtyGroups.length > 0)
		{
			this.applyPowerOfGroup(dirtyGroups.pop());
		}
		
		this.allowTick = false;
		
		// render
		system.renderer.setDirty(0);
		system.renderer.setDirty(1);
	}
}