"use strict";

function AndGate(arg)
{	
	this.initGate(arg);
	
	this.label = "&";

	this.name = {en:"AND Gate",ru:"И (AND)"};
	this.description = {
		en:"Output is only HIGH (1) if all inputs are HIGH (1).",
		ru:"Выдаёт единицу (1, HIGH) только если все входы равны единице (1, HIGH).",
	};
}

AndGate.prototype = Object.create(Gate.prototype);

AndGate.prototype.logicOperator = function(input)
{
	if(input.length < 2) console.error("ERROR\tGate with less than two inputs.");
	
	var result = true;
	
	for(var i = 0; i < input.length; i++)
	{
		result = result && input[i];
	}
	
	return result;
}