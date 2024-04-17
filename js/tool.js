"use strict";

function Tool(system, board)
{
	var that = this;
	/*
		Tool IDs
			0 - No tool
			1 - Add Wire Tool
			2 - Delete Tool
			3 - Add Element Tool
			4 - Simulator Tool
			5 - Diode Tool
			6 - Selection Tool
			7 - Text Tool
	*/
	this.toolId = 0;
	this.toolState = false;
	this.toolActionOffset = [0, 0];
	this.toolActionCurrent = [0, 0];
	this.toolDirection = -1;
	this.toolMoved = false;
	
	this.toolElementId = ''; // yes, this is a string
	this.toolElementMod = null; // a prototype object of the element
	this.toolElementCanvas = null;
	this.toolWireState = null;
	this.toolDir = -1;
	this.toolColor = '000000';
	this.toolInputSize = 2;
	this.toolShiftRegisterSize = 4;
	this.toolDecoderInputSize = 3;
	this.toolMuxInputSize = 2;
	this.toolTextSize = 1;
	this.toolSegmentDisplay = 'b4';
	
	this.selectOffset = null;
	this.selectSize = null;
	this.selectMoveStart = null; // start of the last move click
	this.selectMoveCur = null; // current pos of move
	
	this.textNodePending = null;
	
	this.scrollState = false;
	this.scrollOffset = [0, 0];
	this.scrollCurrent = [0, 0];


	
	Event.on('setTool', function(id) {
		// leave selection tool?
		if(id != that.toolId && that.toolId == 6)
		{
			that.toolSelectFinalize();
		}

		// start text tool?
		/*if(id != that.toolId && id == 7)
		{
			Hotkey.changeTags({toolText: true});
		}

		// leave text tool?
		if(id != that.toolId && that.toolId == 7)
		{
			Hotkey.changeTags({toolText: false});
		}*/


		that.toolId = id;
	});
	
	Event.on('setElement', function(id) {
		that.toolElementId = id;
	});
	
	Event.on('setDir', function(dir) {
		that.toolDir = dir;
	});
	
	Event.on('setColor', function(color) {
		that.toolColor = color;
	});
	
	Event.on('setInputSize', function(size) {
		if(size < 2) size = 2;
		if(size > Config.gateInputMax) size = Config.gateInputMax;
	
		that.toolInputSize = size;
	});

	Event.on('setShiftRegisterSize', function(size) {
		if(size < 2) size = 2;
		if(size > Config.shiftRegisterSizeMax) size = Config.shiftRegisterSizeMax;
	
		that.toolShiftRegisterSize = size;
	});

	Event.on('setDecoderInputSize', function(size) {
		if(size < 2) size = 2;
		if(size > Config.decoderInputMax) size = Config.decoderInputMax;
	
		that.toolDecoderInputSize = size;
	});

	Event.on('setMuxInputSize', function(size) {
		if(size < 2) size = 2;
		if(size > Config.muxInputMax) size = Config.muxInputMax;
	
		that.toolMuxInputSize = size;
	});

	Event.on('setTextSize', function(size) {
		that.toolTextSize = size;
	});

	Event.on('setSegmentDisplay', function(type) {
		that.toolSegmentDisplay = type;
	});

	/*Event.on('localUndo', function() {
		if(that.selectOffset != null)  that.toolSelectFinalize();
	});

	Event.on('localRedo', function() {
		if(that.selectOffset != null)  that.toolSelectFinalize();
	});*/
	
	Event.on('selectionDelete', function() {
		system.transaction.start();
		board.logic.execCommand(7);
		system.transaction.commit();

		that.toolSelectFinalize();
	});

	Event.on('selectionCopy', function() {
		board.logic.execCommand(10);
	});

	Event.on('selectionPaste', function() {
		Event.send('setTool', 6);

		var rect = board.logic.execCommand(11, [
			~~(RenderState.viewOffset[0] / -Config.zoom + 0.5),
			~~(RenderState.viewOffset[1] / -Config.zoom + 0.5)
		]);

		if(rect != null)
		{
			that.selectOffset = [rect[0], rect[1]];
	 		that.selectSize = [rect[2], rect[3]];
		}
		else
		{
			that.selectOffset = null;
	 		that.selectSize = null;
		}

		system.renderer.setSelectionOffset( getSelectMoveOffset() );
		system.renderer.overlaySelectionSet( getSelectRect() );
	});

	Event.on('toolTextChange', function(obj) {
		that.toolTextChange(obj);
	});


	Event.on('actionStart', function(arg) {
		var ox = RenderState.viewOffset[0], oy = RenderState.viewOffset[1];
	
		that.toolState = true;
		that.toolMoved = false;
		that.toolDirection = -1;
		that.toolActionOffset = [arg[0] - ox, arg[1] - oy];
		
		switch(that.toolId)
		{
			case 3:
				that.toolElementStart();
				break;
				
			case 6:
				that.toolSelectStart();
				break;

			case 7:
				that.toolTextStart(arg[2]);
		}

		Event.send('actionMove', arg);
	});
	
	Event.on('actionMove', function(arg) {
		var boardX = arg[0] - RenderState.viewOffset[0];
		var boardY = arg[1] - RenderState.viewOffset[1];
	
		that.toolActionCurrent = [boardX, boardY];

		if(boardX != that.toolActionOffset[0] || boardY != that.toolActionOffset[1]) that.toolMoved = true;
		
		if(that.toolState)
		{
			// calculate tool direction if necessary
			if(that.toolDirection == -1)
			{
				var diff = [ that.toolActionCurrent[0] - that.toolActionOffset[0], that.toolActionCurrent[1] - that.toolActionOffset[1] ];
				
				if(diff[0] != 0 || diff[1] != 0)
				{
					if( Math.abs(diff[0]) > Math.abs(diff[1]) ) // is X direction
					{
						that.toolDirection = (diff[0] < 0) ? 3 : 1;
					}
					else // is Y direction
					{
						that.toolDirection = (diff[1] < 0) ? 0 : 2;
					}
				}
			}
		}
		
		if(that.scrollState)
		{
			Event.send('scrollMove', arg);
		}
		
		switch(that.toolId)
		{
			case 1: // add wire tool
			case 2: // delete tool
				that.toolCommonMove();
				break;
			case 3: // element tool
				that.toolElementMove();
				break;
			case 6:
				that.toolSelectMove();
				break;
		}
	});
	
	Event.on('actionEnd', function(arg) {
		that.toolState = false;
		Event.send('actionMove', arg);

		switch(that.toolId)
		{
			case 1: // add wire tool
			case 2: // delete tool
			case 5: // diode tool
				that.toolCommonEnd();
				break;
			case 3: // element tool
				that.toolElementEnd();
				break;
			case 4: // simulator tool
				that.toolSimulatorEnd();
				break;
			case 6:
				that.toolSelectEnd();
				break;
			case 7:
				that.toolTextEnd();
		}
	});
	
	Event.on('scrollStart', function(arg) {
		that.scrollState = true;
		that.scrollOffset = [arg[0], arg[1]];
		that.scrollCurrent = [arg[0], arg[1]];
	});
	
	Event.on('scrollMove', function(arg) {
		var rel = [ arg[0] - that.scrollCurrent[0], arg[1] - that.scrollCurrent[1] ];

		system.renderer.moveView(rel);
		that.scrollCurrent = [arg[0], arg[1]];
	});
	
	Event.on('scrollEnd', function(arg) {
		if(!that.scrollState) return;
		
		Event.send('scrollMove', arg);
		that.scrollState = false;
		system.renderer.minimapHide();
	});

	// key handler
	Hotkey.register('del', function() {
		if(that.toolId == 6 && that.selectOffset != null) // anything selected?
		{
			Event.send('selectionDelete');
		}
	});

	Hotkey.register('ctrl+x', function() {
		if(that.toolId == 6 && that.selectOffset != null) // anything selected?
		{
			Event.send('selectionCopy');
			Event.send('selectionDelete');
		}
	});

	Hotkey.register('ctrl+c', function() {
		if(that.toolId == 6 && that.selectOffset != null) // anything selected?
		{
			Event.send('selectionCopy');
		}
	});

	Hotkey.register('ctrl+v', function() {
		var focusedElement = $(':focus');
		if(focusedElement.hasClass('editable')) return;

		if(system.getMode() != 0) return;

		Event.send('selectionPaste');
	});

	Hotkey.register('ctrl+z', function() {
		if(system.getMode() != 0) return;
		Event.send('localUndo');
	});

	Hotkey.register('ctrl+y', function() {
		if(system.getMode() != 0) return;
		Event.send('localRedo');
	});

	/*Hotkey.register('ctrl+f12', function() {
		system.previewMgr.showPreview()
	});*/
	
	// logic
	this.createArgObject = function()
	{
		return {
			dir: this.toolDir,
			color: this.toolColor,
			inputSize: this.toolInputSize,
			shiftRegisterSize: this.toolShiftRegisterSize,
			decoderInputSize: this.toolDecoderInputSize,
			muxInputSize: this.toolMuxInputSize,
			segmentDisplay: this.toolSegmentDisplay
		}
	}
	
	this.getTool = function()
	{
		return this.toolId;
	}
	
	this.toolCommonMove = function()
	{	
		if(this.toolDirection != -1 && this.toolState == true)
		{
			var d = (this.toolDirection == 0 || this.toolDirection == 2) ? 1 : 0;
			
			// [start, end , break]
			var wirePoints = [
				this.toolActionOffset.slice(),
				this.toolActionCurrent.slice(),
				this.toolActionOffset.slice()
			]

			// setup break point from mixing start and end point
			wirePoints[2][d] = this.toolActionCurrent[d];
			
			// preprocess coordinates
			for(var p = 0; p < 3; p++)
			{
				for(var i = 0; i < 2; i++)
				{
					wirePoints[p][i] = ~~(wirePoints[p][i] / Config.zoom + 0.5)
				}
			}
			
			// set prototype wires for later use
			this.toolWireState = [
				[ wirePoints[d], wirePoints[2] ],
				[ wirePoints[2], wirePoints[1 - d] ]
			];
			
			system.renderer.overlayWiresSet(this.toolWireState[0], this.toolWireState[1], this.toolId - 1);
		}
	}
	
	this.toolCommonEnd = function()
	{
		var cmd = this.toolId;
		if(this.toolWireState) // if you moved the mouse, this action is obviously for wires
		{
			if(this.toolMoved == true)
			{
				// start transaction
				var success = true;
				system.transaction.start();

				// exec commands in transaction
				for(var i = 0; i < 2; i++)
				{
					var result = board.logic.execCommand(cmd, this.toolWireState[i]); // add/delete wire command

					if(result == false && cmd == 1) // add wire failed? -> rollback
					{
						success = false;
					}
				}
				
				// end transaction
				success ? system.transaction.commit() : system.transaction.rollback();
			}
		}
		else // mouse not moved, obviosly for elements or connection points ("via")
		{
			if(this.toolMoved == false)
			{
				// prepare
				var x = ~~(this.toolActionCurrent[0] / Config.zoom + 0.5);
				var y = ~~(this.toolActionCurrent[1] / Config.zoom + 0.5);

				// start transaction
				system.transaction.start();
				
				// exec command
				if(cmd == 1) // add tool -> toggle connection
				{
					board.logic.execCommand(5, [x, y]); // toggle connection or negator
				}
				else if(cmd == 2) // delete tool -> delete element/text
				{
					board.logic.execCommand(4, [x, y]); // delete element
					board.logic.execCommand(14, [x, y]); // delete text
				}
				else if(cmd == 5) // diode tool -> toggle diode
				{
					board.logic.execCommand(6, [x, y]); // toggle diode
				}
				
				// end transaction
				system.transaction.commit();
			}
		}
	
		this.toolWireState = null;
		system.renderer.overlayWiresHide();
	}
	
	this.toolElementStart = function()
	{
		if(this.toolElementId == '') return;
		
		// create temp mod and canvas if necessary
		if(this.toolElementMod == null)
		{
			var arg = this.createArgObject();
			
			var e = ElementStore[this.toolElementId];
			this.toolElementMod = new e.mod(arg);
			var overlay = system.renderer.overlayElementCreate(this.toolElementMod.size);
			
			this.toolElementMod.renderTo(overlay, 0, 0, Config.zoom, 0, 0);
			
			this.toolElementMove();
		}
	}
	
	this.toolElementMove = function()
	{
		if(this.toolElementId == '') return;
	
		var e = ElementStore[this.toolElementId];
		var x = ~~(this.toolActionCurrent[0] / Config.zoom + 0.5);
		var y = ~~(this.toolActionCurrent[1] / Config.zoom + 0.5);
		system.renderer.overlayElementMove(x, y);
	}
	
	this.toolElementEnd = function()
	{
		if(this.toolElementId == '') return;
	
		var e = ElementStore[this.toolElementId];
		var x = ~~(this.toolActionCurrent[0] / Config.zoom + 0.5);
		var y = ~~(this.toolActionCurrent[1] / Config.zoom + 0.5);
		var args = this.createArgObject();
	
		system.renderer.overlayElementRemove();
		
		system.transaction.start();
		board.logic.execCommand(3, {id: this.toolElementId, geo: [x, y], args: args}); // add element command
		system.transaction.commit();
		
		this.toolElementMod = null;
	}

	this.toolSimulatorEnd = function()
	{
		if(this.toolMoved == false)
		{
			var x = ~~(this.toolActionCurrent[0] / Config.zoom + 0.5);
			var y = ~~(this.toolActionCurrent[1] / Config.zoom + 0.5);
			
			var element = board.storage.getElementAtPoint([x, y]);
			if(element != null)
			{
				system.simulator.clickElement(element);
			}
		}
	}
	
	this.toolSelectStart = function()
	{
		this.selectMoving = false;

		if(this.selectOffset != null) // there is still a rect available, is the click in it?
		{
			var p = [];
			p[0] =  ~~((this.toolActionOffset[0] / Config.zoom) + 0.5);
			p[1] =  ~~((this.toolActionOffset[1] / Config.zoom) + 0.5);

			var rect = getSelectRect();

			var diffX = p[0] - rect[0];
			var diffY = p[1] - rect[1];

			if(diffX <= this.selectSize[0] && diffY <= this.selectSize[1] && diffX > 0 && diffY > 0)
			{
				if(this.selectMoveStart == null)
				{
					this.selectMoveStart = [0, 0];
				}
				
				if(this.selectMoveCur != null)
				{
					if(this.selectMoveCur[0] != 0 || this.selectMoveCur[1] != 0)
					{
						console.log("ERROR\tInvalid selection move value");
					}
				}
				else
				{
					this.selectMoveCur = [0, 0];
				}

				// start moving! prevent reset of select rect
				/*
				this.selectMoving = true;
				if(this.selectRectBeforeMoving == null)
				{
					this.selectRectBeforeMoving = this.selectRect.slice();
				}
				else
				{
					// wtf?
					//this.selectMovingOffsetTmp[0] = this.selectRectBeforeMoving[0] - this.selectRect[0];
					//this.selectMovingOffsetTmp[1] = this.selectRectBeforeMoving[1] - this.selectRect[1];
				}
				*/

				system.renderer.setDirty(0);
				system.renderer.setDirty(1);
				system.renderer.setDirty(2);

				system.renderer.setSelectionOffset( getSelectMoveOffset() );
				system.renderer.overlaySelectionSet( getSelectRect() );
			}
			else // not clicked in the selection -> reset selection
			{
				this.toolSelectFinalize();
			}
		}
	}
	
	this.toolSelectMove = function()
	{
		if(!this.toolState) return; // inactive?

		var p0 = [0, 0];
		var p1 = [0, 0];
		
		for(var i = 0; i < 2; i++)
		{
			p0[i] = ~~((this.toolActionOffset[i] / Config.zoom) );
			p1[i] = ~~((this.toolActionCurrent[i] / Config.zoom) ); 
		}

		if(this.selectMoveCur == null) // make new selection
		{
			var offset = [ p0[0], p0[1] ];
			var size = [ p1[0] - p0[0], p1[1] - p0[1] ];
		
			for(var i = 0; i < 2; i++)
			{
				if(size[i] < 0)
				{
					size[i] *= -1;
					offset[i] -= size[i];
				}
			}

			if(size[0] == 0 || size[1] == 0)
			{
				offset = null;
				size = null;
			}
			
			this.selectOffset = offset;
			this.selectSize = size;

			// send to logic
			var unadjustedRect = getSelectRect();
			var adjustedRect = null;
			if(unadjustedRect != null)
			{
				adjustedRect = [  // set selection area
					unadjustedRect[0] + 1,
					unadjustedRect[1] + 1,
					unadjustedRect[0] + unadjustedRect[2],
					unadjustedRect[1] + unadjustedRect[3]
				];
			}
			else
			{
				if(RenderState.selectionOffset)
				{
					this.toolSelectFinalize(); // move done?
				}
			}

			board.logic.execCommand(8, adjustedRect);
		}
		else // move current selection
		{
			this.selectMoveCur[0] = p1[0] - p0[0];
			this.selectMoveCur[1] = p1[1] - p0[1];
		}

		var oldOffset = system.renderer.selectionOffset;
		var newOffset = getSelectMoveOffset();
		system.renderer.setSelectionOffset( newOffset );
		system.renderer.overlaySelectionSet(getSelectRect());

		if(oldOffset == null || oldOffset[0] != newOffset[0] || oldOffset[1] != newOffset[1])
		{
			system.renderer.setDirty(0);
			system.renderer.setDirty(1);
		}
	}
	
	this.toolSelectEnd = function()
	{
		system.renderer.setSelectionOffset( getSelectMoveOffset() );
		system.renderer.overlaySelectionSet(getSelectRect());

		if(this.selectMoveStart != null)
		{
			this.selectMoveStart[0] += this.selectMoveCur[0];
			this.selectMoveStart[1] += this.selectMoveCur[1];

			this.selectMoveCur = [0, 0];
		}
	}

	this.toolSelectFinalize = function()
	{
		if(board.storage.selectionFloating) // paste selection?
		{
			var offset = getSelectMoveOffset();

			system.transaction.start();
			var success = board.logic.execCommand(12, offset);

			if(success)
			{
				system.transaction.commit();
			}
			else
			{
				system.transaction.rollback();
			}
		}
		else // move selection?
		{
			var offset = getSelectMoveOffset();

			if(offset[0] != 0 || offset[1] != 0)
			{
				system.transaction.start();
				var success = board.logic.execCommand(9, offset);

				if(success)
				{
					system.transaction.commit();
				}
				else
				{
					system.transaction.rollback();
				}
			}
		}

		// unselect in tool
		this.selectMoveStart = null;
		this.selectMoveCur = null;
		this.selectOffset = null;
		this.selectSize = null;

		// unselect in renderer
		system.renderer.setSelectionOffset( getSelectMoveOffset() );
		system.renderer.overlaySelectionSet( null );

		// unselect in storage
		board.logic.execCommand(8, null);

		// render!
		system.renderer.setDirty(0); // is that really necessary?
		system.renderer.setDirty(1);
	}

	this.toolTextStart = function(e)
	{
		if(this.textNodePending != null)
		{
			this.toolTextChange(this.textNodePending);
			return;
		}

		var x = ~~(this.toolActionOffset[0] / Config.zoom + 0.5);
		var y = ~~(this.toolActionOffset[1] / Config.zoom + 0.5);

		this.textNodePending = system.renderer.overlayTextAdd(x, y, "", this.toolTextSize, null);

		this.textNodePending.jqEditable.focus();
	}

	this.toolTextEnd = function()
	{
		
	}

	this.toolTextChange = function(node)
	{
		//var html = node.jqEditable.html();
		var txt = node.jqEditable.val();
		if(that.textNodePending == node) // change pending. either add to storage or delete from renderer
		{
			if(txt != "") // add to storage
			{
				system.transaction.start();
				board.logic.execCommand(13, {
					geo: [that.textNodePending.x, that.textNodePending.y],
					text: txt,
					size: this.toolTextSize
				});
				system.transaction.commit();
			}

			system.renderer.overlayTextRemove(node);
			that.textNodePending = null;
		}
		else // edit existing node
		{
			if(that.textNodePending != null)
			{
				that.toolTextChange(that.textNodePending);
			}

			// delete old an add new
			if(node.text != txt)
			{
				var geo = [node.x, node.y];
				system.transaction.start();
				board.logic.execCommand(14, geo);
				if(txt != "") board.logic.execCommand(13, { geo: geo, text: txt, size: node.size} );
				system.transaction.commit();
			}
		}
	}

	function getSelectRect()
	{
		if(that.selectSize == null || that.selectOffset == null) return null;
		
		var rect = [that.selectOffset[0], that.selectOffset[1], that.selectSize[0], that.selectSize[1]];
		var moveOffset = getSelectMoveOffset();

		rect[0] += moveOffset[0];
		rect[1] += moveOffset[1];
		
		return rect;
	}

	function getSelectMoveOffset()
	{
		var rect = [0, 0];

		if(that.selectMoveStart != null)
		{
			rect[0] += that.selectMoveStart[0];
			rect[1] += that.selectMoveStart[1];
		}

		if(that.selectMoveCur != null)
		{
			rect[0] += that.selectMoveCur[0];
			rect[1] += that.selectMoveCur[1];
		}

		return rect;
	}
	
	// init all tools/options
	this.initTools = function()
	{
		Event.send('setTool', 1);
		Event.send('setDir', 0);
		Event.send('setColor', ToolOptionProvider.getOptionByName('color').values[0]);
	}
}