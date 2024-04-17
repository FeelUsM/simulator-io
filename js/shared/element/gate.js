"use strict";

function Gate()
{
}

Gate.prototype = Object.create(Element.prototype);

Gate.prototype.initGate = function(arg)
{
	var size = arg.inputSize || 2;
	var connectors = [];
	
	for(var i = 0; i < size; i++)
	{
		connectors.push({pos: [0, i], dir: 3, type: 0});
	}

	connectors.push({pos: [2, 0], dir: 1, type: 1});
	
	this.init([3, size], connectors, arg);
}

Gate.prototype.onTick = function(simulator)
{
	var inputs = [];
	var inputCount = this.connectors.length - 1;
	
	// collect all input values
	for(var i = 0; i < inputCount; i++)
	{
		inputs.push( this.getPower(i) );
	}
	
	this.setPower(simulator, inputCount, this.logicOperator(inputs)); // inputCount is the always the ID of the last connector (=output connector)
}

Gate.prototype.logicOperator = function(n)
{
	console.log("ERROR\tGate logic not implemented");
}