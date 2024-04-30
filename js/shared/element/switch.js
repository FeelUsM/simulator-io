"use strict";

function ElementSwitch(arg)
{
	// connectors
	var connectors = [
		{pos: [0, 0], dir: 4, type: 1},
	];

	// members
	this.value = 0;
	
	// constructor
	this.init([1,1], connectors, arg);

	this.name = {en:"Switch",ru:"переключатель"};
	this.description = {
		en:"Basic input element. Output connector is in the middle of the element. In simulation mode click on it to toggle the output.",
		ru:"Базовый элемент ввода. Крепление провода находится в центре элемента. При клике по нему в режиме симуляции переключает своё состояние."
	};
}

ElementSwitch.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementSwitch.prototype.onReset = function(mode)
{
	this.value = 0;
}

ElementSwitch.prototype.onTick = function(simulator)
{
}

ElementSwitch.prototype.onClick = function(simulator)
{
	this.value = 1 - this.value;
	this.setPower(simulator, 0, this.value ? true : false);
}

// ----------------------------------------------------------------- RENDERING
ElementSwitch.prototype.renderTo = function(ctx, x, y, s, renderType, highlight)
{
	this.drawCommonBox(ctx, x, y, s, renderType, highlight);
	this.drawConnectors(ctx, x, y, s, renderType, highlight);
	this.drawCenterText(ctx, x, y, s * 0.8, renderType, highlight, this.value);
}