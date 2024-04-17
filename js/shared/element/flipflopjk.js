"use strict";

function ElementFlipFlopJK(arg)
{
	// connectors
	var connectors = [
		{pos: [0, 0], dir: 3, type: 0, text: "J"},
		{pos: [0, 1], dir: 3, type: 0, clock: true},
		{pos: [0, 2], dir: 3, type: 0, text: "K"},
		{pos: [4, 0], dir: 1, type: 1, text: 'Q', locked: true},
		{pos: [4, 2], dir: 1, type: 1, text: '\u0305Q', negated: true, locked: true},
	];
	

	// member
	this.state = false;
	this.clockHigh = false;
	
	// constructor
	this.init([5,3], connectors, arg);
	
	// UI
	this.label = "JK";

	this.name = "JK flip-flop";
	this.description = "Can hold a state. Triggers on falling edge. Set J to HIGH (1) to set or K to reset. If both inputs are HIGH (1) output toggles.";
}

ElementFlipFlopJK.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementFlipFlopJK.prototype.onReset = function(mode)
{
	this.state = false;
	this.clockHigh = false;
}

ElementFlipFlopJK.prototype.onTick = function(simulator)
{
	var j = this.getPower(0);
	var k = this.getPower(2);
	var clock = this.getPower(1);
	var q = this.state;	
	
	if(clock != this.clockHigh && clock == false)
	{
		
		// JK logic
		if(j && k)
		{
			q = !q;
		}
		else
		{
			if(j) q = true;
			if(k) q = false;
		}
		
		this.state = q;
	}
	
	this.clockHigh = clock;
	
	this.setPower(simulator, 3, q);
	this.setPower(simulator, 4, q);
}