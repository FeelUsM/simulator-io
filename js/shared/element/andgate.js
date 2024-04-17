"use strict";

function AndGate(arg)
{	
	this.initGate(arg);
	
	this.label = "&";

	this.name = "AND Gate";
	this.description = "Output is only HIGH (1) if all inputs are HIGH (1).";
}

AndGate.prototype = Object.create(Gate.prototype);

AndGate.prototype.logicOperator = function(input)
{
	if(input.length < 2) console.log("ERROR\tGate with less than two inputs.");
	
	var result = true;
	
	for(var i = 0; i < input.length; i++)
	{
		result = result && input[i];
	}
	
	return result;
}