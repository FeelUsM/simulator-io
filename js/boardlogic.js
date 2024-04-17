"use strict";

function BoardLogic(system, board)
{
	var that = this;
	this.size = []; // size in grid points [x, y]. if you place an element over the size, the size have to adjust
	
	this.grouplessWires = [];		// a temporary list with all wires without a group
	this.dirtyDiodes = [];			// a temporary list with all diodes with changed/invalid groups
	this.dirtyConnectors = [];		// a temporary list with all connectors which are not updates regarding the group

	
	this.reset = function()
	{
		this.size = [];
		
		this.grouplessWires = [];
		this.dirtyDiodes = [];
		this.dirtyConnectors = [];
	}

	/*
		Don't call this function directly. Please only do it from app.js
		
		cmd:
			0	reserved
			1	add wire
			2	delete wire
			3	add element
			4	delete element
			5	toggle connection
			6	toggle diode
			7	delete all selected
			8	set selection area
			9	move selected by offset
		    10	copy selected
	*/
	this.execCommand = function(cmd, arg)
	{
		switch(cmd)
		{
			case 1:
				return this.addWire({
					geo: [arg[0], arg[1]]
				});
				
			case 2:
				return this.deleteWire({
					geo: [arg[0], arg[1]]
				});
			
			case 3:
				return this.addElement(arg.id, arg.geo, arg.args);
				
			case 4:
				return this.deleteElement(arg);
				
			case 5:
				return this.toggleConnection(arg);
				
			case 6:
				return this.toggleDiode(arg);
				
			case 7:
				return this.selectionDelete(arg);

			case 8:
				return this.setSelectionArea(arg);

			case 9:
				return this.moveSelected(arg);

			case 10:
				return this.selectionCopy(arg);

			case 11:
				return this.selectionPaste(arg);

			case 12:
				return this.selectionPasteEnd(arg);

			case 13:
				return this.addText(arg);

			case 14:
				return this.deleteText(arg);
				
			default:
				console.log("ERROR\tUnknown command: " + cmd);
		}
	}
	
	
	this.onCommit = function()
	{
		this.updateWireGroup();
		this.updateConnectorGroup();
		this.updateBoardSize();
	}
	
	
	this.addWire = function(arg)
	{
		if(typeof arg.geo == 'undefined')
		{
			console.log("ERROR\tWire doesn't have geo information");
			return false;
		}
	
		if(this.pointEqual(arg.geo[0], arg.geo[1])) return true; // nothing to do here
		
		// sort points
		var d = board.storage.getWireDirection(arg);
		if(arg.geo[0][d] > arg.geo[1][d]) arg.geo = [arg.geo[1], arg.geo[0]];
		
		if(arg.geo[0][0] <= 0 || arg.geo[0][1] <= 0) return false; // don't place out of screen
		

		// get all other wires
		var addList = [];
		var repairList = [];
		var splitPointList = [];
		var startWire = arg.geo[0];
	
		// iterate over all points on wire (to find elements)
		for(var i = arg.geo[0][d]; i <= arg.geo[1][d]; i++)
		{
			var endpoint = (i ==  arg.geo[0][d] || i ==  arg.geo[1][d]) ? true : false; // is this point an endpoint?
			var p = [arg.geo[0][0], arg.geo[0][1]];
			p[d] = i;
			
			// check if the wires crosses an element
			var element = board.storage.getElementAtPoint(p);
			if(element != null)
			{
				if(endpoint) // wires just touches the element or is inside?
				{
					var rel = [p[0] - element.geo[0], p[1] - element.geo[1]];
					var con = element.getConnector(rel);
					
					if(con != null)
					{
						var directionOk = false;
						if(con.dir == 4) directionOk = true; // middle?
						if((con.dir == 1 || con.dir == 3) && d == 0) directionOk = true; // horizontal?
						if((con.dir == 0 || con.dir == 2) && d == 1) directionOk = true; // vertical?
						
						if(!directionOk)
						{
							return false; // cannot connect wire from wrong side to connector
						}
					}
					else
					{
						return false; // cannot place on element, if there is no connector under it
					}
				}
				else
				{
					return false; // cannot place on element
				}
			}
		}
		
		// iterate over all points on wire (to find other wires)
		// which point-to-point ways are already covered by other wires (length: wire length)
		var assigned = []; 
		for(var i = arg.geo[0][d]; i < arg.geo[1][d]; i++)
		{
			var result = false;
			
			// get values
			var p = [arg.geo[0][0], arg.geo[0][1]];
			p[d] = i;
			var wiresAtA = board.storage.getWiresByIntersection(p, d);
			p[d]++;
			var wiresAtB = board.storage.getWiresByIntersection(p, d);
			
			// check n=>n relation
			if(wiresAtA != null && wiresAtB != null)
			{
				for(var iA = 0; iA < wiresAtA.length; iA++)
				{
					for(var iB = 0; iB < wiresAtB.length; iB++)
					{
						if(wiresAtA[iA].id == wiresAtB[iB].id)
						{
							result = true;
						}
					}
				}
			}
						
			assigned.push( result );
		}
		
		// 
		var assignedIndex = 0;
		var wireStartPoint = null;
		for(var i = arg.geo[0][d]; i <= arg.geo[1][d]; i++, assignedIndex++)
		{
			var startNewWire = false;
		
			var p = [arg.geo[0][0], arg.geo[0][1]];
			p[d] = i;
			
			var wiresIndirect = board.storage.getWiresByEndpoint(p, 1 - d);
			
			if(wiresIndirect.length > 0) startNewWire = true;
			if(!assigned[assignedIndex] && wireStartPoint == null) startNewWire = true;
			if(assigned[assignedIndex] && wireStartPoint != null) startNewWire = true;
			if(i == arg.geo[1][d]) startNewWire = true;
			
			if(startNewWire)
			{
				if(wireStartPoint != null)
				{
					splitPointList.push(wireStartPoint);
					splitPointList.push(p);
					
					addList.push([wireStartPoint, p]);
				}
				
				wireStartPoint = assigned[assignedIndex] ? null : p;
			}
		}
		
		{ // add all wire parts
			for(var i = 0; i < addList.length; i++)
			{
				var id = board.event.processStorageEvent(1, {geo:addList[i]}); // push wire
				repairList.push(id);
			}
		}
	
		{ // repair wires (combine)
			var count = 0;
			while(this.repairWires(repairList) && count < 50)
			{
				count++;
			}
			
			if(count >= 50) console.log("ERROR\tToo many repair cycles!");
		}
		
		{ // split wires
			var splitList = [];
			
			// make unique points
			for(var i = 0; i < splitPointList.length; i++)
			{
				var found = false;
				for(var n = 0; n < splitList.length; n++)
				{
					if(this.pointEqual(splitList[n], splitPointList[i]))
					{
						found = true;
						break;
					}
				}
				
				if(!found) splitList.push(splitPointList[i]);
			}
			
			// split unique wires
			for(var i = 0; i < splitList.length; i++)
			{
				var wires = board.storage.getWiresByIntersection(splitList[i], 1 - d, true);
				if(wires != null)
				{
					this.splitWire(wires[0], splitList[i]);
				}
			}
		}
		
		
		return true;
	}


	
	this.deleteWire = function(arg)
	{
		if(typeof arg.geo == 'undefined')
		{
			console.log("ERROR\tWire doesn't have geo information");
			return;
		}
		
		if(this.pointEqual(arg.geo[0], arg.geo[1])) return; // nothing to do here
		
		var d = board.storage.getWireDirection(arg);
		
		// sort points
		if(arg.geo[0][d] > arg.geo[1][d]) arg.geo = [arg.geo[1], arg.geo[0]];
		
		// delete all wires on the way
		var repairPoints = [arg.geo[0].slice(), arg.geo[1].slice()];
		var combinePoints = [];
		
		for(var i = arg.geo[0][d]; i <= arg.geo[1][d]; i++)
		{
			// create iterator point
			var p = [arg.geo[0][0], arg.geo[0][1]];
			p[d] = i;
			
			// get wires on that point
			var wires = board.storage.getWiresByIntersection(p, d);

			if(wires != null)
			{
				for(var n = 0; n < wires.length; n++)
				{
					// save repair points
					if(wires[n].geo[0][d] < repairPoints[0][d]) repairPoints[0][d] = wires[n].geo[0][d];
					if(wires[n].geo[1][d] > repairPoints[1][d]) repairPoints[1][d] = wires[n].geo[1][d];
					
					// delete
					board.event.processStorageEvent(2, wires[n].id);
				}
			}
			
			// get crossing wires on that point
			wires = board.storage.getWiresByEndpoint(p, 1 - d);
			if(wires.length == 2)
			{
				combinePoints.push(p);
			}
		}
		
		{ // repair: collateral damage from delete all direct lines on the delete line
			var p = [ repairPoints[0], arg.geo[0], arg.geo[1], repairPoints[1] ];
			
			if(!this.pointEqual(p[0], p[1]))
			{
				this.addWire({geo: [ p[0], p[1] ] });
			}
			if(!this.pointEqual(p[2], p[3]))
			{
				this.addWire({geo: [ p[2], p[3] ] });
			}
		}
		
		{ // combine wires
			for(var i = 0; i < combinePoints.length; i++)
			{
				var wiresDirect = board.storage.getWiresByEndpoint(combinePoints[i], d);
				var wiresIndirect = board.storage.getWiresByEndpoint(combinePoints[i], 1 - d);
				var connector = board.storage.getConnectorAtPoint(combinePoints[i]);
				
				if(wiresIndirect.length == 2 && wiresDirect.length == 0 && connector == null)
				{
					this.combineWires(wiresIndirect[0].id, wiresIndirect[1].id);
				}
			}
		}
	}

	
	
	this.toggleConnection = function(p)
	{
		// connection
		var wires0 = board.storage.getWiresByEndpoint(p, 0);
		var wires1 = board.storage.getWiresByEndpoint(p, 1);
		var connector = board.storage.getConnectorAtPoint(p);
		var found = false;
		
		if(wires0.length == 2 && wires1.length == 2 && connector == null) // connect 2x2 wires (remove via) ?
		{
			this.combineWires(wires0[0].id, wires0[1].id);
			this.combineWires(wires1[0].id, wires1[1].id);
			found = true;
		}
		else if(wires0.length == 0 && wires1.length == 0) // disconnect 2 wires (add via) ?
		{
			var wires0 = board.storage.getWiresByIntersection(p, 0);
			var wires1 = board.storage.getWiresByIntersection(p, 1);
			
			if(!!wires0 && !!wires1)
			{
				if(connector != null) console.log("ERROR\tConnector is on wire");
				
				if(wires0.length == 1 && wires1.length == 1) // yes, that are our wires to split!
				{
					this.splitWire(wires0[0], p);
					this.splitWire(wires1[0], p);
					found = true;
				}
			}
		}
		
		// negator
		if(!found) // maybe there is no connection but a connector to toggle the negator?
		{
			if(connector) board.event.processStorageEvent(5, connector);
		}
	}	
	
	
	this.toggleDiode = function(p, v)
	{
		var wires0 = board.storage.getWiresByEndpoint(p, 0);
		var wires1 = board.storage.getWiresByEndpoint(p, 1);
		var connector = board.storage.getConnectorAtPoint(p);
		var diode = board.storage.getDiodeAtPoint(p);
		var found = false;
		var wireCount = wires0.length + wires1.length;

		var targetState = true; // true=add  false=delete
		if(diode != null) targetState = false;

		if(typeof v != "undefined")
		{
			if(v != targetState) return;
		}
		
		if(!targetState) // delete existing diode
		{
			var g0 = diode.groupHor;
			var g1 = diode.groupVer;
			
			board.event.processStorageEvent(7, diode); // delete
			if(g0 == g1)
			{
				this.cancelGroup(g0);
			}
			else
			{
				this.cancelGroup(g0);
				this.cancelGroup(g1);
			}
			
			if(wireCount == 4)
			{
				this.combineWires(wires0[0].id, wires0[1].id);
				this.combineWires(wires1[0].id, wires1[1].id);
			}
		}
		else // add diode
		{
			if(wireCount > 2 && connector == null) // check if there is already a connection (4 wires)
			{
				board.event.processStorageEvent(6, {geo:p});
				return;
			}
			else if(wireCount == 0) // maybe we have to split some wires first
			{
				wires0 = board.storage.getWiresByIntersection(p, 0);
				wires1 = board.storage.getWiresByIntersection(p, 1);
		
				if(!!wires0 && !!wires1)
				{
					if(connector != null) console.log("ERROR\tConnector is on wire");
				
					// yes, that are our wires to split!
					if(wires0.length == 1 && wires1.length == 1)
					{
						this.splitWire(wires0[0], p);
						this.splitWire(wires1[0], p);
						//this.updateWireGroup();
						board.event.processStorageEvent(6, {geo:p}); // after that, add diode
						return;
					}
				}
			}
		}
	}

	
	this.addElement = function(id, geo, arg, negators)
	{	
		if(geo[0] <= 0 || geo[1] <= 0) return false; // don't place out of screen
	
		var e = ElementStore[id];
		var obj = new e.mod(arg);
		
		if(!this.elementAbleToPlace(obj, geo)) return false;
		
		// generate obj, push function will add id member
		obj.geo = geo;
		obj.elementId = id;

		if(!!negators) obj.setNegators(negators);

		// push element
		board.event.processStorageEvent(3, obj);
		
		// if you place an element next to another element, so there is only a small gap between both connectors it places a small helper wire
		this.addConnectorHelperWires(obj);

		return true;
	}
	
	
	
	this.deleteElement = function(pos)
	{
		var element = board.storage.getElementAtPoint(pos);
		if(element)
		{
			// pop
			board.event.processStorageEvent(4, element.id);
			
			// if it is an element with a single type-4-connector, check if we have to combine wires
			if(element.connectors.length == 1 && element.connectors[0].dir == 4)
			{
				var geo = element.connectors[0].geo;
				var wires = [
					board.storage.getWiresByEndpoint(geo, 0),
					board.storage.getWiresByEndpoint(geo, 1)
				];
				
				for(var i = 0; i < 2; i++)
				{
					if(wires[i].length == 2 && wires[1 - i].length == 0) this.combineWires(wires[i][0].id, wires[i][1].id);
				}
			}
		}
	}
	
	
	
	this.addConnectorHelperWires = function(element)
	{
		for(var i = 0; i < element.connectors.length; i++)
		{
			var con = element.connectors[i];
			var opposite = -1;
			var pos = [element.geo[0] + con.pos[0], element.geo[1] + con.pos[1]];
			var next = pos.slice();
			
			// first connector
			switch(con.dir)
			{
				case 0: next[1]--; opposite = 2; break;
				case 1: next[0]++; opposite = 3; break;
				case 2: next[1]++; opposite = 0; break;
				case 3: next[0]--; opposite = 1; break;
				case 4:
					continue; // do not connect to middle connectors
				default:
					console.log("ERROR\tUnknown direction");
			}
			
			// find second connector
			var con2 = board.storage.getConnectorAtPoint(next);
			if(con2 != null && con2.dir == opposite)
			{
				// check if there is already a wire
				var d = 1 - (con.dir % 2);
				var wires = board.storage.getWiresByEndpoint(next, d);
				
				if(wires.length == 0)
				{
					// no wire found -> place
					this.addWire({
						geo: [pos, next]
					});
				}
			}
		} 
	}


	
	this.splitWire = function(wire, p)
	{
		var d = board.storage.getWireDirection(wire);
		var line = wire.geo[0][1 - d];
		
		if(line != p[1 - d])
		{
			console.log("ERROR\tCannot split wire on that line ", p);
			return null;
		}
		
		if(p[d] > wire.geo[0][d] && p[d] < wire.geo[1][d])
		{
			// collect data
			var points = [ wire.geo[0], p, wire.geo[1] ];
		
			// delete old wire
			board.event.processStorageEvent(2, wire.id);

			// add new wires
			board.event.processStorageEvent(1, {geo: [ points[0], points[1] ] });
			board.event.processStorageEvent(1, {geo: [ points[1], points[2] ] });
		}
		else
		{
			console.log("ERROR\tPoint is no intersection of wire ", wire, p, d, line);
			return null;
		}
	}
	


	this.combineWires = function(idA, idB)
	{
		if(idA == idB)
		{
			console.log("ERROR\tCannot combine wire with same id ", idA);
			return;
		}
	
		var wA = board.storage.getWireById(idA);
		var wB = board.storage.getWireById(idB);
		var dA = board.storage.getWireDirection(wA);
		var dB = board.storage.getWireDirection(wB);		
		
		if(dA == dB)
		{
			var wiresAtEndpoints = [board.storage.getWiresByEndpoint(wA.geo[0], dA, idA), board.storage.getWiresByEndpoint(wA.geo[1], dA, idA)];
			var endpointOfA = -1;

			for(var i = 0; i < 2 && endpointOfA == -1; i++)
			{
				for(var n = 0; n < wiresAtEndpoints[i].length; n++)
				{
					if(wiresAtEndpoints[i][n].id == idB)
					{
						endpointOfA = i;
						break;
					}
				}
			}
			
			if(endpointOfA == -1)
			{
				console.log("ERROR\tCannot combine bith wires, because they don't share any endpoint");
			}
			else
			{
				// collect data of new wire
				var pointsOnLine = [wA.geo[1 - endpointOfA][dA], wB.geo[endpointOfA][dA]];
				var line = wA.geo[0][1 - dA]; // the x or y value of the new line, which is shared by both endpoints
				
				// delete old wire
				board.event.processStorageEvent(2, idA);
				board.event.processStorageEvent(2, idB);
				
				// sort
				if(pointsOnLine[0] > pointsOnLine[1]) pointsOnLine = [pointsOnLine[1], pointsOnLine[0]];
				
				// add new wire
				var p = [ [line, line], [line, line] ];
				for(var i = 0; i < 2; i++)
				{				
					p[i][dA] = pointsOnLine[i];
				}
				
				return board.event.processStorageEvent(1, {geo:p});
			}
		}
		else
		{
			console.log("ERROR\tCannot combine wires with different directions: ", idA, idB);
		}
		
		return null;
	}



	this.updateWireGroup = function()
	{
		while(this.grouplessWires.length > 0)
		{
			var wire = this.grouplessWires.shift();
			if(wire.group != null) continue; // don't use this wire
			
			// find all wires and groups connected to this wire
			var foundGroups = [];
			var neightbours = [];
			var diodes = [];
			this.findWiresRecursive(wire, neightbours, diodes);
			
			for(var i = 0; i < neightbours.length; i++)
			{
				if(neightbours[i].group != null)
				{
					if(foundGroups.indexOf(neightbours[i].group) == -1)
					{
						foundGroups.push(neightbours[i].group);
					}
				}
			}

			// find new group
			var newGroup = null;
			if(foundGroups.length == 0)
			{
				// there is no group yet -> create
				newGroup = board.storage.pushGroup();
			}
			else if(foundGroups.length == 1)
			{
				// use the existing group
				newGroup = foundGroups[0];
			}
			else
			{
				// merge groups -> use first one, delete all others
				newGroup = foundGroups[0];
				for(var i = 1; i < foundGroups.length; i++)
				{
					// delete group, we don't have to overwrite the group property of all wires, because we will overwrite it in the next step
					this.cancelGroup(foundGroups[i]);
				}				
			}
	
			// assign all wires to group
			for(var i = 0; i < neightbours.length; i++)
			{
				if(neightbours[i].group != newGroup)
				{
					// assign!
					neightbours[i].group = newGroup;
					newGroup.wires.push(neightbours[i]);
				}
			}
		}

		// update diodes
		while(this.dirtyDiodes.length > 0)
		{
			var diode = this.dirtyDiodes.pop();
			if(board.storage.diodesGlo.indexOf(diode) == -1) continue; // already deleted
			
			var wiresHor = board.storage.getWiresByEndpoint(diode.geo, 0);
			var wiresVer = board.storage.getWiresByEndpoint(diode.geo, 1);
			
			if(wiresHor.length > 0 && wiresVer.length > 0 && wiresHor[0].group != null && wiresVer[0].group != null)
			{
				var groupHor = wiresHor[0].group;
				var groupVer = wiresVer[0].group;
				
				diode.groupHor = groupHor;
				diode.groupVer = groupVer;
				
				if(diode.groupHor.diodes.indexOf(diode) == -1) diode.groupHor.diodes.push(diode);
				if(diode.groupVer.diodes.indexOf(diode) == -1) diode.groupVer.diodes.push(diode);
			}
			else
			{
				board.event.processStorageEvent(7, diode);
				//console.log("ERROR\tFound diode with not enough wires");
			}
		}
	}
	
	
	
	this.updateConnectorGroup = function()
	{
		while(this.dirtyConnectors.length > 0)
		{
			var con = this.dirtyConnectors.shift();
			var group = board.storage.getGroupAtPoint(con.geo);
			
			if(group != null)
			{
				// assign to group
				group.connectors.push(con);
				con.group = group;
			}
		}
	}
	
	
	
	this.updateBoardSize = function()
	{
		var max = [0, 0];
		
		for(var i = 0; i < board.storage.elementsGlo.length; i++)
		{
			var e = board.storage.elementsGlo[i];
			
			max[0] = Math.max(max[0], e.geo[0] + e.size[0]);
			max[1] = Math.max(max[1], e.geo[1] + e.size[1]);
		}
		
		for(var i = 0; i < board.storage.wiresGlo.length; i++)
		{
			var w = board.storage.wiresGlo[i];
			
			max[0] = Math.max(max[0], w.geo[1][0]);
			max[1] = Math.max(max[1], w.geo[1][1]);
		}
		
		if(this.size[0] != max[0] || this.size[1] != max[1]) // size changed?
		{
			this.size = max;
			system.renderer.resizeBoard(this.size);
		}
	}
	
	
	
	this.cancelGroup = function(group)
	{
		// unassign all wires, but add all wires to groupless list
		while(group.wires.length > 0)
		{
			var wire = group.wires.pop();
			wire.group = null;
			this.grouplessWires.push(wire);
		}
		
		// same for connectors
		while(group.connectors.length > 0)
		{
			var con = group.connectors.pop();
			con.group = null;
			this.dirtyConnectors.push(con);
		}

		// same for connectors
		/*while(group.diodes.length > 0)
		{
			var diode = group.diodes.pop();
		}
		*/
		
		// delete
		board.storage.popGroup(group);
	}
	
	
	
	this.findWiresRecursive = function(wire, resultWires)
	{
		resultWires.push(wire);
	
		for(var i = 0; i < 2; i++)
		{
			var p = wire.geo[i];
			var d = board.storage.getWireDirection(wire);
			var diode = board.storage.getDiodeAtPoint(p);
			var onPoint = board.storage.getWiresByEndpoint(p);
			
			/*if(diode != null && d == 0) // found a horizontal connection to a diode?
			{
				if(resultDiodes.indexOf(diode) == -1) resultDiodes.push(diode);
			}*/
			
			for(var n = 0; n < onPoint.length; n++)
			{
				if(resultWires.indexOf(onPoint[n]) == -1)
				{
					if(diode != null)
					{
						if(board.storage.getWireDirection(onPoint[n]) != d) continue;
					}
					
					this.findWiresRecursive(onPoint[n], resultWires);
				}
			}
		}
	}
	
	this.findDedicatedGroupFromPoint = function(result, p, excludeWireId)
	{
		for(var d = 0; d < 2 ; d++)
		{
			var wires = board.storage.getWiresByEndpoint(p, d, excludeWireId);
			
			for(var i = 0; i < wires.length; i++)
			{
				// is there already a group?
				if(wires[i].group != null)
				{
					if(result.indexOf(wires[i].group) == -1)
					{
						result.push(wires[i].group);
					}
				}
				else
				{
					console.log("ERROR\tFound wire without valid group");
				}
			}	
		}
	}
	
	this.elementAbleToPlace = function(obj, geo)
	{
		for(var y = 0; y < obj.size[1]; y++)
		{
			for(var x = 0; x < obj.size[0]; x++)
			{
				var p = [x + geo[0], y + geo[1]];
					
				// is on wire?	
				for(var d = 0; d < 2; d++)
				{
					var intersections = board.storage.getWiresByIntersection(p, d);
					if(intersections != null)
					{
						for(var n = 0; n < intersections.length; n++)
						{
							// is selected? then skip
							if(board.storage.isSelected(intersections[n])) continue;

							// is endpoint?
							var endpoint = -1;
							if(intersections[n].geo[0][d] == p[d]) endpoint = 0;
							if(intersections[n].geo[1][d] == p[d]) endpoint = 1;
							
							if(endpoint != -1)
							{
								// check if there is an connector
								var con = obj.getConnector([x, y]);
								
								// handle connector
								if(con != null)
								{
									var directionOk = false;
									if(con.dir == 4) directionOk = true; // middle?
									if((con.dir == 1 || con.dir == 3) && d == 0) directionOk = true; // horizontal?
									if((con.dir == 0 || con.dir == 2) && d == 1) directionOk = true; // vertical?
									
									if(!directionOk)
									{
										return false; // Cannot place an element on wire endpoint where connector/wire doesn't have the same direction
									}
								}
								else
								{
									return false; // Cannot place an element on a wire (even if it's an endpoint)
								}
							}
							else
							{
								return false; // Cannot place an element on a wire
							}
						}
					}
				}
				
				// is on element?
				var otherElement = board.storage.getElementAtPoint(p);
				if(otherElement != null)
				{
					 // Cannot place on another element, but if the other element is selected too it would be okay
					if(!board.storage.isSelected(otherElement)) return false;
				}
			}
		}

		return true;
	}
	
	this.repairWires = function(list)
	{
		for(var i = 0; i < list.length; i++)
		{
			var wire = board.storage.getWireById(list[i]);
			if(wire == null) continue; // this wire doesn't exist anymore
			
			var d = board.storage.getWireDirection(wire);
			
			for(var p = 0; p < 2; p++)
			{			
				var wiresDirect = board.storage.getWiresByEndpoint(wire.geo[p], d, wire.id);
				var wiresIndirect = board.storage.getWiresByEndpoint(wire.geo[p], 1 - d);
				var connector = board.storage.getConnectorAtPoint(wire.geo[p]);
			
				if(wiresDirect.length > 0 && wiresIndirect.length == 0 && connector == null)
				{
					var newId = this.combineWires(wiresDirect[0].id, list[i]);
				
					list.push(newId);
					
					return true;
				}
			}
		}
		
		return false;
	}
	

	this.selectionDelete = function()
	{
		if(board.storage.selectionFloating)
		{
			board.storage.selectedGlo = [];
			return;
		}

		while(board.storage.selectedGlo.length > 0)
		{
			var obj = board.storage.selectedGlo.pop();

			switch(board.storage.getObjectType(obj))
			{
				case 0:
					this.deleteWire(obj);
					break;

				case 1:
					board.event.processStorageEvent(4, obj.id);
					break;

				case 2:
					board.event.processStorageEvent(7, obj);
					break;

				case 3:
					board.event.processStorageEvent(9, obj);
					break;
			}
		}
	}

	this.setSelectionArea = function(area)
	{
		if(area == null)
		{
			board.storage.unselectAll();
		}
		else
		{
			var list = [];

			var quads = this.getQuadsByArea(area);

			for(var i = 0; i < quads.length; i++)
			{
				var q = quads[i];

				{ // collect wires
					for(var d = 0; d < 2; d++)
					{
						for(var n = 0; n < q.wires[d].length; n++)
						{
							var wire = q.wires[d][n];
							if(list.indexOf(wire) == -1)
							{
								if(this.areaLineIntersection(area, wire.geo))
								{
									list.push(wire);
								}
							}
						}
					}
				}

				{ // collect elements
					for(var n = 0; n < q.elements.length; n++)
					{
						var e = q.elements[n];
						var elementArea = [e.geo[0], e.geo[1], e.geo[0] + e.size[0] - 1, e.geo[1] + e.size[1] - 1];

						if(this.areaAreaIntersection(elementArea, area))
						{
							if(list.indexOf(e) == -1) list.push(e);

						}
					}
				}

				{ // collect diodes
					for(var n = 0; n < q.diodes.length; n++)
					{
						var diode = q.diodes[n];

						if(this.areaPointIntersection(area, diode.geo))
						{
							list.push(diode);
						}
					}
				}

				{ // collect text nodes
					for(var n = 0; n < q.texts.length; n++)
					{
						var text = q.texts[n];

						if(this.areaPointIntersection(area, text.geo))
						{
							list.push(text);
						}
					}
				}
			}

			this.selectionSetFloating(list);
		}
	}

	this.selectionSetFloating = function(list)
	{
		// select new
		for(var i = 0; i < list.length; i++)
		{
			if(!board.storage.isSelected(list[i]))
			{
				//board.storage.selectedGlo.push(list[i]);
				board.storage.selectObject(list[i]);
			}
		}

		// unselect if necessary
		for(var i = 0; i < board.storage.selectedGlo.length; i++)
		{
			var item = board.storage.selectedGlo[i];
			if( list.indexOf(item) == -1 ) // unselect!
			{
				board.storage.unselectObject( item );
			}
		}
	}

	this.moveSelected = function(arg)
	{
		if(arg[0] == 0 && arg[1] == 0) return true; // nothing to do here

		var addWires = [];
		var addElements = [];
		var addDiodes = [];
		var addTexts = [];

		// STEP 1 - Delete every selected object

		// collect diodes first
		for(var i = 0; i < board.storage.selectedGlo.length; i++)
		{
			var item = board.storage.selectedGlo[i];
			var type = board.storage.getObjectType(item);

			if(type == 2) addDiodes.push(item);
		}

		// delete diodes after that
		for(var i = 0; i < addDiodes.length; i++)
		{
			var item = addDiodes[i];
			board.event.processStorageEvent(7, item);
			//this.toggleDiode(item.geo, false);
		}

		// collect wires and elements and delete them immediately
		for(var i = 0; i < board.storage.selectedGlo.length; i++)
		{
			var item = board.storage.selectedGlo[i];
			var type = board.storage.getObjectType(item);

			switch(type)
			{
				case 0:
					this.deleteWire(item); // wire - to keep consistency: don't delete via storage
					addWires.push(item);
					break;

				case 1:
					board.event.processStorageEvent(4, item.id); // element - it's okay to delete via storage here
					addElements.push(item);
					break;

				case 3:
					board.event.processStorageEvent(9, item); // text - delete from storage
					addTexts.push(item);
					break;
			}
		}

		// STEP 2 - Add moved objects again

		// wires
		for(var i = 0; i < addWires.length; i++)
		{
			var geo = [addWires[i].geo[0].slice(), addWires[i].geo[1].slice()];
			geo[0][0] += arg[0];
			geo[0][1] += arg[1];
			geo[1][0] += arg[0];
			geo[1][1] += arg[1];

			if(geo[0][0] <= 0 || geo[0][1] <= 0) return false; // cannot place wire here, selection out of map -> rollback whole transaction

			this.addWire({geo:geo});
		}

		// elements
		for(var i = 0; i < addElements.length; i++)
		{
			var item = addElements[i];
			var geo = item.geo.slice();
			geo[0] += arg[0];
			geo[1] += arg[1];
			var success = this.addElement(item.elementId, geo, item.arg, item.getNegators());
			if(!success) return false; // cannot place element! -> rollback whole transaction
		}

		// diodes
		for(var i = 0; i < addDiodes.length; i++)
		{
			var item = addDiodes[i];
			var geo = item.geo.slice();
			geo[0] += arg[0];
			geo[1] += arg[1];
			this.toggleDiode(geo, true);
		}

		// texts
		for(var i = 0; i < addTexts.length; i++)
		{
			var item = addTexts[i];
			var geo = item.geo.slice();
			geo[0] += arg[0];
			geo[1] += arg[1];

			var success = this.addText({
				geo: geo,
				text: item.text,
				size: item.size
			});
			if(!success) return false; // cannot place element! -> rollback whole transaction
		}		

		return true;
	}
	

	this.selectionCopy = function()
	{
		var exportObj = board.storage.exportSelected();

		Clipboard.copy(exportObj);
	}


	this.selectionPaste = function(arg)
	{
		var importData = Clipboard.get();

		board.storage.unselectAll();
		board.storage.selectionFloating = true;

		if(importData == null || !importData.w || !importData.e || !importData.d || !importData.t) return null;
		
		var addWires = [];
		var addElements = [];
		var addDiodes = [];
		var addTexts = [];
		var rect = [-1, -1, -1, -1];
		var offset = [0, 0];

		// collect import objects
		for(var i = 0; i < importData.w.length; i++)
		{
			var obj = board.storage.importWire(importData.w[i], true);
			adjustRect( obj.geo[0][0], obj.geo[0][1] );
			adjustRect( obj.geo[1][0], obj.geo[1][1] );
			addWires.push( obj );
		}

		for(var i = 0; i < importData.e.length; i++)
		{
			var obj = board.storage.importElement(importData.e[i], true);
			adjustRect( obj.geo[0], obj.geo[1] );
			adjustRect( obj.geo[0] + obj.size[0] - 1, obj.geo[1] + obj.size[1] - 1 );
			addElements.push( obj );
		}

		for(var i = 0; i < importData.d.length; i++)
		{
			var obj = board.storage.importDiode(importData.d[i], true);
			addDiodes.push( obj );
		}

		for(var i = 0; i < importData.t.length; i++)
		{
			var obj = board.storage.importText(importData.t[i], true);
			adjustRect( obj.geo[0], obj.geo[1] );
			addTexts.push( obj );
		}

		if( (addWires.length + addElements.length + addDiodes.length + addTexts.length) == 0 ) return null;

		// calculate real offset
		offset[0] = offset[0] - rect[0] + arg[0] + 1;
		offset[1] = offset[1] - rect[1] + arg[1] + 1;

		// add/select
		for(var i = 0; i < addWires.length; i++)
		{
			addWires[i].geo[0][0] += offset[0];
			addWires[i].geo[0][1] += offset[1];
			addWires[i].geo[1][0] += offset[0];
			addWires[i].geo[1][1] += offset[1];
			board.storage.selectObject( addWires[i] );
		}

		for(var i = 0; i < addElements.length; i++)
		{
			addElements[i].geo[0] += offset[0];
			addElements[i].geo[1] += offset[1];
			board.storage.selectObject( addElements[i] );
		}

		for(var i = 0; i < addDiodes.length; i++)
		{
			addDiodes[i].geo[0] += offset[0];
			addDiodes[i].geo[1] += offset[1];
			board.storage.selectObject( addDiodes[i] );
		}

		for(var i = 0; i < addTexts.length; i++)
		{
			addTexts[i].geo[0] += offset[0];
			addTexts[i].geo[1] += offset[1];
			board.storage.selectObject( addTexts[i] );
		}

		system.renderer.overlayTextSetFloating(addTexts);
		
		// set second point in rect to rect size*/
		rect[0] = rect[0] + offset[0] - 1;
		rect[1] = rect[1] + offset[1] - 1;
		rect[2] = rect[2] - rect[0] + offset[0];
		rect[3] = rect[3] - rect[1] + offset[1];

		if(rect[0] == -1) return null; // no rect

		return rect;

		function adjustRect(x, y)
		{
			if(rect[0] == -1 || rect[0] > x) rect[0] = x;
			if(rect[1] == -1 || rect[1] > y) rect[1] = y;
			if(rect[2] == -1 || rect[2] < x) rect[2] = x;
			if(rect[3] == -1 || rect[3] < y) rect[3] = y;
		}
	}


	this.selectionPasteEnd = function(arg)
	{
		for(var i = 0; i < board.storage.selectedGlo.length; i++)
		{
			var item = board.storage.selectedGlo[i];
			var type = board.storage.getObjectType(item);

			if(type == 0)
			{
				var geo = [item.geo[0].slice(), item.geo[1].slice()];
				geo[0][0] += arg[0];
				geo[0][1] += arg[1];
				geo[1][0] += arg[0];
				geo[1][1] += arg[1];

				if(geo[0][0] <= 0 || geo[0][1] <= 0) return false; // cannot place wire here, selection out of map -> rollback whole transaction

				this.addWire({geo:geo});
			}
			else if(type == 1)
			{
				var geo = item.geo.slice();
				geo[0] += arg[0];
				geo[1] += arg[1];

				var success = this.addElement(item.elementId, geo, item.arg, item.getNegators());
				if(!success) return false; // cannot place element! -> rollback whole transaction
			}
			else if(type == 2)
			{
				var geo = item.geo.slice();
				geo[0] += arg[0];
				geo[1] += arg[1];

				this.toggleDiode(geo, true);
			}
			else if(type == 3)
			{
				var geo = item.geo.slice();
				geo[0] += arg[0];
				geo[1] += arg[1];

				var success = this.addText({
					geo: geo,
					text: item.text,
					size: item.size
				});

				if(!success) return false; // cannot place element! -> rollback whole transaction
			}
		}

		system.renderer.overlayTextUnsetFloating();

		return true;
	}

	this.addText = function(arg)
	{
		if(arg.geo[0] <= 0 || arg.geo[1] <= 0) return false;

		if(board.storage.getTextAtPos(arg.geo) != null)
		{
			return false; // cannot set here
		}

		if(arg.text.trim() == "") return false; // no empty text allowed

		board.event.processStorageEvent(8, arg);

		return true;
	}


	this.deleteText = function(pos)
	{
		var text = board.storage.getTextAtPos(pos);
		if(text == null) return false;

		board.event.processStorageEvent(9, text);

		return true;
	}


	this.getQuadsByArea = function(area)
	{
		var sx = ~~(area[0] / Config.quadSize);
		var sy = ~~(area[1] / Config.quadSize);
		var ex = ~~(area[2] / Config.quadSize);
		var ey = ~~(area[3] / Config.quadSize);
		var ret = [];

		for(var y = sy; y <= ey; y++)
		{
			for(var x = sx; x <= ex; x++)
			{
				ret.push(board.storage.getQuad(x, y));
			}
		}

		return ret;
	}
	

	this.getLockAreaByWire = function(geo)
	{
		return [
			geo[0][0],
			geo[0][1],
			geo[1][0],
			geo[1][1]
		];
	}


	this.areaAreaIntersection = function(a, b)
	{
		if(	a[0] <= b[2] && a[2] >= b[0] &&
			a[1] <= b[3] && a[3] >= b[1]) return true;

		return false;
	}


	this.areaLineIntersection = function(area, line) // test if line intersects with area. line=[[x1,y1],[x2,y2]]  area=[startx,starty,endx,endy]
	{
		var p00 = [area[0], area[1]];
		var p01 = [area[0], area[3]];
		var p10 = [area[2], area[1]];
		var p11 = [area[2], area[3]];

		var sideA = [p00, p10];
		var sideB = [p01, p11];
		var sideC = [p00, p01];
		var sideD = [p10, p11];

		// crossing any line?
		if(this.lineLineIntersection(sideA, line)) return true;
		if(this.lineLineIntersection(sideB, line)) return true;
		if(this.lineLineIntersection(sideC, line)) return true;
		if(this.lineLineIntersection(sideD, line)) return true;

		// complete in rect?
		var p = line[0];

		if(	p[0] >= area[0] && p[0] <= area[2] && // X correct?
			p[1] >= area[1] && p[1] <= area[3]    // Y correct?
		)
		{
			return true;
		}

		return false;
	}

	this.lineLineIntersection = function(a, b) // per line: [[x1,y1],[x2,y2]]
	{
		var betweenAx = b[0][0] >= a[0][0] && b[0][0] <= a[1][0];
		var betweenBx = a[0][0] >= b[0][0] && a[0][0] <= b[1][0];
		var betweenAy = b[0][1] >= a[0][1] && b[0][1] <= a[1][1];
		var betweenBy = a[0][1] >= b[0][1] && a[0][1] <= b[1][1];

		if( (betweenAx && betweenBy) || (betweenAy && betweenBx) ) return true;

		return false;
	}

	this.areaPointIntersection = function(area, point) // area=[startx,starty,endx,endy]   point=[x,y]
	{
		if(area[0] > point[0]) return false;
		if(area[1] > point[1]) return false;
		if(area[2] < point[0]) return false;
		if(area[3] < point[1]) return false;

		return true;
	}


	this.pointEqual = function(a, b)
	{
		if(a[0] == b[0] && a[1] == b[1]) return true;
		return false;
	}

	
	this.test = function()
	{
		/*console.log(   this.lineLineIntersection( // true
			[[0,2], [5,2]], 
			[[2,1], [2,4]]
		));

		console.log(   this.lineLineIntersection( // false
			[[0,2], [5,2]], 
			[[2,3], [2,4]]
		));

		console.log(   this.lineLineIntersection( // false
			[[0,2], [5,2]], 
			[[2,0], [2,0]]
		));

		console.log(   this.lineLineIntersection( // true
			[[0,2], [5,2]], 
			[[0,2], [0,5]]
		));

		console.log(   this.lineLineIntersection( // true
			[[0,2], [5,2]], 
			[[0,2], [5,2]]
		));*/
	}
	
	{ // construct
		//this.cmdAddWire( [[5, 5], [5, 9]] );
	}
}