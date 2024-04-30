"use strict";

function Element()
{
}

Element.prototype.init = function(size, connectors, arg, sides)
{
	if(size == undefined || size == null)
	{
		console.error("ERROR\tElement size not specified");
		return;
	}
	
	if(connectors == undefined || connectors == null)
	{
		console.error("ERROR\tElement connectors are not specified");
		return;
	}

	this.size = size;
	this.sides = sides ||[false, false, false, false];
	this.connectors = connectors;
	this.metricsBox = null;
	this.metricsBoxSize = -1;
	this.arg = arg;
	this.dir = -1;
	this.label = "";

	this.name = "";
	this.description = "";
	
	// construct
	this.setRot(arg.dir||0);
	this.connectorsPerSide = this.getConnectorStats();
}

Element.prototype.getName = function() { return this.name; }
Element.prototype.getDescription = function() { return this.description; }

// simulator: logic tick -> overwrite
Element.prototype.onTick = function(simulator)
{
}

// simulator: on reset -> overwrite
Element.prototype.onReset = function(mode)
{
}

// simulator: on user clicked on element -> overwrite
Element.prototype.onClick = function(simulator)
{
}

// simulator: set power on connector
Element.prototype.setPower = function(simulator, i, v)
{
	var con = this.connectors[i];
	if(con.negated) v = !v;
	var change = (con.power != v);

	if(con.type != 1)
	{
		console.error("ERROR\tThis is not an output connector");
		return;
	}
	
	con.power = v;
	
	if(change && con.group != null)
	{
		var newCount = con.group.powerCount + (v ? 1 : -1);
		var powerChange = ((con.group.powerCount == 0) != (newCount == 0));
		con.group.powerCount = newCount;
		simulator.addDirtyGroup(con.group, powerChange);
	}
}

// simulator: set power on connector
Element.prototype.getPower = function(i)
{
	var con = this.connectors[i];
	if(con.type != 0)
	{
		console.error("ERROR\tThis is not an input connector");
		return;
	}
	
	var power = con.power;
	if(con.negated) power = !power;
	
	return power;
}

// returns connector from relative position
Element.prototype.getConnector = function(p)
{
	for(var i = 0; i < this.connectors.length; i++)
	{
		var con = this.connectors[i];		
		if(con.pos[0] == p[0] && con.pos[1] == p[1]) return this.connectors[i];		
	}
	
	return null;
}

// returns the count of connectors per side
Element.prototype.getConnectorStats = function()
{
	var ret = [0, 0, 0, 0];
	
	for(var i = 0; i < this.connectors.length; i++)
	{
		var con = this.connectors[i];	
		if(con != 4) ret[con.dir]++;
	}
	
	return ret;
}

Element.prototype.setRot = function(dir)
{
	if(dir < 0 || dir > 3) console.error("ERROR\tInvalid rotation");
	if(this.dir != -1) console.error("ERROR\tAlready rotated");
		
	this.dir = dir;
	var mirror = false;
	var switchXY = false;

	switch(dir)
	{
		case 1:
			switchXY = true;
			this.sides = [this.sides[3], this.sides[0], this.sides[1], this.sides[2]];
			break;
		case 2:
			mirror = true;
			this.sides = [this.sides[2], this.sides[3], this.sides[0], this.sides[1]];
			break;
		case 3:
			switchXY = true;
			mirror = true;
			this.sides = [this.sides[1], this.sides[2], this.sides[3], this.sides[0]];
			break;
	}

	// transform connectors
	for(var i = 0; i < this.connectors.length; i++)
	{
		var con = this.connectors[i];
		var mirrorHor = mirror;
		var mirrorVer = mirror;

		if( switchXY ) mirrorVer = !mirrorVer;
		
		if(mirrorHor)
		{
			con.pos = [ this.size[0] - con.pos[0] - 1, con.pos[1] ];
		}

		if(mirrorVer)
		{
			con.pos = [ con.pos[0] , this.size[1] - con.pos[1] - 1 ];
		}
		
		if(switchXY)
		{
			con.pos = [ con.pos[1], con.pos[0] ];
		}
				
		// transform direction
		if(con.dir != 4)
		{
			con.dir = (con.dir + dir) % 4;
		}
	}
	
	// transform size
	if(switchXY)
	{
		this.size = [ this.size[1], this.size[0] ];
	}
}

Element.prototype.exportArgs = function()
{
	var options = ElementStore[this.elementId].options;
	var args = {};
	
	// export all options this element needs	
	for(var i = 0; i < options.length; i++)
	{
		var option = ToolOptionProvider.getOptionByName(options[i]);
		if(option != null)
		{
			if(!!option.arg)
			{
				args[option.arg] = this.arg[option.arg];
			}
		}
		else
		{
			console.error("ERROR\tOption not found", options[i]);
		}
	}
	
	return args;
}

