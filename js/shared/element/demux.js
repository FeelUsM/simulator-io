"use strict";

function ElementDemux(arg)
{
	// member
	this.bits = ~~(arg.muxInputSize || 3);

	if(this.bits < 2 || this.bits > 5)
	{
		console.error("ERROR\tInvalid demuxer bits: ", this.bits);
		return;	
	}

	var dataCount = 1 << this.bits;
	var width = this.bits + 2;
	var height = dataCount + 2;

	if(width < 5) width = 5;

	// connectors
	var connectors = [];
	connectors.push( {pos: [0, 1], dir: 3, type: 0, text: ''} );

	// add data connectors
	this.conOffsetData = connectors.length;
	for(var i = 0; i < dataCount; i++)
	{
		connectors.push( {pos: [width - 1, i + 1], dir: 1, type: 1, text: ''+i} );
	}

	// add selector connectors
	this.conOffsetSelector = connectors.length;
	for(var i = 0; i < this.bits; i++)
	{
		connectors.push( {pos: [this.bits - i, 0], dir: 0, type: 0, text: '2' + getSuperscriptString(i) } );
	}
	
	// constructor
	this.init([width, height], connectors, arg, [true, true, true, true]);
	
	this.label = "DEMUX";

	// UI
	this.name = {en:"Demultiplexer",ru:"Демультиплексор"};
	this.description = {
		en:"Selects an output connector by a given address.",
		ru:"По заданному адресу выбирает, какой выходной коннектор будет подключён ко входному."
	};
}

ElementDemux.prototype = Object.create(Element.prototype);

// ----------------------------------------------------------------- LOGIC
ElementDemux.prototype.onReset = function(mode)
{
}

ElementDemux.prototype.onTick = function(simulator)
{
	var outputCount = 1 << this.bits;
	var addr = 0;
	var n = 1;

	var value = this.getPower(0); // read input connector

	// get addr
	for(var i = 0; i < this.bits; i++)
	{
		var state = this.getPower( this.conOffsetSelector + i);

		if(state) addr += n;

		n <<= 1;
	}

	// set output
	for(var i = 0; i < outputCount; i++)
	{
		this.setPower(simulator, this.conOffsetData + i, addr == i && value);
	}
}