"use strict";

function ElementMux(arg)
{
	// member
	this.bits = ~~(arg.muxInputSize || 3);

	if(this.bits < 2 || this.bits > 5)
	{
		console.log("ERROR\tInvalid muxer bits: ", this.bits);
		return;	
	}

	var dataCount = 1 << this.bits;
	var width = this.bits + 2;
	var height = dataCount + 2;

	if(width < 5) width = 5;

	// connectors
	var connectors = [];
	connectors.push( {pos: [width - 1, 1], dir: 1, type: 1, text: ''} );

	// add data connectors
	this.conOffsetData = connectors.length;
	for(var i = 0; i < dataCount; i++)
	{
		connectors.push( {pos: [0, i + 1], dir: 3, type: 0, text: ''+i} );
	}

	// add selector connectors
	this.conOffsetSelector = connectors.length;
	for(var i = 0; i < this.bits; i++)
	{
		connectors.push( {pos: [this.bits - i, 0], dir: 0, type: 0, text: '2' + getSuperscriptString(i) } );
	}
	
	// constructor
	this.init([width, height], connectors, arg, [true, true, true, true]);
	
	this.label = "MUX";

	// UI
	this.name = "Multiplexer";
	this.description = "Selects an input signal for output by a given address.";
}

ElementMux.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementMux.prototype.onReset = function(mode)
{
}

ElementMux.prototype.onTick = function(simulator)
{
	var addr = 0;
	var n = 1;

	// get addr
	for(var i = 0; i < this.bits; i++)
	{
		var state = this.getPower( this.conOffsetSelector + i);

		if(state) addr += n;

		n <<= 1;
	}

	// set output
	this.setPower(simulator, 0, this.getPower(this.conOffsetData + addr));
}