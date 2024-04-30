"use strict";

function ElementHalfAdder(arg)
{
	// connectors
	var connectors = [
		{pos: [0, 0], dir: 3, type: 0},
		{pos: [0, 2], dir: 3, type: 0},
		{pos: [3, 0], dir: 1, type: 1, text: 'S'},
		{pos: [3, 2], dir: 1, type: 1, text: 'C'},
	];
	
	// constructor
	this.init([4,3], connectors, arg);

	// ui
	this.label = "HA";

	this.name = {en:"Half adder",ru:"Полусумматор"};
	this.description = {
		en:"Adds two one-bit numbers.",
		ru:"Складывает два одно-битных числа"
	};
}

ElementHalfAdder.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementHalfAdder.prototype.onReset = function(mode)
{
}

ElementHalfAdder.prototype.onTick = function(simulator)
{
	var a = this.getPower(0);
	var b = this.getPower(1);
	var count = (a + b);
	this.setPower(simulator, 2, (count & 1));
	this.setPower(simulator, 3, ((count >> 1) & 1));
}