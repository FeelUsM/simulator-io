"use strict";

function ElementFlipFlopD(arg)
{
	// connectors
	var connectors = [
		{pos: [0, 0], dir: 3, type: 0, text: "D"},
		{pos: [0, 2], dir: 3, type: 0, clock: true},
		{pos: [4, 0], dir: 1, type: 1, text: 'Q', locked: true},
		{pos: [4, 2], dir: 1, type: 1, text: '\u0305Q', negated: true, locked: true},
	];
	

	// member
	this.state = false;
	this.clockHigh = false;
	
	// constructor
	this.init([5,3], connectors, arg);
	
	// UI
	this.label = "FF";

	this.name = "D latch";
	this.description = "Can hold a state. Sets Q to D only on falling edge.";
}

ElementFlipFlopD.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementFlipFlopD.prototype.onReset = function(mode)
{
	this.state = false;
	this.clockHigh = false;
}

ElementFlipFlopD.prototype.onTick = function(simulator)
{
	var d = this.getPower(0);
	var clock = this.getPower(1);
	
	if(clock != this.clockHigh && clock == false)
	{
		this.state = d;
	}
	
	this.clockHigh = clock;
	
	this.setPower(simulator, 2, this.state);
	this.setPower(simulator, 3, this.state);
}