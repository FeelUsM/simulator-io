"use strict";

/*
	EVENT IDs (this is not the same as a command)
		1 - Push wire (opposite: 2)
		2 - Pop wire (opposite: 1)
		3 - Push element (opposite: 4)
		4 - Pop element (opposite: 3)
		5 - Toggle negator (opposite: 5)
		6 - Push diode (opposize: 7)
		7 - Pop diode (opposize: 6)
		8 - Push text
		9 - Pop text
*/
var EventTypes = {
	1: {
		name: 'push wire',
		undo: function(info) {
			info.board.popWire(info.arg.id);
		},
	},
	
	2: {
		name: 'pop wire',
		undo: function(info) {
			info.board.pushWire(info.arg);
		},
	},
	
	3: {
		name: 'push element',
		undo: function(info) {
			info.board.popElement(info.arg.id);
		},
	},
	
	4: {
		name: 'pop element',
		undo: function(info) {
			info.board.pushElement(info.arg);
		},
	},
	
	5: {
		name: 'toggle negator',
		undo: function(info) {
			info.board.toggleNegator(info.arg);
		},
	},
	
	6: {
		name: 'push diode',
		undo: function(info) {
			info.board.popDiode(info.arg);
		},
	},
	
	7: {
		name: 'pop diode',
		undo: function(info) {
			info.board.pushDiode(info.arg);
		},
	},

	8: {
		name: 'push text',
		undo: function(info) {
			info.board.popText(info.arg);
		},
	},

	9: {
		name: 'pop text',
		undo: function(info) {
			info.board.pushText(info.arg);
		},
	}
};


function Transaction(board, type, id, foreign)
{
	this.board = board;
	this.type = type;
	this.id = id;
	this.foreign = foreign;
	this.list = [];
	this.serverId = -1;
	this.dbgStack = new Error().stack;
	

	// prepare and serialize transaction for network to json
	this.serialize = function()
	{
		var obj = {};
		obj.l = [];
		obj.id = this.id;
		
		for(var i = 0; i < this.list.length; i++)		
		{
			var event = this.list[i];
			var eventArg = event.info.arg;
			var type = event.eventId;
			var serialized = board.event.encodeRemoteEvent(type, eventArg, event.lock);
			
			obj.l.push(serialized);
		}
		
		return obj;
	}
	
	// check if two lock areas are overlapping
	this.areLocksOverlapping = function(a, b)
	{
		if(	a[0] <= b[2] && a[2] >= b[0] &&
			a[1] <= b[3] && a[3] >= b[1])
		{
			return true;
		}
		
		return false;
	}
	
	// check if any lock area of this transaction is overlapping with another transactions lock areas
	this.collidesWidth = function(other)
	{
		var collide = false;
		for(var a = 0; a < this.list.length; a++)
		{
			for(var b = 0; b < other.list.length; b++)
			{
				if(this.areLocksOverlapping(this.list[a].lock, other.list[b].lock))
				{
					collide = true;
					break;
				}
			}
			
			if(collide) break;
		}
		
		return collide;
	}
	
	// undo all events
	this.undo = function()
	{
		for(var i = this.list.length - 1; i >= 0; i--)
		{
			var event = this.list[i];
			var staticInfo = EventTypes[event.eventId];
			staticInfo.undo(event.info);
		}
	}
	
	// add serverId to transaction (after foreign or confirm call)
	this.addServerId = function(id)
	{
		if(this.serverId != -1) console.error("ERROR\tServerID already set");
		this.serverId = id;
	}
	
	// add event to transaction event list
	this.addEvent = function(eventId, info, lock)
	{
		this.list.push({
			eventId: eventId,
			info: info,
			lock: lock
		});
	}
}