Element.prototype.setNegators = function(negatorList)
{
	for(var i = 0; i < this.connectors.length; i++)
	{
		var state = false;
		if(negatorList.indexOf(i) != -1) state = true;
		
		this.connectors[i].negated = state;
	}
}

Element.prototype.getNegators = function()
{
	var list = [];
	
	for(var i = 0; i < this.connectors.length; i++)
	{
		if(this.connectors[i].negated) list.push(i);
	}
	
	return list;
}

Element.prototype.getBoxMetrics = function(s)
{
	var halfS = s * 0.5;
	var side = [];
	for(var i = 0; i < 4; i++)
	{
		side[i] = (this.connectorsPerSide[i] > 0 || this.sides[i]) ? 1 : 0;
	}
	
	// init with edges
	var startX = side[3] * halfS;
	var startY = side[0] * halfS;
	var width = (2 - side[3] - side[1]) * halfS;
	var height = (2 - side[0] - side[2]) * halfS;
	
	// add offsets (to hide grid points and to have a margin between elements) (x/y adds, weight/height offset are getting subtracted from box)
	var offsetX = 1 - side[3];
	var offsetY = 1 - side[0];
	var offsetWidth = offsetX - side[1];
	var offsetHeight = offsetY - side[0];
	startX += offsetX;
	startY += offsetY;
	width -= offsetWidth;
	height -= offsetHeight;
		
	// add actual size
	width += (this.size[0] - 1) * s;
	height += (this.size[1] - 1) * s;
	
	return [startX, startY, width, height];
}

// just returns the relative position of the last calculated box metric. parameters are optional
Element.prototype.getBoxCenter = function(offsetX, offsetY)
{
	if(this.metricsBox == null)
	{
		console.error("ERROR\tBox metrics not calculated yet");
		return;
	}
	
	offsetX = offsetX || 0;
	offsetY = offsetY || 0;
	
	var halfW = this.metricsBox[2] / 2;
	var halfH = this.metricsBox[3] / 2;
	
	return [ this.metricsBox[0] + halfW + offsetX, this.metricsBox[1] + halfH + offsetY ];
}

Element.prototype.mapPoint = function(p)
{
	switch(this.dir)
		{
			case 0: return [p[0], p[1]];
			case 1: return [p[1], p[0]];
			case 2: return [this.size[0] - p[0], this.size[1] - p[1]];
			case 3: return [this.size[0] - p[1], this.size[1] - p[0]];
		}
}

// returns rgb color value by highlight state
Element.prototype.getHighlightColor = function(highlight)
{
	switch(highlight)
	{
		case 0: return Config.colNormal;
		case 1: return Config.colSelected;
		case 2: return Config.colInvalidSelection;
	}

	console.error("ERROR\tInvalid highlight level");
}

Element.prototype.drawConnectors = function(ctx, x, y, s, renderType, highlight)
{
	if(renderType == 1) return; // don't draw in map mode

	var halfS = s * 0.5;
	var nearHalfS = s * 0.35;
	
	for(var i = 0; i < this.connectors.length; i++)
	{
		var con = this.connectors[i];
		if(con.dir == 4) continue; // don't draw middle connectors
		var start = [ x + con.pos[0] * s + halfS + 0.5, y + con.pos[1] * s + halfS + 0.5 ];
		var end = start.slice();
		var rel = [0, 0];

		switch(con.dir)
		{
			case 0: rel[1]--; break;
			case 1: rel[0]++; break;
			case 2: rel[1]++; break;
			case 3: rel[0]--; break;
		}
		
		end[0] += rel[0] * (nearHalfS - 1);
		end[1] += rel[1] * (nearHalfS - 1);
		
		ctx.beginPath();
		ctx.moveTo(start[0], start[1]);
		ctx.lineTo(end[0], end[1]);
		ctx.strokeStyle = this.getHighlightColor(highlight);
		ctx.lineWidth = con.power ? 3 : 1;
		ctx.stroke();

		if(con.negated)
		{
			var radius = s / 6;
			var neg = start.slice();
			neg[0] += rel[0] * radius;
			neg[1] += rel[1] * radius;
		
			ctx.beginPath();
			ctx.arc(neg[0], neg[1], radius, 0, 2 * Math.PI, false);
			ctx.fillStyle = Config.colNegatorInner;
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.strokeStyle = Config.colNegatorOuter;
			ctx.stroke();
		}

		if(!!con.text)
		{
			var textSize = con.textSize || 1;
			var textPos = start.slice();
			if(con.dir == 1 || con.dir == 3) // left/right
			{
				textPos[0] -= rel[0] * s * 0.1;
				textPos[1] -= rel[1] * s * 0.1;
			}
			else // middle
			{
				textPos[0] -= rel[0] * s * 0.4;
				textPos[1] -= rel[1] * s * 0.4;
			}
			
			ctx.font = (s / 1.5 * textSize) + 'px ' + Config.fontElementText;
			ctx.fillStyle = this.getHighlightColor(highlight);
			ctx.textBaseline = 'middle';
			
			ctx.textAlign = 'center';
			if(con.dir == 1) ctx.textAlign = 'end';
			if(con.dir == 3) ctx.textAlign = 'start';
						
			//if(con.text.length > 1) console.error("ERROR\tConnector text too long.");
			
			ctx.fillText(con.text, textPos[0], textPos[1]);
		}
		
		if(!!con.clock)
		{
			var peak = start.slice();
			var a = start.slice();
			var b = start.slice();
			peak[0] -= rel[0] * s * 0.5;
			peak[1] -= rel[1] * s * 0.5;
			a[0] += rel[1] * s * 0.2;
			a[1] += rel[0] * s * 0.2;
			b[0] -= rel[1] * s * 0.2;
			b[1] -= rel[0] * s * 0.2;
		
			ctx.beginPath();
			ctx.moveTo(a[0], a[1]);
			ctx.lineTo(peak[0], peak[1]);
			ctx.lineTo(b[0], b[1]);
			
			ctx.strokeStyle = Config.colElementText;
			ctx.lineWidth = 1;
			ctx.stroke();
		}
	}
}

