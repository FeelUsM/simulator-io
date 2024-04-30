"use strict";

function ElementFullAdder(arg)
{
	// connectors
	var connectors = [
		{pos: [0, 0], dir: 3, type: 0},
		{pos: [0, 1], dir: 3, type: 0},
		{pos: [0, 2], dir: 3, type: 0},		
		{pos: [3, 0], dir: 1, type: 1, text: 'S'},
		{pos: [3, 2], dir: 1, type: 1, text: 'C'},
	];

	// constructor
	this.init([4,3], connectors, arg);
	
	// ui
	this.label = "FA";

	this.name = {en:"Full adder",ru:"Полный сумматор"};
	this.description = {
		en:"Adds three one-bit numbers.",
		ru:"Складывает три одно-битных числа."
	};
}

ElementFullAdder.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementFullAdder.prototype.onReset = function(mode)
{
}

ElementFullAdder.prototype.onTick = function(simulator)
{
	var a = this.getPower(0);
	var b = this.getPower(1);
	var c = this.getPower(2);
	var count = (a + b + c);
	this.setPower(simulator, 3, (count & 1));
	this.setPower(simulator, 4, ((count >> 1) & 1));
}