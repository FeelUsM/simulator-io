"use strict";

function ElementButton(arg)
{
	// connectors
	var connectors = [
		{pos: [0, 0], dir: 4, type: 1},
	];

	// members
	this.value = 0;
	
	// constructor
	this.init([1,1], connectors, arg);

	this.name = "Button";
	this.description = "Basic input element. Output connector is in the middle of the element. In simulation mode click on it to emit a single pulse.";
}

ElementButton.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementButton.prototype.onReset = function(mode)
{
	this.value = 0;
}

ElementButton.prototype.onTick = function(simulator)
{
	this.setPower(simulator, 0, this.value ? true : false);
	this.value = 0;
}

ElementButton.prototype.onClick = function(simulator)
{
	this.value = 1;
}

// ----------------------------------------------------------------- RENDERING
ElementButton.prototype.renderTo = function(ctx, x, y, s, renderType, highlight)
{
	this.drawCommonBox(ctx, x, y, s, renderType, highlight);
	this.drawConnectors(ctx, x, y, s, renderType, highlight);


	var size = s / 4;
	ctx.fillStyle = this.getHighlightColor(highlight);
	ctx.fillRect(x + s / 2 - size / 2 + 0.5, y + s / 2 - size / 2 + 0.5, size, size);

	//this.drawCenterText(ctx, x, y, s * 0.8, renderType, highlight, this.value);
}