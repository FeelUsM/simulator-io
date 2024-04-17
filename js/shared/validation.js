var Validation = {
	Rules: {
		NickLengthMin: 5,
		NickLengthMax: 15,
		NickChars: /^[A-Za-z0-9\-_\.]+$/
	},
	
	AlreadyInUse: {
		Nick: [],
		Mail: []
	},
	
	RegisterSet: [
		{
			src: '#registerFormName',
			func: 'Nick',
			hintText: ['', 'Username must be at least 5 characters', 'Username too long', 'Username contains invalid characters', 'Username is already used']
		},
		
		{
			src: '#registerFormMail',
			func: 'Mail',
			hintText: ['', 'Invalid email address', 'Email address already in use']
		},
		
		{
			src: '#registerFormPass',
			func: 'Pass',
			hintText: ['', 'Password must be at least 8 characters', 'Use at least one special character or number in your password']
		}
	],
	
	AddUnusable: function(type, value)
	{
		Validation.AlreadyInUse[type].push(value.toLowerCase());
	},
	
	isUsable: function(type, value)
	{
		return Validation.AlreadyInUse[type].indexOf(value.toLowerCase()) == -1;
	},

	// validators
	Nick: function(str)
	{
		var ret = {valid:true, hint: 0};
		
		if(str.length < Validation.Rules.NickLengthMin)
		{
			ret.valid = false;
			ret.hint = 1;
		}
		
		if(str.length > Validation.Rules.NickLengthMax)
		{
			ret.valid = false;
			ret.hint = 2;
		}
		
		if(!str.match(Validation.Rules.NickChars))
		{
			ret.valid = false;
			ret.hint = 3;
		}
		
		if(!Validation.isUsable('Nick', str))
		{
			ret.valid = false;
			ret.hint = 4;
		}
		
		return ret;
	},

	Mail: function(str)
	{
		var mailFormat = /^\w+([-+.'!]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
		var ret = {valid:true, hint: 0};

		if(!str.match(mailFormat) || str.length > 50)
		{
			ret.valid = false;
			ret.hint = 1;
		}
		
		if(!Validation.isUsable('Mail', str))
		{
			ret.valid = false;
			ret.hint = 2;
		}
		
		return ret;
	},
	
	Pass: function(str)
	{
		var ret = {valid:true, hint: 0};
		
		// check for length
		if(str.length < 8)
		{
			ret.valid = false;
			ret.hint = 1;
			return ret;
		}

		// check for special chars/numbers
		var haveSpecial = false;
		for(var i = 0; i < str.length; i++)
		{
			var code = str.charCodeAt(i);
			if( !((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) ) haveSpecial = true;
		}

		if(!haveSpecial)
		{
			ret.valid = false;
			ret.hint = 2;
			return ret;
		}

		
		return ret;
	},

	BoardTitle: function(str)
	{
		var ret = {valid:true, hint: 0};
		
		if(str.length < 1)
		{
			ret.valid = false;
			ret.hint = 1;
		}

		if(str.length > 128)
		{
			ret.valid = false;
			ret.hint = 2;
		}
		
		return ret;
	}
};