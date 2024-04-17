"use strict";

function ElementLed(arg)
{
	// connectors
	var connectors = [
		{pos: [0, 0], dir: 4, type: 0},
	];
	
	// constructor
	this.color = arg.color || '00aa00';
	this.init([1,1], connectors, arg);

	this.name = "LED";
	this.description = "Basic output element. Input connector is in the middle of the element. Lights up if input is HIGH (1).";
}

ElementLed.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementLed.prototype.onReset = function(mode)
{
}

ElementLed.prototype.onTick = function(simulator)
{
}

ElementLed.prototype.onClick = function(simulator)
{
}

// ----------------------------------------------------------------- RENDERING
ElementLed.prototype.renderTo = function(ctx, x, y, s, renderType, highlight)
{
	var color = null;
	if(this.getPower(0) || renderType == 2)
	{	
		color = '#' + this.color;
	}
	else
	{
		var rgb = hexToRGB(this.color);
		for(var i = 0; i < 3; i++)
		{
			rgb[i] = ~~(100 + rgb[i] / 8);
		}
		color = 'rgb(' + rgb.join() + ')';
	}

	var r = s / 2;
	ctx.beginPath();
	ctx.arc(x + r, y + r, r - 1, 0, 2 * Math.PI, false);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.lineWidth = 0.5;
	ctx.strokeStyle = this.getHighlightColor(highlight);
	ctx.stroke();
}