Element.prototype.drawCenterText = function(ctx, x, y, s, renderType, highlight, text)
{
	if(renderType != 1)
	{
		var center = this.getBoxCenter(0, 0);
		ctx.font = (s) + 'px ' + Config.fontElementText;
		ctx.fillStyle = this.getHighlightColor(highlight);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, x + center[0], y + center[1]);
	}
}

Element.prototype.drawText = function(ctx, x, y, s, renderType, highlight, text, pos)
{
	if(renderType != 1)
	{
		var mappedPos = this.mapPoint(pos);
		ctx.font = (s) + 'px ' + Config.fontElementText;
		ctx.fillStyle = this.getHighlightColor(highlight);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, x + mappedPos[0] * s, y + mappedPos[1] * s);
	}
}

Element.prototype.drawCommonBox = function(ctx, x, y, s, renderType, highlight)
{
	if(this.metricsBoxSize != s)
	{
		this.metricsBox = this.getBoxMetrics(s);
		this.metricsBoxSize = s;
	}

	if(renderType != 1)
	{
		ctx.strokeStyle = this.getHighlightColor(highlight);
		ctx.lineWidth = 1;
		ctx.strokeRect(x + this.metricsBox[0] + 0.5, y + this.metricsBox[1] + 0.5, this.metricsBox[2] - 1, this.metricsBox[3] - 1);
		
		ctx.fillStyle = Config.colElementBg;
		ctx.fillRect(x + this.metricsBox[0] + 1, y + this.metricsBox[1] + 1, this.metricsBox[2] - 2, this.metricsBox[3] - 2);
	}
	else
	{
		ctx.fillStyle = Config.colElementBgMap;
		ctx.fillRect(x + this.metricsBox[0], y + this.metricsBox[1], this.metricsBox[2], this.metricsBox[3]);
	}	
}

// draw line on grid (will rotate if necessary), you have to begin and end path before
Element.prototype.drawLine = function(ctx, x, y, s, renderType, highlight, start, end)
{
	// calculate offset to have a clear line
	var offset = [0, 0];
	if(start[1] == end[1]) // horizontal
	{
		if(this.dir == 0 || this.dir == 2)
		{
			offset[1] = +0.5;
		}
		else
		{
			offset[0] = +0.5;
		}
	}
	else
	{
		if(this.dir == 0 || this.dir == 2)
		{
			offset[0] = +0.5;
		}
		else
		{
			offset[1] = +0.5;
		}
	}
	

	var p1 = this.mapPoint(start);
	var p2 = this.mapPoint(end);
	ctx.moveTo(x + p1[0] * s + offset[0], y + p1[1] * s + offset[1]);
	ctx.lineTo(x + p2[0] * s + offset[0], y + p2[1] * s + offset[1]);
}

Element.prototype.renderTo = function(ctx, x, y, s, renderType, highlight)
{
	this.drawCommonBox(ctx, x, y, s, renderType, highlight);
	this.drawConnectors(ctx, x, y, s, renderType, highlight);

	if(this.label != "")
	{
		this.drawCenterText(ctx, x, y, s, renderType, highlight, this.label);
	}	
}