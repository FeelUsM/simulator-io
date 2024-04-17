var Hotkey = new function(){
	var keys = {
		8:  "backspace",
		9:  "tab",
		13: "enter",
		16: "shift",
		17: "ctrl",
		18: "alt",
		19: "pause",
		20: "caps lock",
		27: "esc",
		32: "space",
		33: "page up",
		34: "page down",
		35: "end",
		36: "home",
		37: "left",
		38: "up",
		39: "right",
		40: "down",
		45: "ins",
		46: "del",
		48: "0",
		49: "1",
		50: "2",
		51: "3",
		52: "4",
		53: "5",
		54: "6",
		55: "7",
		56: "8",
		57: "9",
		65: "a",
		66: "b",
		67: "c",
		68: "d",
		69: "e",
		70: "f",
		71: "g",
		72: "h",
		73: "i",
		74: "j",
		75: "k",
		76: "l",
		77: "m",
		78: "n",
		79: "o",
		80: "p",
		81: "q",
		82: "r",
		83: "s",
		84: "t",
		85: "u",
		86: "v",
		87: "w",
		88: "x",
		89: "y",
		90: "z",
		112: "f1",
		113: "f2",
		114: "f3",
		115: "f4",
		116: "f5",
		117: "f6",
		118: "f7",
		119: "f8",
		120: "f9",
		121: "f10",
		122: "f11",
		123: "f12",
		186: ";",
		187: "=",
		188: ",",
		189: "-",
		190: ".",
		191: "/",
		192: "`",
		219: "[",
		220: "\\",
		221: "]",
		222: "'"}
	var registered = [];
	var pressed = [];
	var tags = [];

	this.register = function(shortcut, cb) {
		// parse
		var parts = shortcut.toLowerCase().split('+');
		var obj = {cb: cb, keys: []};
		for(var i = 0; i < parts.length; i++)
		{
			var translated = parts[i].trim();
			if(!translated) console.log("ERROR\tUnknown key: " + parts[i]);
			
			obj.keys.push(translated);
		}
		
		registered.push(obj);
	}

	this.clearDeactivateTags = function()
	{
		tags = [];
	}

	this.changeTags = function(changeTags)
	{
		for(var k in changeTags)
		{
			if(changeTags[k]) // add
			{
				if(tags.indexOf(k) == -1) tags.push(k);
			}
			else // remove
			{
				var idx = tags.indexOf(k);
				tags.splice(idx, 1);
			}
		}
	}

	function isActive()
	{
		if(tags.length > 0) return false;

		var focused = $(':focus').prop('tagName');

		switch(focused)
		{
			case 'TEXTAREA':
			case 'INPUT':
				return false;
		}

		return true;
	}
	
	function isCombinationPressed(keys)
	{
		if(!isActive()) return false;

		for(var i = 0; i < keys.length; i++)
		{
			if(pressed.indexOf(keys[i]) == -1)
			{
				return false;
			}
		}
	
		return true;
	}
	
	function keyup(key)
	{
		for(var i = 0; i < registered.length; i++)
		{
			var item = registered[i];
			if(isCombinationPressed(item.keys))
			{
				item.cb();
				return true;
			}
		}
		
		return false;
	}
	
	function init() {
		$(document).bind('keydown keyup', function(e) {
			var translated = keys[e.keyCode];
			if(e.type == 'keydown')
			{
				if(pressed.indexOf(translated) == -1) pressed.push(translated);
			}
			else
			{
				keyup(translated);
				var idx = pressed.indexOf(translated);
				pressed.splice(idx, 1);
			}
		});
	}
	
	init();
};