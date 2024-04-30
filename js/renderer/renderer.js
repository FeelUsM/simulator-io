"use strict";

var zeroOffset = [0, 0]; // static const

function Renderer(system, board)
{
	var that = this;

	this.map = new MapRenderer(this, system, board);
	this.nativeLayer = new NativeLayer();
	this.overlayWires = null;
	this.overlayElement = null;
	this.overlaySelection = null;
	this.overlayChanges = null;
	this.overlayChangesList = null;
	this.overlayTextContainer = null;
	this.overlayMinimap = null;
	this.measureBox = null;
	this.layerCanvasBg = null;
	this.layerCanvas = null;
	this.minimapTimeout = null; // setTimeout handle


	/* INTERFACE */
	this.reset = function()
	{
		RenderState.reset();

		RenderState.boardElement = system.boardElement;
		RenderState.dirtyMapAll = true;

		// init overlays
		this.nativeLayer.reset();

		// init map
		this.map.reset();
		this.minimapTimeout = -1;

		// create canvas layers
		this.layerCanvasBg = this.nativeLayer.add('canvasBg');
		this.layerCanvas = [
			this.nativeLayer.add('canvas'),
			this.nativeLayer.add('canvas')
		];

		// create overlays
		this.overlayWires = [
			this.nativeLayer.add('wire'),
			this.nativeLayer.add('wire')
		];
		this.overlayElement = null;
		this.overlaySelection = this.nativeLayer.add('selection');
		this.overlayChanges = this.nativeLayer.add('changesContainer');
		this.overlayTextContainer = this.nativeLayer.add('textContainer');
		this.overlayMinimap = this.nativeLayer.add('minimap');

		// add elements to minimap
		this.map.setupDom(this.overlayMinimap);

		// create measure boxes (for text size measuring and font-load detection)
		this.measureBox = this.nativeLayer.add('measureBox', this.overlayTextContainer);
		Event.send('setMeasureBox', this.measureBox);

		// write canvas ctx to renderstate
		RenderState.canvasCtx[0] = this.layerCanvas[0][0].getContext('2d');
		RenderState.canvasCtx[1] = this.layerCanvas[1][0].getContext('2d');

		// prevent scrolling (e.g. by text area selections)
		$(system.boardElement).scroll(function() {
			$(this).scrollTop(0);
			$(this).scrollLeft(0);
		});

		// init font-load trigger
		fontLoadTriggerInit();

		this.updateZoom();
	}

	this.setActive = function(a)
	{
		if(RenderState.active == false && a == true)
		{
			RenderState.active = a;
			requestAnimationFrame(that.drawHandler);
		}
		else
		{
			RenderState.active = a;
		}
	}

	// RESIZE BOARD/VIEW PANEL HANDLER
	this.resizeRenderPanel = function(start, size)
	{
		that.setDirty(0);
		that.setDirty(1);
		
		$(RenderState.boardElement).width(size[0]);
		$(RenderState.boardElement).height(size[1]);

		this.layerCanvasBg.width(size[0] - 1);
		this.layerCanvasBg.height(size[1] - 1);
		
		RenderState.viewSize = size;
	}

	this.resizeBoard = function(size)
	{
		RenderState.boardSize = size;

		this.map.resizeBoard();
	}

	// MOVE/ZOOM IMPLEMENTATION AND INTERFACE
	this.setViewOffset = function(view)
	{
		RenderState.viewOffset = view;
		RenderState.viewOffset[0] = Math.min(~~view[0], 0);
		RenderState.viewOffset[1] = Math.min(~~view[1], 0);

		that.layerCanvasBg.css('background-position', view[0] + 'px ' + view[1] + 'px');
		
		this.overlaySelectionUpdate();
		this.overlayChangeUpdate();

		this.setDirty(3);
	}

	this.applyZoom = function(delta)
	{
		var old = Config.zoom;
		Config.zoom += (delta * 2);
		
		if(Config.zoom % 2 != 0) Config.zoom--; // never allow odd values, or we will have some aliasing issues
		
		if(Config.zoom < Config.minZoom) Config.zoom = Config.minZoom;
		if(Config.zoom > Config.maxZoom) Config.zoom = Config.maxZoom;
	
		if(old == Config.zoom) return; // nothing changed!
		
		// update point of view
		var mouseGlo = [-RenderState.viewOffset[0] + system.input.mousePos[0], -RenderState.viewOffset[1] + system.input.mousePos[1]];
		var onGridOld = [mouseGlo[0] / old, mouseGlo[1] / old];
		var onGridNew = [mouseGlo[0] / Config.zoom, mouseGlo[1] / Config.zoom];
		var gridDiff =  [onGridNew[0] - onGridOld[0], onGridNew[1] - onGridOld[1]];
		
		this.moveView([ gridDiff[0] * Config.zoom, gridDiff[1] * Config.zoom ]);
		
		this.updateZoom();
	}

	this.moveView = function(rel)
	{
		this.setViewOffset([RenderState.viewOffset[0] + rel[0], RenderState.viewOffset[1] + rel[1]]);
	}

	this.setSelectionOffset = function(offset)
	{
		RenderState.selectionOffset = offset;
	}

	this.updateZoom = function()
	{
		if(Config.zoom == RenderState.appliedZoom) return;
		RenderState.appliedZoom = Config.zoom;

		var dataUri = RenderHelper.getGridUri(Config.zoom);
		this.layerCanvasBg.css('background-image', 'url(' + dataUri + ')');

		this.setDirty(4);

	}

	// DIRTY HANDLERS
	this.setDirty = function(n) // dirty layer
	{
		RenderState.dirtyFlags[n] = true;
	}

	this.addDirtyMapQuad = function(quad) // dirty single quad in map
	{
		if(RenderState.dirtyMapQuads.indexOf(quad) == -1)
		{
			RenderState.dirtyMapQuads.push(quad);
		}
	}

	// MINIMAP INTERFACE
	this.minimapShow = function()
	{
		if(this.minimapTimeout != -1) window.clearTimeout(this.minimapTimeout);
		this.minimapTimeout = -1;
		this.overlayMinimap.stop(true, true);
		this.overlayMinimap.show();
	}

	this.minimapHide = function()
	{
		if(this.minimapTimeout != -1) window.clearTimeout(this.minimapTimeout);
		this.minimapTimeout = window.setTimeout(function() {
			that.overlayMinimap.fadeOut(500);
		}, 2000);
	}

	this.getPreviewBuffer = function(size, returnDataUrl)
	{
		size = size || Config.maxPreviewEdge;
		returnDataUrl = returnDataUrl || false;

		if(!atob) return null;

		// calc ratio
		var ratio = RenderState.boardSize[0] / RenderState.boardSize[1];
		var width = size, height = size;
		if(ratio < 1) width = width * ratio;
		if(ratio > 1) height = height * (1/ratio);

		// create canvas
		var tempCanvas = $('<canvas>')[0];

		tempCanvas.width = width;
		tempCanvas.height = height;

		// render to it
		this.map.renderPreview(tempCanvas.getContext('2d'), size);

		// get data url
		var dataUrl = tempCanvas.toDataURL("image/png");
		var dataUrlHeader = 'data:image/png;base64,';

		if(returnDataUrl) return dataUrl;

		// get array buffer from data url
		if(dataUrl.indexOf(dataUrlHeader) === 0)
		{
			var base64str = dataUrl.substr(dataUrlHeader.length);
			var binary = atob(base64str);
			var len = binary.length;
			var buffer = new Uint8Array(len);

			// memcopy for js people..........
			for(var i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);

			return buffer;
		}
		else
		{
			console.error("ERROR\tInvalid data url header");
		}

		return null;
	}

	// ---------------------------------------------- DRAW ----------------------------------------------
	this.drawHandler = function()
	{
		if(!RenderState.active) return; // inactive

		// call next frame
		requestAnimationFrame(that.drawHandler);
		//setTimeout(that.drawHandler, 500);
			
		if(!logicApp) return; // not fully initialized yet
		
		// uhm. normally you shouldn't put your logic ticks into your render loop... but this is JS :)
		that.logicTicks();

		// draw		
		that.drawMainBoard();
		that.map.draw();

		// reset dirty flags
		RenderState.dirtyFlags[0] = false; // wires
		RenderState.dirtyFlags[1] = false; // elements

		RenderState.dirtyFlags[3] = false; // offset
		RenderState.dirtyFlags[4] = false; // zoom
	}

	this.drawMainBoard = function()
	{
		var w = RenderState.viewSize[0],
			h = RenderState.viewSize[1];
		var ox = RenderState.viewOffset[0],
			oy = RenderState.viewOffset[1];

		// resize, clear and collect more information
		var changedView = RenderState.dirtyFlags[3] || RenderState.dirtyFlags[3];
		var anythingDirty = changedView;
		var anythingSelected = board.storage.anythingSelected();

		for(var i = 0; i < 2; i++)
		{
			if(RenderState.dirtyFlags[i] || changedView)
			{
				this.layerCanvas[i][0].width = w;
				this.layerCanvas[i][0].height = h;
				this.layerCanvas[i].width(w);
				this.layerCanvas[i].height(h);
				anythingDirty = true;
			}
		}

		if(RenderState.dirtyFlags[2] || changedView) // text updates?
		{
			this.overlayTextUpdate();
			RenderState.dirtyFlags[2] = false;
		}

		if(anythingDirty == false) return; // nothing to redraw

		// draw everything (normal mode)
		this.drawScreen([
			~~(-ox / Config.zoom),
			~~(-oy / Config.zoom),
			~~((-ox + w) / Config.zoom) + 1,
			~~((-oy + h) / Config.zoom) + 1
		], anythingSelected ? 1 : 0);

		// draw everything (selected mode) if necessary
		if(anythingSelected)
		{
			this.drawScreen([
				~~(-ox / Config.zoom) - RenderState.selectionOffset[0],
				~~(-oy / Config.zoom) - RenderState.selectionOffset[1],
				~~((-ox + w) / Config.zoom) + 1,
				~~((-oy + h) / Config.zoom) + 1
			], 2);
		}
	}

	this.drawScreen = function(rect, screenRenderMode) // screenRenderMode: 0=everything 1=everything but selections 2=selections only
	{
		function skipInThisMode(obj)
		{
			if(screenRenderMode != 0)
			{
				// short for: (isSelected() && screenMode == 1) || (!isSelected() && screenMode == 2)
				var selected = board.storage.isSelected(obj);
				if( (selected && screenRenderMode == 1) || (!selected && screenRenderMode == 2) ) return true;
			}

			return false;
		}

		var visibleQuads = this.getVisibleQuadsFromRect(rect);
		var visibleWires = [];
		var visibleElements = [];
		var visibleDiodes = [];
		var viewChanged = RenderState.dirtyFlags[3] || RenderState.dirtyFlags[4];

		// collect visible wires and elements
		for(var qI = 0; qI < visibleQuads.length; qI++)
		{
			var quad = visibleQuads[qI];
		
			// get all wires and diodes if needed
			if(RenderState.dirtyFlags[0] || viewChanged)
			{
				// wires
				for(var d = 0; d < 2; d++)
				{
					for(var i = 0; i < quad.wires[d].length; i++)
					{
						var wire = quad.wires[d][i];

						if(skipInThisMode(wire)) continue;
						if(visibleWires.indexOf(wire) == -1) visibleWires.push(wire);
					}
				}
				
				// diodes
				for(var i = 0; i < quad.diodes.length; i++)
				{
					var diode = quad.diodes[i];

					if(skipInThisMode(diode)) continue;
					if(visibleDiodes.indexOf(diode) == -1) visibleDiodes.push(diode);
				}
			}
			
			// get all elements if needed
			if(RenderState.dirtyFlags[1] || viewChanged)
			{
				for(var i = 0; i < quad.elements.length; i++)
				{
					var element = quad.elements[i];

					if(skipInThisMode(element)) continue;
					if(visibleElements.indexOf(element) == -1) visibleElements.push(element);
				}
			}
		}

		// add selection which is floating (so not present in the board storage yet)
		if(screenRenderMode != 1 && board.storage.selectionFloating)
		{
			// add entitys
			for(var i = 0; i < board.storage.selectedGlo.length; i++)
			{
				var item = board.storage.selectedGlo[i];
				var type = board.storage.getObjectType(item);

				if(type == 0) // wire
				{
					visibleWires.push(item);
				}
				else if(type == 1) // element
				{
					visibleElements.push(item);
				}
				else if(type == 2) // diode
				{
					visibleDiodes.push(item);
				}
			}
		}

		
		if((visibleWires.length + visibleDiodes.length) > 0 )
		{
			drawWires(board, visibleWires, Config.zoom, RenderState.canvasCtx[0]);
			drawDiodes(board, visibleDiodes, Config.zoom, RenderState.canvasCtx[0]);
		}
		
		if(visibleElements.length > 0)
		{
			drawElements(board, visibleElements, Config.zoom, RenderState.canvasCtx[1]);
		}
	}


	// ------------------------------------- OVERLAY HANDLER: WIRES -------------------------------------

	// Shows and set the overlay wires
	// Pass an array per wire (0=hor, 1=ver). array should have 3 values: startX, startY, length
	// Pass mode, 0=normal 1=thick red line
	this.overlayWiresSet = function(w0, w1, mode)
	{
		var ox = RenderState.viewOffset[0], oy = RenderState.viewOffset[1];
	
		for(var d = 0; d < 2; d++)
		{
			// collect data
			var w = (d == 0) ? w0: w1;
			var element = this.overlayWires[d];
			
			// sort
			if(w[0][d] > w[1][d]) w = [w[1], w[0]];
			
			// display element and set offset
			element.css('display', 'block');
			element.css('left', (w[0][0] * Config.zoom - (mode == 1 ? 1 : 0) + ox) + 'px');
			element.css('top', (w[0][1] * Config.zoom - (mode == 1 ? 1 : 0) + oy) + 'px');

			// set width/height
			var length = (w[1][d] - w[0][d]) * Config.zoom + (mode == 1 ? 2 : 0);
			var lengthStr = length + 'px';
			var weightStr = (mode == 1) ? '3px' : '1px';
			
			element.css('width', (d == 0) ? lengthStr : weightStr);
			element.css('height', (d == 1) ? lengthStr : weightStr);
			element.css('background-color', (mode == 0) ? Config.colWireAdd : Config.colWireDelete);
		}
	}

	this.overlayWiresHide = function()
	{
		for(var i = 0; i < 2; i++)
		{
			this.overlayWires[i].css('display', 'none');
		}
	}

	// -------------------------------------- OVERLAY HANDLER: ELEMENT --------------------------------------
	this.overlayElementCreate = function(size)
	{
		this.overlayElement = this.nativeLayer.add('element');
		this.overlayElement[0].width = (size[0] + 1) * Config.zoom + 1;
		this.overlayElement[0].height = (size[1] + 1) * Config.zoom + 1;

		return this.overlayElement[0].getContext('2d');
	}

	this.overlayElementMove = function(x, y)
	{
		var ox = RenderState.viewOffset[0], oy = RenderState.viewOffset[1];
		
		if(this.overlayElement)
		{
			this.overlayElement.css('top', ((y - 0.5) * Config.zoom + oy) + 'px');
			this.overlayElement.css('left', ((x - 0.5) * Config.zoom + ox) + 'px');
			this.overlayElement.show();
		}
	}

	this.overlayElementRemove = function()
	{
		if(this.overlayElement)
		{
			this.overlayElement.remove();
			this.overlayElement = null;
		}
	}

	// --------------------------------------- OVERLAY HANDLER: CHANGE --------------------------------------

	// store functions for change overlay quads (low level)
	this.overlayChangeGetQuad = function(x, y)
	{
		for(var i = 0; i  < RenderState.overlayChangeList.length; i++)
		{
			if(RenderState.overlayChangeList[i].x == x && RenderState.overlayChangeList[i].y == y)
			{
				return RenderState.overlayChangeList[i];
			}			
		}

		return null;
	}
	
	this.overlayChangeAddQuad = function(obj)
	{
		RenderState.overlayChangeList.push(obj);
	}
	
	this.overlayChangeDeleteQuad = function(x, y)
	{
		var obj = this.overlayChangeGetQuad(x, y);
		var idx = RenderState.overlayChangeList.indexOf(obj);
	
		if(idx != -1)
		{
			RenderState.overlayChangeList.splice(idx, 1);
		}
		else
		{
			console.error("ERROR\tCannot delete change overlay quad");
		}
	}

	// add overlay for changed area
	// 	area=[x1,y1,x2,y2], not pixels, but grid points
	// 	color=string without #
	//
	// you have to call overlayChangeUpdate after this
	this.overlayChangeAdd = function(area, color)
	{
		// calculate overlay color
		var rgb = hexToRGB(color);
		for(var i = 0; i < 3; i++)
		{
			rgb[i] = Math.min(255, rgb[i] + 70);
		}		
	
		// create dom elements, if necessary
		for(var y = 0; y < area[3]; y++)
		{
			for(var x = 0; x < area[2]; x++)
			{
				var aX = area[0] + x;
				var aY = area[1] + y;
				
				// get or create
				var obj = this.overlayChangeGetQuad(aX, aY);
				if(obj == null)
				{
					obj = {x: aX, y: aY, jq: null, timeout: null};
					obj.jq = $('<div>').appendTo(this.overlayChanges);
					obj.jq.data('x', aX);
					obj.jq.data('y', aY);
					obj.jq.css('position', 'absolute');
					obj.jq.css('cursor', 'crosshair');
				
					this.overlayChangeAddQuad(obj);
				}
				else
				{
					if(obj.timeout)
					{
						clearTimeout(obj.timeout);
						obj.timeout = null;
					}
					
					obj.jq.stop(true);
					obj.jq.clearQueue();
				}
				
				// set
				obj.jq.css('background-color', 'rgb(' + rgb.join() + ')');
				obj.jq.fadeTo(0, 0.4);
		
				// animate and termination
				(function(obj) {
					obj.timeout = setTimeout(function() {
						obj.timeout = null;
						obj.jq.fadeOut(Config.changeOverlayFadeTime, function() {
							that.overlayChangeDeleteQuad(obj.x, obj.y);
							obj.jq.remove();
						});
					}, Config.changeOverlayFadeDelayTime);
				})(obj);
			}
		}
	}

	this.overlayChangeUpdate = function()
	{
		var ox = RenderState.viewOffset[0], oy = RenderState.viewOffset[1];

		for(var i = 0; i < RenderState.overlayChangeList.length; i++)
		{
			var overlay = RenderState.overlayChangeList[i];
			overlay.jq.css('top', ((overlay.y - 0.5) * Config.zoom + oy) + 'px');
			overlay.jq.css('left', ((overlay.x - 0.5) * Config.zoom + ox) + 'px');
			overlay.jq.width(Config.zoom + 1);
			overlay.jq.height(Config.zoom + 1);
		}
	}

	// ------------------------------------- OVERLAY HANDLER: SELECTION -------------------------------------
	this.overlaySelectionSet = function(rect)
	{		
		RenderState.overlaySelectionRect = rect;
		this.overlaySelectionUpdate();

		this.setDirty(2); // if the rect changes, we should also update the text nodes
	}

	this.overlaySelectionUpdate = function()
	{	
		if(RenderState.overlaySelectionRect != null)
		{
			var ox = RenderState.viewOffset[0], oy = RenderState.viewOffset[1];
		
			var startX = (RenderState.overlaySelectionRect[0] + 0.5) * Config.zoom + ox - 1;
			var startY = (RenderState.overlaySelectionRect[1] + 0.5) * Config.zoom + oy - 1;
			var sizeX = RenderState.overlaySelectionRect[2] * Config.zoom;
			var sizeY = RenderState.overlaySelectionRect[3] * Config.zoom;
		
			this.overlaySelection.css('left', startX + 'px');
			this.overlaySelection.css('top', startY + 'px');
			this.overlaySelection.width(sizeX - 1);
			this.overlaySelection.height(sizeY - 1);
			this.overlaySelection.fadeTo(0, 0.5);
		}
		else
		{
			this.overlaySelection.hide();
		}
	}

	// ------------------------------------- OVERLAY HANDLER: TEXT -------------------------------------
	this.overlayTextAdd = function(x, y, text, size, ref)
	{
		size = size || 1;

		function updateSize()
		{
			var measured = textMeasureSize(jqTextarea.val());
			var adjustedToSize = [measured[0] * size * Config.zoom, measured[1] * size * Config.zoom];
			
			if(RenderState.textNodesActive)
			{
				jqWrap.width(adjustedToSize[0] + 20); // +20 for padding
				jqWrap.height(adjustedToSize[1] + 20); // +20 for padding
			}
			jqTextarea.width(adjustedToSize[0] + Config.zoom); // +buffer
			jqTextarea.height(adjustedToSize[1] + Config.zoom * 0.1); // +buffer
		}

		var jqWrap = $("<div>");
		var jqTextarea = $("<textarea>").appendTo(jqWrap);
		var jqDash = $("<div>").appendTo(jqWrap);
		var jqOverlay = $("<div>").appendTo(jqWrap);
		jqWrap.addClass('wrap');
		jqDash.addClass('dash');
		jqTextarea.text( text );
		jqTextarea.addClass('editable');
		jqOverlay.addClass('overlay');

		jqWrap.appendTo(this.overlayTextContainer);

		var obj = {
			jqWrap: jqWrap,
			jqEditable: jqTextarea,
			jqDash: jqDash,
			jqOverlay: jqOverlay,
			onResize: updateSize,
			x: x,
			y: y,
			text: text,
			size: size,
			ref: ref
		};

		jqTextarea.bind("keyup keydown change paste", function() {
			updateSize();
		});

		jqTextarea.bind("change focusout", function() {
			Event.send('toolTextChange', obj);
		});

		updateSize(); // initial measure

		RenderState.textNodes.push(obj);

		this.setDirty(2); // text dirty

		return obj;
	}

	this.overlayTextRemove = function(obj)
	{
		var idx = RenderState.textNodes.indexOf(obj);
		if(idx != -1)
		{
			obj.jqWrap.remove();
			RenderState.textNodes.splice(idx, 1);
		}
		else
		{
			console.log("Cannot delete text node ", obj);
		}

		this.setDirty(2); // text dirty
	}

	this.overlayTextUpdate = function(forceMeasurement)
	{
		forceMeasurement = forceMeasurement || false;

		var ox = RenderState.viewOffset[0], oy = RenderState.viewOffset[1];
		var changedView = RenderState.dirtyFlags[3];
		var changedZoom = RenderState.dirtyFlags[4];
		if(RenderState.dirtyFlags[2]) changedView = changedZoom = true; // actually change all

		for(var i = 0; i < RenderState.textNodes.length; i++)
		{
			var overlay = RenderState.textNodes[i];
			var padding =  10; // -10px for padding
			var selected = board.storage.isSelected(overlay.ref);
			var textSize = overlay.size ? overlay.size * Config.zoom : Config.zoom;
			var offset = null;

			if(selected && RenderState.selectionOffset)
			{
				offset = RenderState.selectionOffset;
			}
			else
			{
				offset = zeroOffset;
			}

			if(changedView || changedZoom)
			{
				overlay.jqWrap.css('top', ((overlay.y + offset[1] - (textSize / Config.zoom / 2)) * Config.zoom + oy) - padding + 'px');
				overlay.jqWrap.css('left', ((overlay.x + offset[0]) * Config.zoom + ox) + 'px');
			}

			if(changedZoom)
			{
				overlay.jqEditable.css('font-size', textSize );
				overlay.jqEditable.css('line-height', textSize + 'px');

				var dashSize = textSize / 3;
				overlay.jqDash.width(dashSize);
				overlay.jqDash.height(dashSize);
			
				overlay.jqDash.css('top', textSize / 2 - dashSize / 2 + padding );
				overlay.jqDash.css('left', -dashSize / 2);
			}

			overlay.jqWrap.toggleClass('selected', selected);
			overlay.jqWrap.toggleClass('disabled', !RenderState.textNodesActive);
			overlay.jqEditable.prop('disabled', !RenderState.textNodesActive);

			if(changedZoom || forceMeasurement)
			{
				overlay.onResize();
			}
		}
	}

	this.overlayTextSetFloating = function(items)
	{
		this.overlayTextUnsetFloating();
		RenderState.textNodesFloating = [];

		for(var i = 0; i < items.length; i++)
		{
			var item = items[i];
			RenderState.textNodesFloating.push(  this.overlayTextAdd(item.geo[0], item.geo[1], item.text, item.size, item)  );
		}
	}

	this.overlayTextUnsetFloating = function()
	{
		if(RenderState.textNodesFloating != null)
		{
			while(RenderState.textNodesFloating.length > 0)
			{
				var item = RenderState.textNodesFloating.pop();
				this.overlayTextRemove(item);
			}

			RenderState.textNodesFloating = null;
		}
	}

	Event.on('setTool', function(id) {
		{
			var old = RenderState.textNodesActive;
			RenderState.textNodesActive = (id == 7);

			if(RenderState.textNodesActive != old) that.setDirty(2); // text dirty
		}		
	});

	Event.on('fontLoaded', function() {
		Event.send('clearFontSizeCache');
		that.overlayTextUpdate(true);
	});

	Event.on('editorVisible', function() {
		Event.send('clearFontSizeCache');
		that.overlayTextUpdate(true);
	});

	// ------------------------------------- stuff
	this.logicTicks = function()
	{
		if(system.getMode() == 1) // is in simulator mode?
		{
			system.simulator.ticks();
		}
	}

	this.getVisibleQuadsFromRect = function(rect)
	{
		var ret = [];
		var qRect = [ ~~(rect[0] / Config.quadSize), ~~(rect[1] / Config.quadSize),
					  ~~(rect[2] / Config.quadSize), ~~(rect[3] / Config.quadSize) ];

		for(var y = qRect[1]; y <= qRect[3]; y++)
		{
			for(var x = qRect[0]; x <= qRect[2]; x++)
			{
				ret.push(board.storage.getQuad(x, y));
			}
		}
				
		return ret;
	}

	// ------------------------------------- construct
	this.reset(); // todo: don't reset here. let's wait for initial board load
}