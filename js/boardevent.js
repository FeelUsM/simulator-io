"use strict";

function BoardEventManager(system, board)
{
	var that = this;
	this.board = board;
	this.readOnly = false;
	this.pendingForeigns = []; // if you're in simulation mode and cannot edit the board, all foreign events will get here
	
	
	Event.on('setMode', function(mode) {
		if(mode == 0)
		{
			that.readOnly = false;
			
			// switch back to edit mode, push all pending changes!
			while(that.pendingForeigns.length > 0)
			{
				var transaction = that.pendingForeigns.shift();
				that.processForeignTransaction(transaction);
			}
		}
		else if(mode == 1)
		{
			that.readOnly = true;
		}

	});
	
	this.encodeRemoteEvent = function(type, arg, lock)
	{
		var event = {t: type, l: lock};
		
		switch(type) // different serializer for different types
		{
			case 1: // add wire
				event.i = arg.id;
				event.g = arg.geo.slice();
				break;
				
			case 2: // delete wire
				event.i = arg.id;
				break;
			
			case 3: // add element
				var negators = arg.getNegators();
				event.i = arg.id;
				event.e = arg.elementId;
				event.g = arg.geo.slice();
				event.a = arg.exportArgs();
				if(!!negators) event.n = negators;
				break;
				
			case 4: // delete element
				event.i = arg.id;
				break;
				
			case 5: // negation
				event.i = arg.element.id;
				event.p = arg.pos.slice();
				event.n = arg.negated;
				break;
				
			case 6: // push diode
				event.i = arg.id;
				event.g = arg.geo.slice();
				break;
				
			case 7: // pop diode
				event.i = arg.id;
				break;

			case 8: // push text
				event.i = arg.id;
				event.g = arg.geo.slice();
				event.v = arg.text;
				event.s = arg.size;

			case 9: // pop text
				event.i = arg.id;
		}
		
		return event;
	}

	this.decodeRemoteEventArg = function(type, event)
	{
		var eventId = event.i;

		switch(type)
		{
			case 1: return {
				id: eventId,
				geo: event.g
			}
			
			case 2: return eventId;
			
			case 3:
				var element = new ElementStore[event.e].mod(event.a);
				element.id = eventId;
				element.geo = event.g;
				element.elementId = event.e;
				if(!!event.n) element.setNegators(event.n);
				return element;
				
			case 4: return eventId;
			
			case 5:
				var element = board.storage.getElementById(eventId);
				var pos = [element.geo[0] + event.p[0], element.geo[1] + event.p[1]];
				var con = board.storage.getConnectorAtPoint(pos);
				
				if(con == null || con == event.n)
				{
					console.log("ERROR\tCannot toggle connector", con);
					return;
				}
				
				return con;
			
			case 6: return {
				id: eventId,
				geo: event.g
			}
			
			case 7: return board.storage.getDiodeById(eventId);

			case 8: return {
				id: eventId,
				geo: event.g,
				text: event.v
			}

			case 9: return board.storage.getTextById(eventId);
		}
	}
	
	this.processStorageEvent = function(type, arg)
	{
		var ret = null;
		
		switch(type)
		{
			case 1:
				ret = board.storage.pushWire(arg);
				break;
				
			case 2:
				ret = board.storage.popWire(arg);
				break;
				
			case 3:
				ret = board.storage.pushElement(arg);
				break;
			
			case 4:
				ret = board.storage.popElement(arg);
				break;
				
			case 5:
				ret = board.storage.toggleNegator(arg);
				break;
				
			case 6:
				ret = board.storage.pushDiode(arg);
				break;
				
			case 7:
				ret = board.storage.popDiode(arg);
				break;

			case 8:
				ret = board.storage.pushText(arg);
				break;

			case 9:
				ret = board.storage.popText(arg);
				break;

		}
		
		return ret;
	}
	
	this.processForeignTransaction = function(data)
	{
		system.transaction.start(0, data.id, true);
				
		for(var i = 0; i < data.l.length; i++)
		{
			var event = data.l[i];
			var type = event.t;

			var arg = that.decodeRemoteEventArg(type, event);
			
			that.processStorageEvent(type, arg);
		}
		
		var transaction = system.transaction.commit();
		transaction.serverId = data.serverId;
		
		// add change overlay
		this.addOverlaysForTransaction(data);
	}
	
	this.addOverlaysForTransaction = function(data)
	{
		var user = board.users.getUserByToken(data.user);
		var color = board.users.getColorById(user.n);

		for(var i = 0; i < data.l.length; i++)
		{
			var lock = data.l[i].l;
			
			var overlayRect = [
				lock[0],
				lock[1],
				lock[2] - lock[0],
				lock[3] - lock[1]
			];
			
			// add one if this was a wire transaction
			if(data.l[i].t == 1 || data.l[i].t == 2)
			{
				overlayRect[2]++;
				overlayRect[3]++;
			}
			
			// set to size 1x1, if this was a toggleNegator transaction
			if(data.l[i].t == 5)
			{
				overlayRect[0] += data.l[i].p[0];
				overlayRect[1] += data.l[i].p[1];
				overlayRect[2] = 1;
				overlayRect[3] = 1;
			}
			
		
			system.renderer.overlayChangeAdd(overlayRect, color);
		}
		
		system.renderer.overlayChangeUpdate();
	}
	
	this.reset = function()
	{
		this.pendingForeigns = [];
	}
	
	Event.on('foreignTransaction', function(data) {
		if(that.readOnly)
		{
			// cannot push now, push to queue
			that.pendingForeigns.push(data);
		}
		else
		{
			// can edit -> push!
			that.processForeignTransaction(data);
		}
	});
	
	Event.on('confirmTransaction', function(data) {
		system.transaction.confirmTransactionById(data.id, data.serverId);
		
		system.previewMgr.announceChange();
	});
	
	Event.on('rejectTransaction', function(data) {
		system.transaction.rejectTransactionById(data.id);
	});
	
	Event.on('hashRequest', function(id) {
		var hash = null; // it is totally valid to answer a hash request with null
		if(!that.readOnly) hash = system.transaction.getHashBeforeServerId(id); // if in edit mode, calculate hash
		Backend.hashResult(id, hash);
	});
	
	Event.on('localUndo', function() {
		system.transaction.localUndo();
	});
	
	Event.on('localRedo', function() {
		system.transaction.localRedo();
	});
}