function TransactionManager(system, board)
{
	var that = this;

	// all recent transactions (for network sync and undo/redo support)
	var stackProcessed = [];
	var stackUndo = [];
	var stackRedo = [];
	var stackPending = [];
	var pendingLocals = false;

	// the currently open transaction
	var currentTransaction = null;


	this.getPendingTransactionById = function(id)
	{
		/*for(var i = 0; i < stackProcessed.length; i++)
		{
			if(stackProcessed[i].id == id) return stackProcessed[i];
		}
		
		for(var i = 0; i < stackRedo.length; i++)
		{
			if(stackRedo[i].id == id) return stackRedo[i];
		}*/		

		for(var i = 0; i < stackPending.length; i++)
		{
			if(stackPending[i].id == id) return stackPending[i];
		}
		
		return null;
	}
	
	// starts a new transaction
	this.start = function(type, id, foreign) // type: 0 = normal, 1 = undo transaction, 2 = redo transaction, 3 = null transaction
	{
		if(this.currentTransaction)
		{
			console.error("ERROR\tCannot start transaction, commit or rollback the current one first.");
			console.log("From: ", new Error().stack);
			console.log("Existing: ", this.currentTransaction.dbgStack);
			return;
		}
		type = type || 0; 
		foreign = foreign || false;
		id = id || '';
		
		// generate guid if necessary
		if(!foreign && id == '')
		{
			if(Config.boardServerState) // is live board or snapshot? don't send anything to a snapshot
			{
				id = Config.boardServerState.token + '-t-' + Config.transactionId;
				Config.transactionId++;
			}
		}
		
		// have to prepare pending stack for foreign transaction?
		if(foreign)
		{
			this.prepareForeignTransaction(); // handle action "foreign" or "commit local"
		}
		
		// finally create transaction!
		this.currentTransaction = new Transaction(board, type, id, foreign);
	}
	
	this.rollback = function()
	{
		this.currentTransaction.undo();
		this.currentTransaction = null;
	}
	
	// commits the current transaction
	this.commit = function(overwriteType) // if this is a null-transaction (type 3), you cannot commit it without setting a final type
	{
		var localConfirm = false; // if this is true, this local transaction gets confirmed instantly and without server interaction

		if(typeof overwriteType === "undefined") overwriteType = null; // default value
	
		if(!this.currentTransaction)
		{
			console.error("ERROR\tNo running transaction.");
			return;
		}
		
		// to pre-commit stuff (like refreshing wire groups)
		board.logic.onCommit();

		// send to server if necessary
		if(!this.currentTransaction.foreign && this.currentTransaction.type != 3 && this.currentTransaction.list.length > 0)
		{
			if(Config.boardServerState) // only send if we have a valid server state.
			{
				Backend.sendTransaction(this.currentTransaction.serialize());
			}
			else // instant confirm!
			{
				localConfirm = true;
			}
		}
		
		// a commit may cause the start of other transactions, so let's clear currentTransaction now
		var transaction = this.currentTransaction;
		this.currentTransaction = null;
		
		// handle commit
		if(transaction.list.length > 0)
		{
			if(transaction.type == 0)
			{
				this.handleTransactionAction(transaction, transaction.foreign ? 0 : 3); // handle action "foreign" or "commit local"
			}
			else if(transaction.type == 1)
			{
				this.handleTransactionActionUndo(transaction);
			}
			else if(transaction.type == 2)
			{
				this.handleTransactionActionRedo(transaction);
			}
		}
		
		if(localConfirm) this.handleTransactionAction(transaction, 2);

		// set the final type, if the initial type was a null transaction
		if(transaction.type == 3)
		{
			if(overwriteType != null)
			{
				transaction.type = overwriteType;
			}
			else
			{
				console.error("ERROR\tOverwrite type isn't set on commit of null-transaction", new Error().stack);
			}
		}
		else
		{
			if(overwriteType != null) console.error("ERROR\tCannot set final type if first type wasn't a null transaction");
		}
		
		return transaction;
	}
	
	// undo all transactions on pending stack and pushs inverted transactions
	this.invertPendingStack = function()
	{
		// this code "inverts" all transactions on the pending stack
		var undoTransactions = [];
		while(stackPending.length > 0)
		{
			var stackItem = stackPending.pop();
			var originalType = stackItem.type;
			this.start(3, stackItem.id);
			if(stackItem.serverId != -1) console.error("ERROR\tInverted transaction already got a server ID");
			stackItem.undo();
			undoTransactions.push(this.commit(originalType));
		}
		
		stackPending = undoTransactions;
	}
	
	this.prepareForeignTransaction = function()
	{
		if(pendingLocals == false && stackPending.length > 0)
		{
			this.invertPendingStack();
		}		
	}
	
	// handles transaction action (see logic_transaction_states.xlsx)
	// action: 
	//  0 - foreign
	//  1 - reject
	//  2 - confirm
	//  3 - local commit
	
	this.handleTransactionAction = function(transaction, action)
	{
		// error handling (pending locals shouldn't be true if the pending stack is empty)
		if(stackPending.length == 0 && pendingLocals == true)
		{
			console.error("ERROR\tInvalid pending locals state");
			return;
		}
		
		// error handling (you cannot have a confirm/reject if you pending stack is empty)
		if(stackPending.length == 0 && (action == 1 || action == 2))
		{
			console.error("ERROR\tInvalid pending locals state");
			return;
		}

		// dispatch!
		switch(action)
		{
			case 0:
				if(this.handleTransactionActionForeign(transaction)) return;
				break;
				
			case 1:
				if(this.handleTransactionActionReject(transaction)) return;
				break;
		
			case 2:
				if(this.handleTransactionActionConfirm(transaction)) return;
				break;
			
			case 3: 
				if(this.handleTransactionActionLocalCommit(transaction)) return;
				break;
		}

		console.error("ERROR\tUnkown transaction state", new Error().stack);
	}
	
	this.handleTransactionActionForeign = function(transaction)
	{
		if(pendingLocals == true && stackPending.length > 0)
		{
			//console.log("case C2");
		}
		if(pendingLocals == false && stackPending.length == 0)
		{
			//console.log("case C5");
		}
		if(pendingLocals == false && stackPending.length > 0)
		{
			//console.log("case C4");
			pendingLocals = true;
		}
		
		stackProcessed.push(transaction); // only push foreigns to processed list, not redo/undo list
		
		return true;
	}
				
	this.handleTransactionActionReject = function(transaction)
	{
		if(pendingLocals)
		{
			//console.log("case D2");
						
			var transaction2 = stackPending.pop();
			if(transaction != transaction2)
			{
				console.error("ERROR\tConfirm/reject in wrong order", transaction, transaction2);
				return;
			}
			
			if(stackPending.length == 0) pendingLocals = false;
		}
		else
		{
			//console.log("case D4");
			
			var transaction2 = stackPending.shift();
			if(transaction != transaction2)
			{
				console.error("ERROR\tConfirm/reject in wrong order", transaction, transaction2);
				return;
			}
			
			this.start(3);
			transaction.undo();
			this.commit(3);
		}
		
		this.updateDoButtons();
		this.updateSavingText();
		
		return true;
	}
	
	this.handleTransactionActionConfirm = function(transaction)
	{
		var finalTransaction = null;
	
		if(pendingLocals)
		{
			//console.log("case E2");

			var transaction2 = stackPending.pop();
			if(transaction != transaction2)
			{
				console.error("ERROR\tConfirm/reject in wrong order", transaction, transaction2);
				return;
			}

			this.start(3, transaction.id);
			transaction.undo();
			finalTransaction = this.commit(transaction.type);
						
			if(stackPending.length == 0) pendingLocals = false;
		}
		else
		{
			//console.log("case E4");
			var transaction2 = stackPending.shift();

			if(transaction != transaction2)
			{
				console.error("ERROR\tConfirm/reject in wrong order", transaction, transaction2);
				return;
			}
			
			finalTransaction = transaction;
		}
		
		// add to processed list
		stackProcessed.push(finalTransaction);
		
		// put transaction in undo/redo stack
		switch(finalTransaction.type)
		{
			case 0: // confirmed common transaction
			case 2: // confirmed redo transaction (a transaction from the redo stack which gets executed again)
				stackUndo.push(finalTransaction);
				break;
				
			case 1: // that was an undo transaction, so put it on the redo stack
				stackRedo.push(finalTransaction);
				break;
				
			default:
				console.error("ERROR\tUnkown transaction type");
		}
		
		this.updateDoButtons();
		this.updateSavingText();
		
		return true;
	}
	
	this.handleTransactionActionLocalCommit = function(transaction)
	{
		if(pendingLocals)
		{
			if(stackPending.length > 0)
			{
				//console.log("case F3");
				
				// undo local transaction and safe inverted one on pending stack
				this.start(3, transaction.id);
				transaction.undo();
				stackPending.unshift(this.commit(transaction.type));
				stackRedo = [];
				
				this.updateDoButtons();
				this.updateSavingText();

				return true;
			}
		}
		else
		{
			if(stackPending.length == 0)
			{
				//console.log("case F5");	
			}
			else
			{
				//console.log("case F4");
			}
			
			stackPending.push(transaction);
			stackRedo = [];
			
			this.updateDoButtons();
			this.updateSavingText();

			return true;
		}
	}
	
	this.handleTransactionActionUndo = function(transaction)
	{
		if(stackPending.length > 0)
		{
			console.error("ERROR\tCannot put undo on non-empty stackPending");
			return;
		}
	
		stackPending.push(transaction);
	}
	
	this.handleTransactionActionRedo = function(transaction)
	{
		if(stackPending.length > 0)
		{
			console.error("ERROR\tCannot put redo on non-empty stackPending");
			return;
		}
	
		stackPending.push(transaction);
	}
	
	// add event to the current transaction
	this.addEvent = function(eventId, info, lock)
	{
		if(!this.currentTransaction)
		{
			console.error("ERROR\tNo running transaction.");
			return;
		}
		
		if(lock.length != 4)
		{
			console.error("ERROR\tInvalid lock area");
			return;
		}

		this.currentTransaction.addEvent(eventId, info, lock);
	}
	
	// move own transaction from pending to undo stack
	this.confirmTransactionById = function(id, serverId)
	{
		var transaction = this.getPendingTransactionById(id);
		transaction.addServerId(serverId);
		this.handleTransactionAction(transaction, 2);
	}
	
	// delete from pending stack and undo
	this.rejectTransactionById = function(id)
	{
		var transaction = this.getPendingTransactionById(id);
		this.handleTransactionAction(transaction, 1);
	}
	
	// calculate hash from storage at the last point before a server transaction id
	this.getHashBeforeServerId = function(id)
	{
		var hash = null;
	
		if(stackPending.length > 0) this.invertPendingStack();

		// nothing really special, just check if the last serverID is correct			
		if(stackProcessed.length > 0 && stackProcessed[stackProcessed.length - 1].serverId == id)
		{
			hash = board.storage.hash();
		}
		else
		{
			console.error("ERROR\tInvalid hash request ", stackProcessed);
		}

		if(stackPending.length > 0) this.invertPendingStack();

		return hash;
	}
	
	// try to undo last local transaction
	this.localUndo = function(redo)
	{
		redo = redo || false;
		var stackSpecial = redo ? stackRedo : stackUndo;
	
		// asserts
		if(stackPending.length > 0)
		{
			console.log("WARN\tCannot undo anything when there are still pending transactions");
			this.updateDoButtons();
			this.updateSavingText();
			return;
		}
		
		if(stackSpecial.length == 0)
		{
			Event.send('undoFailed', redo ? 'emptyRedo' : 'emptyUndo');
			this.updateDoButtons();
			this.updateSavingText();
			return;
		}
	
		// take last element from stackUndo (or stackRedo) and search in stackProcessed
		var undoTransaction = stackSpecial.pop();
		var processedIdx = stackProcessed.indexOf(undoTransaction);
		
		if(processedIdx == -1)
		{
			console.error("ERROR\tCannot find transaction in processed");
			this.updateDoButtons();
			this.updateSavingText();
			return;
		}
		
		
		// check if has conflict with foreign transactions, for that, let's search all foreigns before
		var foreignList = [];
		for(var i = processedIdx; i < stackProcessed.length; i++)
		{
			var otherTransaction = stackProcessed[i];
			if(otherTransaction.foreign) foreignList.push(otherTransaction);
		}
		
		// compare locks
		var collide = false;
		for(var i = 0; i < foreignList.length; i++)
		{
			if( undoTransaction.collidesWidth(foreignList[i]) )
			{
				collide = true;
				break;
			}
		}
		
		// handle collision result
		if(collide)
		{
			Event.send('undoFailed', 'collide');
		}
		else
		{
			// finally, undo it! we will remove it from stackProcessed once it got confirmed
			this.start(redo ? 2 : 1);
			undoTransaction.undo();
			this.commit();
		}
		
		this.updateDoButtons();
		this.updateSavingText();
	}
	
	// try to redo last local transaction
	this.localRedo = function()
	{
		this.localUndo(true);
	}
	
	// send update event for redo/undo buttons
	this.updateDoButtons = function()
	{
		var stateUndo = (stackUndo.length > 0);
		var stateRedo = (stackRedo.length > 0);
		
		if(stackPending.length > 0)
		{
			stateUndo = stateRedo = 0;			
		}
	
		Event.send('updateDoButtonsState', {
			undo: stateUndo,
			redo: stateRedo
		});
	}

	this.updateSavingText = function()
	{
		if(Config.boardServerState) // is live?
		{
			if(stackPending.length == 0)
			{
				Event.send('saveState', 2);
			}
			else
			{
				Event.send('saveState', 1);
			}
		}
		else // snapshot/anonymous?
		{
			Event.send('saveState', 3);	
		}
	}

	// delete undo and redo stacks
	this.reset = function()
	{
		stackProcessed = [];
		stackUndo = [];
		stackRedo = [];
		stackPending = [];
		pendingLocals = false;
		
		this.updateDoButtons();
	}

	// handler
	Event.on('joinBoardResult', function() {
		that.updateDoButtons();
		Event.send('saveState', 0);
	});

	Event.on('loadBoardResult', function() {
		that.updateDoButtons();
		Event.send('saveState', 0);
	});
}