"use strict";

function BufferGate(arg)
{
	// connectors
	var connectors = [
		{pos: [0, 0], dir: 3, type: 0, locked: true},
		{pos: [2, 0], dir: 1, type: 1, locked: true, text: "1"},
	];
	
	// constructor
	this.init([3,1], connectors, arg);

	this.name = "Buffer Gate";
	this.description = "Output is equal to input, but delayed 1 simulation tick. Can help to avoid hazards.";
}

BufferGate.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
BufferGate.prototype.onReset = function(mode)
{
}

BufferGate.prototype.onTick = function(simulator)
{
	this.setPower(simulator, 1, this.getPower(0));
}