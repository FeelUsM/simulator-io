function BoardStorage(system, board, opt)
{
	console.log('construct BoardStorage',opt)

	this.nextWireId = 0;
	this.nextElementId = 0;
	this.nextDiodeId = 0;
	this.nextTextId = 0;
	this.nextGroupId = 0;

	this.selectionFloating = false; // if true, all items in selectedGlo are not part this storage yet
	
	// -----------------------------------------------------------------------------------------------------------------
	//                     STORAGE LISTS
	// -----------------------------------------------------------------------------------------------------------------
	this.wiresDir = [ [], [] ]; 	// wires by direction (horizontal and vertical)
									// list format: [horArray, verArray]
									// wire format: {id: id, geo:[[x,y], [x,y]]}
									
	this.wiresGlo = [];				// all wires
									// list format: [ {}, {}, {}, {}, ....}
									// wire format: same as in wiresDir. should share the wire objects with wiresDir
					
	this.elementsGlo = [];			// all elements
									// list format: [ {}, {}, {}, {}, ....]
									// element format: {id, elementId, geo:[x,y]}
									
	this.connectorsGlo = [];		// all connectors of elements
									// list format: [ {}, {}, {}, {}, ....]
									// element format: {geo: [x, y], element, index}
									
	this.diodesGlo = [];			// all diodes
									// list format: [ {}, {}, {}, {}, ....]
									// diode format: {id, geo: [x, y]}

	this.textsGlo = [];				// all text nodes
									// list format: [ {}, {}, {}, {}, ....]
									// text format: {id, geo: [x, y], text: "abc"}
									
	this.groupsGlo = [];			// all wire groups
									// list format: [ {}, {}, {}, {}, ....]
									// group format: {id, wires}
					
	this.quads = {};
	
	this.selectedGlo = [];			// all selected object (wire, diode or element)


	// -----------------------------------------------------------------------------------------------------------------
	//                     IMPORT/EXPORT/CLEAR FUNCTIONS
	// -----------------------------------------------------------------------------------------------------------------
	this.reset = function() // always call this from external, not the board.logic.reset() function
	{
		this.nextWireId = 0;
		this.nextElementId = 0;
		this.nextDiodeId = 0;
		this.nextTextId = 0;
		this.nextGroupId = 0;
	
		this.wiresDir = [ [], [] ];
		this.wiresGlo = [];
		this.elementsGlo = [];
		this.connectorsGlo = [];
		this.diodesGlo = [];
		this.textsGlo = [];
		this.groupsGlo = [];
		this.quads = {};

		this.selectedGlo = [];

		this.selectionFloating = false;
	}
	
	this.setOpt = function(_opt)
	{
		opt = _opt;
	}
	
	this.exportAll = function()
	{
		var obj = {};
		obj.vl = opt.versionLogic; // version of logic engine
		obj.vs = opt.versionStorage; // version of storage engine
		obj.s = true; // init state
		obj.w = []; // wires
		obj.e = []; // elementes
		obj.d = []; // diodes
		obj.t = []; // texts

		// write all wires
		for(var i = 0; i < this.wiresGlo.length; i++)
		{
			obj.w.push(this.exportWire(this.wiresGlo[i]));
		}
		
		// write all diodes
		for(var i = 0; i < this.diodesGlo.length; i++)
		{
			obj.d.push(this.exportDiode(this.diodesGlo[i]));
		}
		
		// write all elements
		for(var i = 0; i < this.elementsGlo.length; i++)
		{
			obj.e.push(this.exportElement( this.elementsGlo[i] ));
		}
		
		// write all texts
		for(var i = 0; i < this.textsGlo.length; i++)
		{
			obj.t.push(this.exportText( this.textsGlo[i] ));
		}

		return obj;
	}
	
	this.importAll = function(obj,isSnapshot)
	{
		if(obj.s == false) // not initialized yet, this must be an empty board
		{
			if(system) // client only
			{
				system.transaction.reset(); // delete all old things
			}

			return;
		}

		if(	this.elementsGlo.length != 0 ||
			this.wiresGlo.length != 0 ||
			this.diodesGlo.length != 0 ||
			this.textsGlo.length != 0)
		{
			console.error("ERROR\tBoard is not empty");
			return;
		}

		if(system) // client only
		{
			system.transaction.start(0, 0, true);
		}
		
		// add wires
		for(var i = 0; i < obj.w.length; i++)
		{
			this.pushWire( this.importWire(obj.w[i], isSnapshot) );
		}
		
		// all diodes
		for(var i = 0; i < obj.d.length; i++)
		{
			this.pushDiode( this.importDiode(obj.d[i], isSnapshot) );
		}
		
		// all element
		for(var i = 0; i < obj.e.length; i++)
		{
			this.pushElement( this.importElement(obj.e[i], isSnapshot) );
		}

		// all text nodes
		for(var i = 0; i < obj.t.length; i++)
		{
			this.pushText( this.importText(obj.t[i], isSnapshot) );
		}
		
		if(system) // client only
		{
			system.transaction.commit();
			system.transaction.reset(); // delete all old things (undo/redo stack)
		}
	}

	this.exportSelected = function()
	{
		var exportObj = {w:[], e:[], d:[], t:[]};

		for(var i = 0; i < this.selectedGlo.length; i++)
		{
			var obj = this.selectedGlo[i];

			switch(this.getObjectType(obj))
			{
				case 0:
					exportObj.w.push(this.exportWire(obj));
					break;

				case 1:
					exportObj.e.push(this.exportElement(obj));
					break;

				case 2:
					exportObj.d.push(this.exportDiode(obj));
					break;

				case 3:
					exportObj.t.push(this.exportText(obj));
					break;
			}
		}

		return exportObj;
	}

	this.exportWire = function(wire)
	{
		var geo = wire.geo;
		return [geo[0][0], geo[0][1], geo[1][0], geo[1][1], wire.id];
	}

	this.exportElement = function(element)
	{
		var exportObj = {};
		exportObj.e = element.elementId;
		exportObj.g = element.geo.slice();
		exportObj.a = element.exportArgs();
		exportObj.n = element.getNegators();
		exportObj.i = element.id;

		return exportObj;
	}

	this.exportDiode = function(diode)
	{
		return [diode.geo[0], diode.geo[1], diode.id];
	}

	this.exportText = function(text)
	{
		return [text.geo[0], text.geo[1], text.id, text.text, text.size];
	}

	this.importWire = function(wire, ignoreId)
	{
		var importWire = {
			geo: [
				[wire[0], wire[1]],
				[wire[2], wire[3]]
			]
		};

		if(!ignoreId) importWire.id = wire[4];

		return importWire;
	}

	this.importElement = function(elementData, ignoreId)
	{
		var importElement = new ElementStore[elementData.e].mod(elementData.a);
		importElement.elementId = elementData.e;
		importElement.geo = elementData.g;
		importElement.setNegators(elementData.n);
		if(!ignoreId) importElement.id = elementData.i;

		return importElement;
	}

	this.importDiode = function(diode, ignoreId)
	{
		var importDiode = {};
		importDiode.geo = [ diode[0], diode[1] ];
		if(!ignoreId) importDiode.id = diode[2];

		return importDiode;
	}

	this.importText = function(text, ignoreId)
	{
		var importText = {};
		importText.geo = [ text[0], text[1] ];
		if(!ignoreId) importText.id = text[2];
		importText.text = text[3];
		importText.size = text[4];

		return importText;
	}

	
	this.hash = function()
	{
		var parts = [];
		parts.push('vl' + opt.versionLogic);
		parts.push('vs' + opt.versionStorage);
		
		// dump all wires
		for(var i = 0; i < this.wiresGlo.length; i++)
		{
			var geo = this.wiresGlo[i].geo;
			parts.push('w' + this.wiresGlo[i].id + "," + geo[0][0] + "," + geo[0][1] + "," + geo[1][0] + "," + geo[1][1]);
		}
		
		// dump all diodes
		for(var i = 0; i < this.diodesGlo.length; i++)
		{
			var geo = this.diodesGlo[i].geo;

			parts.push('d' + this.diodesGlo[i].id + "," + geo[0] + "," + geo[1]);
		}
		
		// dump all elements
		for(var i = 0; i < this.elementsGlo.length; i++)
		{
			var element = this.elementsGlo[i];
			var argsStr = JSON.stringify(element.exportArgs());
			var negStr = JSON.stringify(element.getNegators());

			parts.push('e' + element.id + "," + element.elementId + "," + element.geo[0] + "," + element.geo[1] + "," + argsStr + "," + negStr);
		}
				
		return hashUnorderedStringHeap(parts);
	}
	
	// -----------------------------------------------------------------------------------------------------------------
	//                     MANIPULATION FUNCTIONS
	// -----------------------------------------------------------------------------------------------------------------
	this.pushWire = function(wire)
	{
		if(system && system.getMode() != 0) console.error("ERROR\tNot in build mode");
	
		var id = -1;
	
		if(wire.id == undefined)
		{
			id = opt.token + '-w-' + this.nextWireId;
			this.nextWireId++;
		}
		else
		{
			id = wire.id;
		}

		var d = this.getWireDirection(wire);
		if(wire.geo[0][d] > wire.geo[1][d]) console.error("ERROR\tPoints in wrong order");
		
		// create obj
		var wireObj = {
			id: id,
			geo: [wire.geo[0].slice(), wire.geo[1].slice()], // disconnect the geo data from other objects
			group: null
		};
		
		// add transaction event
		if(system) // client only
		{
			system.transaction.addEvent(1, {
				board: this,
				arg: wireObj
			}, board.logic.getLockAreaByWire(wire.geo));
		}
		
		// push to lists
		this.wiresDir[d].push(wireObj);
		this.wiresGlo.push(wireObj);		
		
		// add to quads
		this.pushWireToQuads(wireObj);
		
		
		if(system) // client only
		{
			// update group on next commit
			board.logic.grouplessWires.push(wireObj);	
			
			// update 
			for(var i = 0; i < 2; i++)
			{
				var con = this.getConnectorAtPoint(wire.geo[i]);
				if(con != null)
				{
					board.logic.dirtyConnectors.push(con);
				}
			}
			
			// add change to renderer
			//board.addDirtyLine(wire.geo);
			system.renderer.setDirty(0); // set wires dirty
		}
		
		return id;
	}
	
	
	this.popWire = function(id)
	{
		if(system && system.getMode() != 0) console.error("ERROR\t Not in build mode");
	
		var found = false;
		var wire = null;

		// pop from Dir list
		for(var d = 0; d < 2 && !found; d++)
		{
			for(var i = 0; i < this.wiresDir[d].length; i++)
			{			
				if(this.wiresDir[d][i].id == id)
				{
					// add transaction event
					if(system) // client only
					{
						system.transaction.addEvent(2, {
							board: this,
							arg: this.wiresDir[d][i]
						}, board.logic.getLockAreaByWire(this.wiresDir[d][i].geo));
					}
				
					// remove from quads
					this.popWireFromQuads(this.wiresDir[d][i]);
				
					// remove from Dir list
					this.wiresDir[d].splice(i, 1);
					
					found = true;
					break;
				}
			}
		}
		
		if(!found)
		{
			console.error("ERROR\tCannot delete wire with id ", id);
			return false;
		}
		
		found = false;
		
		// pop from Glo list
		for(var i = 0; i < this.wiresGlo.length; i++)
		{
			if(this.wiresGlo[i].id == id)
			{
				wire = this.wiresGlo[i];
			
				// remove from Glo list
				this.wiresGlo.splice(i, 1);
				found = true;
				break;
			}
		}
		
		if(!found)
		{
			console.error("ERROR\tInconsistent wire data. Cannot find wire in global table: ", id);
			return false;
		}
		
		
		if(system) // client only
		{
			// pop from group
			if(wire.group != null)
			{
				board.logic.cancelGroup(wire.group);
				
				if(wire.group != null)
				{
					console.error("ERROR\tCancel group failed. Group is still set.");
				}
			}
			
			// pop from groupless list
			var idxGroupless = board.logic.grouplessWires.indexOf(wire);
			if(idxGroupless != -1)
			{
				board.logic.grouplessWires.splice(idxGroupless, 1);
			}
			
			// add change to renderer
			//board.addDirtyLine(wire.geo);
			system.renderer.setDirty(0); // set wires dirty
		}
		
		return true;
	}
	
	
	this.pushElement = function(element)
	{
		if(system && system.getMode() != 0) console.error("ERROR\tNot in build mode");
	
		var id = -1;
		
		// check elementId
		if(!element.elementId) console.error("ERROR\tElement ID not set");
		
		// get id
		if(element.id == undefined)
		{
			id = opt.token + '-e-' + this.nextElementId;
			element.id = id;
			this.nextElementId++;
		}
		else
		{
			id = element.id;
		}
		
		// lock
		var lock = [
			element.geo[0],
			element.geo[1],
			element.geo[0] + element.size[0],
			element.geo[1] + element.size[1]
		];
		
		// add transaction event
		if(system) // client only
		{
			system.transaction.addEvent(3, {
				board: this,
				arg: element
			}, lock);
		}
		
		// add element to glo list
		this.elementsGlo.push(element);
		
		// add element to all quads
		for(var y = 0; y < element.size[1]; y++)
		{
			for(var x = 0; x < element.size[0]; x++)
			{
				var p = [element.geo[0] + x, element.geo[1] + y];
				var qx = ~~(p[0] / opt.quadSize), qy = ~~(p[1] / opt.quadSize);
				var quad = this.getQuad(qx, qy);
				
				if(quad.elements.indexOf(element) == -1) // not added yet
				{
					quad.elements.push(element);
				
					if(system) // client only
					{
						// add dirty quad to renderer for minimap
						system.renderer.addDirtyMapQuad(quad);
					}
				}				
			}
		}

		// add connectors
		for(var i = 0; i < element.connectors.length; i++)
		{
			var con = element.connectors[i];
			var p = [element.geo[0] + con.pos[0], element.geo[1] + con.pos[1]];

			con.geo = p;
			con.element = element;
			con.group = null;
			con.power = false;
			con.negated = con.negated || false;
			
			var qx = ~~(p[0] / opt.quadSize), qy = ~~(p[1] / opt.quadSize);
			var quad = this.getQuad(qx, qy);
			
			// add to glo
			this.connectorsGlo.push(con);
			
			// add to quad
			quad.connectors.push(con);
			
			if(system) // client only
			{
				// add to dirty list
				board.logic.dirtyConnectors.push(con);
			}
		}
		
		if(system) // client only
		{
			system.renderer.setDirty(1); // set elements dirty
		}
		
	}
	
	
	this.popElement = function(id)
	{
		if(system && system.getMode() != 0) console.error("ERROR\t Not in build mode");
	
		var element = null;
		
		// delete from glo
		for(var i = 0; i < this.elementsGlo.length; i++)
		{
			if(this.elementsGlo[i].id == id)
			{
				element = this.elementsGlo[i];
				this.elementsGlo.splice(i, 1);
			}
		}
		
		// everything okay?
		if(element == null)
		{
			console.error("ERROR\tCannot delete element", id);
			return;
		}
		
		// lock
		var lock = [
			element.geo[0],
			element.geo[1],
			element.geo[0] + element.size[0],
			element.geo[1] + element.size[1]
		];
		
		// add transaction event
		if(system) // client only
		{
			system.transaction.addEvent(4, {
				board: this,
				arg: element
			}, lock);
		}
		
		// delete from quads
		for(var y = 0; y < element.size[1]; y++)
		{
			for(var x = 0; x < element.size[0]; x++)
			{
				var p = [element.geo[0] + x, element.geo[1] + y];
				var qx = ~~(p[0] / opt.quadSize), qy = ~~(p[1] / opt.quadSize);
				var quad = this.getQuad(qx, qy);
				
				for(var i = 0; i < quad.elements.length; i++)
				{
					if(quad.elements[i].id == id)
					{
						// delete and continue with next point
						quad.elements.splice(i, 1);
						
						if(system) // client only
						{
							// add dirty quad to renderer for minimap
							system.renderer.addDirtyMapQuad(quad);
						}
						
						break;
					}
				}
			}
		}
		
		// delete connectors
		for(var i = this.connectorsGlo.length - 1; i >= 0; i--)
		{
			var con = this.connectorsGlo[i];
			if(con.element != element) continue;
			
			var qx = ~~(con.geo[0] / opt.quadSize), qy = ~~(con.geo[1] / opt.quadSize);
			var quad = this.getQuad(qx, qy);
			
			// delete from glo
			this.connectorsGlo.splice(i, 1);
			
			for(var n = quad.connectors.length - 1; n >= 0; n--)
			{
				if(quad.connectors[n].element == element)
				{
					quad.connectors.splice(n, 1);
				}		
			}
			
			// delete connector from group
			if(con.group != null)
			{
				var idx = con.group.connectors.indexOf(con);
				if(idx == -1) console.error("ERROR\tCannot find connector in group");
				con.group.connectors.splice(idx, 1);
				con.group = null;
			}
		}
		
		if(system) // client only
		{
			system.renderer.setDirty(1); // set elements dirty
		}
	}
	
	
	this.toggleNegator = function(con)
	{
		if(con.dir == 4) return; // cannot negate middle connector
		if(!!con.locked) return; // is locked
		
		con.negated = !con.negated;
		
		if(system) // client only
		{
			// lock
			var lock = [
				con.element.geo[0],
				con.element.geo[1],
				con.element.geo[0] + con.element.size[0],
				con.element.geo[1] + con.element.size[1]
			];
			
			// add event
			system.transaction.addEvent(5, {
				board: this,
				arg: con
			}, lock);
			
			system.renderer.setDirty(1);
		}
	}

	
	this.pushDiode = function(diode)
	{
		if(system) // client only
		{
			if(system.getMode() != 0) console.error("ERROR\t Not in build mode");
		}

		if(diode.id == undefined)
		{
			diode.id = opt.token + '-d-' + this.nextDiodeId;
			this.nextDiodeId++;
		}
		
		var qx = ~~(diode.geo[0] / opt.quadSize), qy = ~~(diode.geo[1] / opt.quadSize);
		var quad = this.getQuad(qx, qy);
		
		// cancel groups
		for(var d = 0; d < 2; d++)
		{
			var wires = this.getWiresByEndpoint(diode.geo, d);

			for(var i = 0; i < wires.length; i++)
			{
				if(wires[i].group != null) board.logic.cancelGroup(wires[i].group);
			}
		}
		
		// add groups
		diode.groupHor = null;
		diode.groupVer = null;
		
		// push
		quad.diodes.push(diode);
		this.diodesGlo.push(diode);
		
		// lock 
		var lock = [
			diode.geo[0], diode.geo[1],
			diode.geo[0], diode.geo[1]
		];
		
		// client only
		if(system)
		{
			// add event
			system.transaction.addEvent(6, {
				board: this,
				arg: diode
			}, lock);

			// add to dirty diode list
			board.logic.dirtyDiodes.push(diode);
			
			// render
			system.renderer.setDirty(0);
		}
	}
	
	
	this.popDiode = function(diode)
	{
		if(system && system.getMode() != 0) console.error("ERROR\t Not in build mode");

		var qx = ~~(diode.geo[0] / opt.quadSize), qy = ~~(diode.geo[1] / opt.quadSize);
		var quad = this.getQuad(qx, qy);
		
		var idxQuad = quad.diodes.indexOf(diode);
		var idxGlo = this.diodesGlo.indexOf(diode);
		
		if(idxQuad == -1 || idxGlo == -1)
		{
			console.error("ERROR\tCannot find diode:", idxQuad, idxGlo);
		}
		
		// delete
		quad.diodes.splice(idxQuad, 1);
		this.diodesGlo.splice(idxGlo, 1);
		
		if(system) // client only
		{
			// lock
			var lock = [
				diode.geo[0], diode.geo[1],
				diode.geo[0], diode.geo[1]
			];
		
			// add event
			system.transaction.addEvent(7, {
				board: this,
				arg: diode
			}, lock);

			// delete from groups
			var groupsToDetach = 2;
			if(diode.groupHor == diode.groupVer) groupsToDetach = 1; // we only have to remove one group, because it's the same
			
			for(var i = 0; i < groupsToDetach; i++)
			{
				var group = (i == 0) ? diode.groupHor : diode.groupVer;

				if(group != null)
				{
					var idx = group.diodes.indexOf(diode);
					group.diodes.splice(idx, 1);
				
					if(idx == -1) console.error("ERROR\tCannot delete diode from group");
				}
			}
			diode.groupHor = null;
			diode.groupVer = null;
		
			// delete from dirty list
			var idx = board.logic.dirtyDiodes.indexOf(diode);
			if(idx != -1) board.logic.dirtyDiodes.splice(idx, 1);
			
			// render
			system.renderer.setDirty(0);
		}
	}

	this.pushText = function(text)
	{
		if(system) // client only
		{
			if(system.getMode() != 0) console.error("ERROR\t Not in build mode");
		}

		if(text.id == undefined)
		{
			text.id = opt.token + '-t-' + this.nextTextId;
			this.nextTextId++;
		}

		var qx = ~~(text.geo[0] / opt.quadSize), qy = ~~(text.geo[1] / opt.quadSize);
		var quad = this.getQuad(qx, qy);

		// push
		quad.texts.push(text);
		this.textsGlo.push(text);

		var lock = [
			text.geo[0], text.geo[1],
			text.geo[0] + 1, text.geo[1] + 1
		];

		if(system)
		{
			// add event
			system.transaction.addEvent(8, {
				board: this,
				arg: text
			}, lock);

			text.renderNode = system.renderer.overlayTextAdd(text.geo[0], text.geo[1], text.text, text.size, text);
		}
	}

	this.popText = function(text)
	{
		if(system) // client only
		{
			if(system.getMode() != 0) console.error("ERROR\t Not in build mode");
		}

		var qx = ~~(text.geo[0] / opt.quadSize), qy = ~~(text.geo[1] / opt.quadSize);
		var quad = this.getQuad(qx, qy);

		var lock = [
			text.geo[0], text.geo[1],
			text.geo[0] + 1, text.geo[1] + 1
		];

		// pop
		{
			var idx = quad.texts.indexOf(text);
			if(idx == -1) console.error("ERROR\tCannot delete text 1");
			quad.texts.splice(idx, 1);
		}

		{
			var idx = this.textsGlo.indexOf(text);
			if(idx == -1) console.error("ERROR\tCannot delete text 2");
			this.textsGlo.splice(idx, 1);
		}

		if(system)
		{
			// add event
			system.transaction.addEvent(9, {
				board: this,
				arg: text
			}, lock);

			system.renderer.overlayTextRemove(text.renderNode);
		}
	}
	
	this.pushWireToQuads = function(wire)
	{
		var d = this.getWireDirection(wire);
		var qline = ~~(wire.geo[0][1 - d] / opt.quadSize); // line of quad
				
		var startI = ~~(wire.geo[0][d] / opt.quadSize);
		var endI = ~~(wire.geo[1][d] / opt.quadSize);
		
		for(var i = startI; i <= endI; i++)
		{
			var quad = (d == 0)
				? this.getQuad(i, qline)
				: this.getQuad(qline, i);
			
			quad.wires[d].push(wire);
			
			//if(i == startI) quad.wiresHome.push(wire); // set home wire
			
			if(system) // client only
			{
				// add dirty quad to renderer
				system.renderer.addDirtyMapQuad(quad);
			}
		}
	}


	this.popWireFromQuads = function(wire)
	{
		var d = this.getWireDirection(wire);
		var qline = ~~(wire.geo[0][1 - d] / opt.quadSize); // line of quad
		
		var startI = ~~(wire.geo[0][d] / opt.quadSize);
		var endI = ~~(wire.geo[1][d] / opt.quadSize);
		
		for(var i = startI; i <= endI; i++)
		{
			var quad = (d == 0)
				? this.getQuad(i, qline)
				: this.getQuad(qline, i);
			
			var list = quad.wires[d];
			
			for(var j = 0; j < 2; j++) // 2 times: first for quad wire list, second for quad wire home list (second not always needed)
			{
				for(var n = 0; n < list.length; n++)
				{
					if(list[n].id == wire.id)
					{
						list.splice(n, 1);
					}
				}
				
				// next loop with home list?
				/*if(i == startI)
				{
					list = quad.wiresHome;
				}
				else
				{
					break; // no, don't loop again
				}*/
			}
			
			if(system) // client only
			{
				// add dirty quad to renderer
				system.renderer.addDirtyMapQuad(quad);
			}
		}
	}
	
	
	this.pushGroup = function()
	{
		if(!system) // client only
		{
			return;
		}
	
		if(system.getMode() != 0) console.error("ERROR\t Not in build mode");
	
		// new group object
		var newGroup = {
			id: this.nextGroupId,
			powerCount: 0,
			wires: [],
			connectors: [],
			diodes: []
		};

		// increment group id
		this.nextGroupId++;
		
		// add group
		this.groupsGlo.push(newGroup);
		
		return newGroup;
	}
	
	
	this.popGroup = function(group)
	{
		if(!system) // client only
		{
			return;
		}

		if(system.getMode() != 0) console.error("ERROR\t Not in build mode");
	
		if(group.wires.length > 0)
		{
			console.error("ERROR\tGroup.wires is not empty. Cannot delete.");
			return;
		}
		
		if(group.connectors.length > 0)
		{
			console.error("ERROR\tGroup.connectors is not empty. Cannot delete.");
			return;
		}
		
		// set all diodes as dirty
		for(var i = 0; i < group.diodes.length; i++)
		{
			var diode = group.diodes[i];
			if(board.logic.dirtyDiodes.indexOf(diode) == -1)
			{
				board.logic.dirtyDiodes.push(diode);
			}
		}
		
		// delete from group list
		var idx = this.groupsGlo.indexOf(group);
		if(idx == -1)
		{
			console.error("ERROR\tGroup is unknown.");
		}
		
		this.groupsGlo.splice(idx, 1);
	}	


	this.selectObject = function(obj)
	{
		if(this.isSelected(obj))
		{
			console.error("ERROR\tCannot select object twice");
			return;
		}

		this.selectedGlo.push(obj);

		system.renderer.setDirty(0);
		system.renderer.setDirty(1);
		system.renderer.setDirty(2);
	}


	this.unselectObject = function(obj)
	{
		var idx = this.selectedGlo.indexOf(obj);
		if(idx == -1)
		{
			console.error("ERROR\tCannot unselect not-selected object");
			return;
		}

		this.selectedGlo.splice(idx, 1);


		system.renderer.setDirty(0); // todo really all three necessary?
		system.renderer.setDirty(1);
		system.renderer.setDirty(2);
	}

	this.unselectAll = function()
	{
		this.selectedGlo = [];
		this.selectionFloating = false;

		system.renderer.setDirty(0); // todo really all three necessary?
		system.renderer.setDirty(1);
		system.renderer.setDirty(2);
	}


	// -----------------------------------------------------------------------------------------------------------------
	//                     HELPER AND SEARCH FUNCTIONS
	// -----------------------------------------------------------------------------------------------------------------
	this.getQuad = function(x, y)
	{
		var q = this.quads[x+'x'+y];
		if(q == undefined)
		{
			q = this.quads[x+'x'+y] = {
				pos: [x, y],
				wires:[[],[]], // horizontal and vertical wires
				elements: [],
				connectors: [],
				diodes: [],
				texts: [],
				//wiresHome: [], // list of all wires which are "at home" on this quad
				//elementsHome: []
			};
		}
		
		return q;
	}
	
	
	this.getWireById = function(id)
	{
		for(var i = 0; i < this.wiresGlo.length; i++)
		{
			if(this.wiresGlo[i].id == id)
			{
				return this.wiresGlo[i];
			}
		}
		
		return null
	}

	
	this.getWiresByIntersection = function(p, d, excludeEndpoints)
	{
		excludeEndpoints = excludeEndpoints || false;
		if(typeof d == 'undefined') d = null;
	
		var ret = null;

		if(d == null)
		{
			var a = this.getWiresByIntersection(p, 0, excludeEndpoints);
			var b = this.getWiresByIntersection(p, 1, excludeEndpoints);
			if(a == null) return b;
			if(b == null) return a;
			ret = a.concat(b);
		}
		else
		{
			var line = p[1 - d];
			var quad = this.getQuad(~~(p[0] / opt.quadSize), ~~(p[1] / opt.quadSize));
		
			for(var i = 0; i < quad.wires[d].length; i++)
			{
				var wire = quad.wires[d][i];
	
				if(line == wire.geo[0][1 - d])
				{			
					var intersection = excludeEndpoints
						? p[d] >  wire.geo[0][d] && p[d] <  wire.geo[1][d]
						: p[d] >= wire.geo[0][d] && p[d] <= wire.geo[1][d]
					
					if(intersection)
					{
						if(ret == null) ret = [];
						ret.push(wire);
					}
				}
			}
		}
		
		return ret;
	}


	this.getWiresByEndpoint = function(p, d, excludeId)
	{
		"возвращает все горизонтальные(d==0) и все вертикальные (d==1) провода, за исключением excludeId, которые заканчиваются в точке"
		var ret = [];
		if(typeof excludeId == 'undefined') excludeId = null;
		if(typeof d == 'undefined') d = null;
		
		var quad = this.getQuad(~~(p[0] / opt.quadSize), ~~(p[1] / opt.quadSize));
	
		if(d == null) // find all directions
		{
			var a = this.getWiresByEndpoint(p, 0, excludeId);
			var b = this.getWiresByEndpoint(p, 1, excludeId);
			ret = a.concat(b);
		}
		else
		{
			for(var i = 0; i < quad.wires[d].length; i++)
			{
				var wire = quad.wires[d][i];
				if(excludeId != null && wire.id == excludeId) continue;
			
				if(this.pointEqual(p, wire.geo[0]) || this.pointEqual(p, wire.geo[1]))
				{
					ret.push(wire);
				}
			}
		}
		
		return ret;
	}
	
	
	this.getDiodeAtPoint = function(p)
	{
		var qx = ~~(p[0] / opt.quadSize), qy = ~~(p[1] / opt.quadSize);
		var quad = this.getQuad(qx, qy);
		
		for(var i = 0; i < quad.diodes.length; i++)
		{
			var diode = quad.diodes[i];
			if(this.pointEqual(diode.geo, p)) return diode;
		}
		
		return null;
	}
	
	
	this.getDiodeById = function(id)
	{
		for(var i = 0; i < this.diodesGlo.length; i++)
		{
			if(this.diodesGlo[i].id == id) return this.diodesGlo[i];
		}
		
		return null;
	}
	
	this.getTextById = function(id)
	{
		for(var i = 0; i < this.textsGlo.length; i++)
		{
			if(this.textsGlo[i].id == id) return this.textsGlo[i];
		}
		
		return null;
	}

	this.getTextAtPos = function(p)
	{
		var qx = ~~(p[0] / opt.quadSize), qy = ~~(p[1] / opt.quadSize);
		var quad = this.getQuad(qx, qy);

		for(var i = 0; i < quad.texts.length; i++)
		{
			var text = quad.texts[i];
			if(this.pointEqual(text.geo, p)) return text;
		}

		return null;
	}
	
	this.getConnectorAtPoint = function(p)
	{
		var qx = ~~(p[0] / opt.quadSize), qy = ~~(p[1] / opt.quadSize);
		var quad = this.getQuad(qx, qy);
		
		for(var i = 0; i < quad.connectors.length; i++)
		{
			var con = quad.connectors[i];
			if(this.pointEqual(con.geo, p)) return con;
		}
		
		return null;
	}
	
	
	this.getGroupAtPoint = function(p)
	{
		var wires = this.getWiresByEndpoint(p);
		var group = null;
		for(var i = 0; i < wires.length; i++)
		{
			if(wires[i].group != null)
			{
				if(group == null)
				{
					group = wires[i].group;
				}
				else if(group != wires[i].group)
				{
					console.error("ERROR\tMore than one group on one point.");
				}
			}
		}
		
		return group;
	}
	
	// gets an element at a specific point
	this.getElementAtPoint = function(p)
	{
		var qx = ~~(p[0] / opt.quadSize), qy = ~~(p[1] / opt.quadSize);
		var quad = this.getQuad(qx, qy);
		
		for(var i = 0; i < quad.elements.length; i++)
		{
			var e = quad.elements[i];
			
			if(	e.geo[0] <= p[0] && e.geo[1] <= p[1] &&
				(e.geo[0] + e.size[0]) > p[0] && (e.geo[1] + e.size[1]) > p[1] )
			{
				return e;
			}
		}
		
		return null;
	}
	
	// returns an element by id
	this.getElementById = function(id)
	{
		for(var i = 0; i < this.elementsGlo.length; i++)
		{
			if(this.elementsGlo[i].id == id) return this.elementsGlo[i];
		}
		
		return null;
	}
	
	
	// returns the direction of a wire 0=horizontal, 1=vertical, -1=not valid
	this.getWireDirection = function(wire)
	{
		var sameX = (wire.geo[0][0] == wire.geo[1][0]);
		var sameY = (wire.geo[0][1] == wire.geo[1][1]);
		
		if(sameX == sameY)
		{
			console.error("ERROR\tInvalid wire: ", wire);
			return -1;
		}
		
		if(sameY) return 0; // horizontal
		if(sameX) return 1; // vertical
	}

	// returns the type of an object. 0=wire 1=element 2=diode
	this.getObjectType = function(obj) // we need static types...
	{
		if(obj instanceof Element) // is element?
		{
			return 1;
		}
		else if(typeof obj.text == "string") // is text?
		{
			return 3;
		}
		else if(obj.geo[0] instanceof Array) // is wire?
		{
			return 0;
		}
		else if(!isNaN(obj.geo[0])) // is diode?
		{
			return 2;
		}
		else
		{
			console.error("ERROR\tSelected unknown entity: ", obj, new Error().stack);
		}

		return -1;
	}

	// checks if an element, wire or diode is selected
	this.isSelected = function(obj)
	{
		if(this.selectedGlo.indexOf(obj) == -1) return false;
		return true;
	}

	// 
	this.anythingSelected = function()
	{
		return this.selectedGlo.length > 0;
	}
	
	// this function is also in board.logic, it is redundant, because we also need it in a shared instance on server where the logic doesn't exists
	this.pointEqual = function(a, b)
	{
		if(a[0] == b[0] && a[1] == b[1]) return true;
		return false;
	}
}