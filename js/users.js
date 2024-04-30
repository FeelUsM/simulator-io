function UserProvider(system, board)
{
	var that = this;
	this.users = [];

	this.reset = function()
	{
		that.users = [];
	}
	
	this.getUserByToken = function(token)
	{
		for(var i = 0; i < that.users.length; i++)
		{
			if(that.users[i].token == token) return that.users[i];
		}
		
		console.error("ERROR\tCannot find user by token: ", token);
		
		return null;
	}
	
	this.getColorById = function(id)
	{
		switch(id)
		{
			case 0: return 'ff0000';
			case 1: return '0000ff';
			case 2: return '00cc00';
			case 3: return 'ffff55';
			case 4: return 'ff8000';
			case 5: return '00f0ff';
			case 6: return '993eff';
			case 7: return 'e7cb96';
		}
		
		return 'ffffff';
	}

	Event.on('userJoinBoard', function(data) {
		that.users.push(data);

		Event.send('userJoinChat', data);
		Event.send('updateUserList');		
	});
	
	Event.on('userLeaveBoard', function(data) {
		Event.send('userLeaveChat', data);
	
		var found = false;
		for(var i = 0; i < that.users.length; i++)
		{
			if(that.users[i].token == data.token)
			{
				that.users.splice(i, 1);
				found = true;
			}
		}
		
		if(!found) console.error("ERROR\tCannot delete old user");
		
		Event.send('updateUserList');
	});
}