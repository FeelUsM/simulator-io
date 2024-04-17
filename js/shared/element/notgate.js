"use strict";

function NotGate(arg)
{
	// connectors
	var connectors = [
		{pos: [0, 0], dir: 3, type: 0, locked: true},
		{pos: [2, 0], dir: 1, type: 1, locked: true, negated: true, text: "1"},
	];
	
	// constructor
	this.init([3,1], connectors, arg);

	this.name = "NOT Gate";
	this.description = "Output is inverted to input.";
}

NotGate.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
NotGate.prototype.onReset = function(mode)
{
}

NotGate.prototype.onTick = function(simulator)
{
	this.setPower(simulator, 1, this.getPower(0));
}