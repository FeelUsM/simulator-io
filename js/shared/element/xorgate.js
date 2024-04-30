"use strict";

function XorGate(arg)
{
	this.initGate(arg);
	
	this.label = "=1";

	this.name = {en:"XOR Gate",ru:"Исключающее ИЛИ (XOR)"};
	this.description = {
		en:"Output is only HIGH (1) if an even count of inputs is HIGH (1).",
		ru:"Выдаёт единицу (1, HIGH) только если нечётное количество входов равны единице (1, HIGH).",
	};
}

XorGate.prototype = Object.create(Gate.prototype);

XorGate.prototype.logicOperator = function(input)
{
	if(input.length < 2) console.error("ERROR\tGate with less than two inputs.");
	
	var result = false;
	
	for(var i = 0; i < input.length; i++)
	{
		result = !!(result ^ input[i]);
	}
	
	return result;
}