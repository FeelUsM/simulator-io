"use strict";

function ElementClock(arg)
{
	// connectors
	var connectors = [
		{pos: [4, 2], dir: 1, type: 1, text: 'C'},
		{pos: [2, 4], dir: 2, type: 0, text: 'Stp', textSize: 0.6},
	];

	
	// member
	this.state = false;
	this.stpValue = false;
	
	// constructor
	this.init([5,5], connectors, arg, [true, true, true, true]);
	
	// ui
	this.label = "CLK";

	this.name = "Clock";
	this.description = "Generates a clock signal. You can control the clocks during an active simulation. Signal edges wait until simulation gets inactive.";
}

ElementClock.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementClock.prototype.onReset = function(mode)
{
	this.state = false;
}

ElementClock.prototype.onTick = function(simulator)
{
	// stop
	var stpValue = this.getPower(1);
	if(stpValue != this.stpValue || stpValue)
	{
		simulator.stopClock();
	}
	this.stpValue = stpValue;

	// update clock signal
	if(simulator.getClockState()) // active ?
	{
		if(simulator.allowTick)
		{
			this.state = !this.state;
			if(this.state == false) simulator.clockTick(); // clock signal went to low -> count tick
		}
	}
	else // inactive?
	{
		this.state = false;
	}

	this.setPower(simulator, 0, this.state);
}