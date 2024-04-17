function MapRenderer(renderer, system, board)
{
	this.canvasSteps = [];
	this.canvasFirst = null;
	this.canvasLast = null;
	this.jqParent = null;
	//this.jqCanvas = null;
	this.jqMapCurtains = null;


	this.init = function()
	{}

	this.reset = function()
	{
		this.jqParent = null;
		//this.jqCanvas = [];
		this.jqMapCurtains = [];

		// add canvas steps
		for(var i = 0; i < this.canvasSteps; i++)
		{
			ctx.canvas.width = ctx.canvas.width; // fast clear whole canvas
		}
	}

	this.setupDom = function(jqParent)
	{
		this.jqParent = jqParent;

		var initCanvas = $('<canvas>')[0];
		initCanvas.width = Config.minMapResolution;
		initCanvas.height = Config.minMapResolution;
		var ctx = initCanvas.getContext('2d');
		this.canvasSteps.push(ctx);
		//this.jqCanvas.push(initCanvas);
		this.jqParent.prepend( initCanvas );

		this.canvasFirst = this.canvasLast = initCanvas;

		// add curtains
		for(var i = 0; i < 4; i++)
		{
			this.jqMapCurtains[i] = $('<div>').addClass('curtain');
			this.jqMapCurtains[i].appendTo(jqParent);
			this.jqMapCurtains[i].css('top', 0);
			this.jqMapCurtains[i].css('left', 0);
		}

		this.updateLayers(1);
	}

	// --------------------------------------- render logic ------------------------------------------
	this.draw = function()
	{
		if(logicApp.system.getMode() == 0) // editor mode?
		{
			if(RenderState.dirtyMapAll)
			{
				this.drawAll();

				RenderState.dirtyMapAll = false;
				RenderState.dirtyMapQuads = [];

				this.scaleDownFromTopLayer();
				this.updateLayout();
			}
			else
			{
				var mapQuadSize = (Config.quadSize * Config.mapZoom);

				while(RenderState.dirtyMapQuads.length > 0)
				{
					var quad = RenderState.dirtyMapQuads.pop();
					var x = quad.pos[0] * mapQuadSize;
					var y = quad.pos[1] * mapQuadSize;
					this.drawMapQuad(quad, x, y);
				}

				var anyThingDirtyExceptMove = RenderState.dirtyFlags[0] || RenderState.dirtyFlags[1] || RenderState.dirtyFlags[2] || RenderState.dirtyFlags[4];

				if(anyThingDirtyExceptMove)
				{
					this.scaleDownFromTopLayer();
				}
				
				if(RenderState.dirtyFlags[3] || RenderState.dirtyFlags[4])
				{
					this.updateLayout();
				}
			}
		}
		else // simulation mode
		{
			if(RenderState.dirtyMapAll) // initially in this mode?
			{
				this.drawAll();
				
				RenderState.dirtyMapAll = false;
				RenderState.dirtyMapQuads = [];

				this.scaleDownFromTopLayer();
				this.updateLayout();
			}

			if(RenderState.dirtyFlags[3] || RenderState.dirtyFlags[4])
			{
				this.updateLayout();
			}
		}
	
	}

	// flush top layer and draw everything again
	this.drawAll = function()
	{
		// clear all
		this.canvasFirst.canvas.width = this.canvasFirst.canvas.width;

		// draw everything again (not diodes, they're to small)
		drawWires(board, board.storage.wiresGlo, Config.mapZoom, this.canvasFirst, 1);
		drawElements(board, board.storage.elementsGlo, Config.mapZoom, this.canvasFirst, 1);
	}

	// draw a single quad
	this.drawMapQuad = function(quad, x, y)
	{
		// clear
		this.canvasFirst.clearRect(x, y, (Config.quadSize * Config.mapZoom), (Config.quadSize * Config.mapZoom));
		
		// draw
		var visibleWires = [];
		var visibleElements = [];
		//var visibleDiodes = [];
		
		// wires
		for(var d = 0; d < 2; d++)
		{
			for(var i = 0; i < quad.wires[d].length; i++)
			{
				var wire = quad.wires[d][i];
				if(visibleWires.indexOf(wire) == -1) visibleWires.push(wire);
			}
		}
		
		// diodes
		/*for(var i = 0; i < quad.diodes.length; i++)
		{
			var diode = quad.diodes[i];
			if(visibleDiodes.indexOf(diode) == -1) visibleDiodes.push(diode);
		}*/
	
		// elements
		for(var i = 0; i < quad.elements.length; i++)
		{
			var element = quad.elements[i];
			if(visibleElements.indexOf(element) == -1) visibleElements.push(element);
		}

		drawWires(board, visibleWires, Config.mapZoom, this.canvasFirst, 1);
		drawElements(board, visibleElements, Config.mapZoom, this.canvasFirst, 1);
	}

	// copies current map to a given canvas with specific size
	this.renderPreview = function(ctx, size)
	{
		var mapGridPoints = this.canvasFirst.canvas.width / Config.mapZoom;
		var boardSize = RenderState.boardSize.slice();
		var minBoardSize = 16;
		
		if(boardSize[0] < minBoardSize) boardSize[0] = minBoardSize;
		if(boardSize[1] < minBoardSize) boardSize[1] = minBoardSize;

		var usageCanvas = [ boardSize[0] / mapGridPoints, boardSize[1] / mapGridPoints ];
		var zoomToFit = 1 / Math.max(usageCanvas[0], usageCanvas[1]); // factor to fill out a power-of-2 canvas with current usage

		// search for canvas with specific size
		var bestId = 0;
		var bestScale = 0;
		
		for(var i = 0; i < this.canvasSteps.length; i++)
		{
			var drawSize = this.canvasSteps[i].canvas.width * zoomToFit;
			var scaleForThisStep = size / this.canvasSteps[i].canvas.width;

			if(scaleForThisStep > 1) // have to upscale for this step? break and use bestHit!
			{
				if(i == 0) bestScale = scaleForThisStep;
				break;
			} 

			bestId = i; // use this
			bestScale = scaleForThisStep;
		}

		// copy
		var srcCanvas = this.canvasSteps[bestId].canvas;

		ctx.drawImage(srcCanvas, 0, 0, srcCanvas.width * bestScale * zoomToFit, srcCanvas.width * bestScale * zoomToFit);
	}

	// add or removes canvas layers
	this.updateLayers = function(count)
	{
		var curCount = this.canvasSteps.length;

		var addCount = count - curCount;
		var removeCount = addCount * -1;

		if(addCount > 0)
		{
			var firstCanvasSize = this.canvasFirst.canvas.width;
			var initPow = Math.log(firstCanvasSize) / Math.log(2);

			for(var i = 0; i < addCount; i++)
			{
				var size = Math.pow(2, initPow + i + 1);
				var jq = $('<canvas>');
				var canvas = jq[0];
				canvas.width = size;
				canvas.height = size;
				var ctx = canvas.getContext('2d');
				this.canvasSteps.unshift(ctx);
				//this.jqCanvas.unshift(jq);

				this.jqParent.prepend( canvas );

				// todo draw preview layer on this (currently this is solved by setting dirtyMapAll)
			}

			RenderState.dirtyMapAll = true;
		}
		else(removeCount > 0)
		{
			for(var i = 0; i < removeCount; i++)
			{
				this.canvasSteps.shift();
				//this.jqCanvas.shift();
			}

			RenderState.dirtyMapAll = true;
		}

		this.canvasFirst = this.canvasSteps[0];
		this.canvasLast = this.canvasSteps[this.canvasSteps.length - 1];

		/*for(var n = 0; n < this.canvasSteps.length; n++)
		{
			console.log( n, this.canvasSteps[n].canvas.width );
		}

		console.log("###############################");*/
	}

	// update DOM (canvas and curtains)
	this.updateLayout = function()
	{
		var mapGridPoints = this.canvasFirst.canvas.width / Config.mapZoom;

		// calc usages
		var usageCanvas = [ RenderState.boardSize[0] / mapGridPoints, RenderState.boardSize[1] / mapGridPoints ];
		var usageViewOffset = [
			(-RenderState.viewOffset[0] / Config.zoom) / mapGridPoints,
			(-RenderState.viewOffset[1] / Config.zoom) / mapGridPoints
		];
		var usageViewSize = [
			(RenderState.viewSize[0] / Config.zoom) / mapGridPoints,
			(RenderState.viewSize[1] / Config.zoom) / mapGridPoints
		];

		var usageTotal = [
			Math.max(usageCanvas[0], usageViewOffset[0] + usageViewSize[0]),
			Math.max(usageCanvas[1], usageViewOffset[1] + usageViewSize[1])
		];

		// find canvas and zoom
		var mapZoom = Math.max(usageTotal[0], usageTotal[1]);
		var firstCanvasId = this.canvasSteps.length - 1;
		var firstCanvas = this.canvasSteps[firstCanvasId].canvas;
		var firstCanvasSize = firstCanvas.width;
		var firstCanvasZoom = firstCanvasSize / (Config.maxMapEdge / mapZoom);

		var powShift = ~~(Math.log( firstCanvasZoom ) / Math.log(2) - 0.5);

		var realCanvasId = firstCanvasId + powShift;
		if(realCanvasId < 0) realCanvasId = 0;
		if(realCanvasId >= this.canvasSteps.length) realCanvasId = this.canvasSteps.length - 1;

		var realCanvas = this.canvasSteps[realCanvasId].canvas;
		var realCanvasSize = realCanvas.width;
		//console.log('Active size: ', realCanvasSize, powShift, realCanvasSize / (Config.maxMapEdge / mapZoom));

		var viewPortFactor = Config.maxMapEdge / mapZoom;

		this.jqParent.find('canvas').hide();
		$(realCanvas).width(Config.maxMapEdge / mapZoom);
		$(realCanvas).show();

		// set map frame
		var width = Config.maxMapEdge * usageTotal[0] / mapZoom;
		var height = Config.maxMapEdge * usageTotal[1] / mapZoom;
		this.jqParent.width(width);
		this.jqParent.height(height);

		// calculate viewport
		var viewportStart = [usageViewOffset[0], usageViewOffset[1]];
		var viewportEnd = [usageViewOffset[0] + usageViewSize[0], usageViewOffset[1] + usageViewSize[1]];

		// set curtains

		// top/bottom
		this.jqMapCurtains[0] // top
			.css('width', width)
			.css('height', viewportStart[1] * viewPortFactor);
		this.jqMapCurtains[2] // bottom
			.css('width', width)
			.css('height', (1 - viewportEnd[1]) * viewPortFactor)
			.css('top', viewportEnd[1] * viewPortFactor);

		// right/left
		this.jqMapCurtains[3] // right
			.css('width', viewportStart[0] * viewPortFactor)
			.css('height', (viewportEnd[1] - viewportStart[1]) * viewPortFactor)
			.css('top', viewportStart[1] * viewPortFactor);
		this.jqMapCurtains[1] // left
			.css('width', (1 - viewportEnd[0]) * viewPortFactor)
			.css('height', (viewportEnd[1] - viewportStart[1]) * viewPortFactor)
			.css('top', viewportStart[1] * viewPortFactor)
			.css('left', viewportEnd[0] * viewPortFactor);
	}

	this.scaleDownFromTopLayer = function()
	{
		for(var i = 0; i < this.canvasSteps.length - 1; i++)
		{
			var thisCtx = this.canvasSteps[i];
			var nextCtx = this.canvasSteps[i + 1];
			var size = thisCtx.canvas.width;

			nextCtx.canvas.width = nextCtx.canvas.width; // clear next
			nextCtx.drawImage(thisCtx.canvas, 0, 0, size / 2, size / 2); // draw on next
		}
	}

	this.resizeBoard = function()
	{
		var update = false;
		var maxBoardSize = Math.max( RenderState.boardSize[0], RenderState.boardSize[1] );
		var mapPixelSize = maxBoardSize * Config.mapZoom;

		var layers = Math.ceil(Math.log(mapPixelSize) / Math.log(2)) - Math.ceil(Math.log(Config.minMapResolution) / Math.log(2)) + 1;
		if(layers < 2) layers = 2;

		if(this.canvasSteps.length != layers)
		{
			update = true;
		}

		if(update) // update minimap size?
		{
			this.updateLayers(layers);
		}
	}

	this.init();
}