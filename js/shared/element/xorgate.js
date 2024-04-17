"use strict";

function XorGate(arg)
{
	this.initGate(arg);
	
	this.label = "=1";

	this.name = "XOR Gate";
	this.description = "Output is only HIGH (1) if an even count of inputs is HIGH (1).";
}

XorGate.prototype = Object.create(Gate.prototype);

XorGate.prototype.logicOperator = function(input)
{
	if(input.length < 2) console.log("ERROR\tGate with less than two inputs.");
	
	var result = false;
	
	for(var i = 0; i < input.length; i++)
	{
		result = !!(result ^ input[i]);
	}
	
	return result;
}