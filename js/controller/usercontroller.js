function UserController()
{
	this.requestedProfileName = null;
}

// prototype
UserController.prototype = Object.create(ControllerBase.prototype);

// implementations
UserController.prototype.getView = function()
{
	return 'user';
}

UserController.prototype.setup = function()
{
	UI.ensure() // ERROR FIX
	var that = this;
	var jqUserPage = $('ul.pages li.page.user');
	//var jqPageNav = jqUserPage.find('.pageNav a');
	
	// --------------------------------------------------------------------------- DOM/Event Initialization
	// init all accordions
	//Accordion.init(jqUserPage.find('.accordion'));

	/*
	// init navigation
	jqPageNav.click(function() {
		var subpage = $(this).data('subpage');
		var action = $(this).data('action');

		if(!!action)
		{
			switch(action)
			{
				case 'logout':
					Backend.logout();
					Pages.go('/');
					break;

				case 'profile':
					Pages.go('/profile');
					break;
			}
		}
		else if(!!subpage)
		{
			Pages.go("/user/" + subpage);
		}
		
		return false;
	});
	
	// handler for profile "edit" button
	jqUserPage.find('.subPage.profile button.editOwnProfile').click(function() {
		Pages.go("/user/editprofile");
	});

	// handler for profile settings form
	jqUserPage.find('.profileView form').submit(function() {
		var submitButton = $(this).find('button.save');
		var showMailValue = $(this).find('input.showMail').is(':checked');

		submitButton.prop('disabled', true);

		Backend.saveProfile({
			showMail: showMailValue
		}, function(result) {
			submitButton.prop('disabled', false);
			if(result)
			{
				Event.send('openMessage', {title: 'Profile', text: 'Profile settings has been updated'});
			}
			else
			{
				Event.send('openMessage', {error: true, title: 'Error', text: 'Could not update profile settings'});
			}
		});

		return false;
	});

	// handler for changePW form
	jqUserPage.find('.changePassword form').submit(function() {
		var pwOld = $(this).find('.passwordOld').val();
		var pwNew = $(this).find('.passwordNew').val();
		
		if(Validation.Pass(pwNew).valid)
		{
			$(this)[0].reset();
			Backend.changePassword(pwOld, pwNew);
		}
		else
		{
			Event.send('openMessage', {error: true, title: 'Error', text: 'Your password is too weak.'});
		}
		
		return false;
	});
	
	*/

	// --------------------------------------------------------------------------- Events
	Event.on('profileResult', function() {
		console.error('not implemented')
		return
		if(!Config.lastRequestedProfile) console.log("ERROR\tProfile result not set in config");

		that.processProfile(Config.lastRequestedProfile);
	});

	Event.on('userBoardsChange', function() {
		that.updateBoards();
	});
	
	Event.on('clickBoardRecord', function(id) {
		Pages.go('/board/' + id);
	});
	
	$('#addBoardButton').click(function() {
		Pages.go('/board');
		/*
		Event.send('openRenameBoard', {
			ctx: null,
			title: '',
			rename: false
		});
		*/
	});
	$('#loadBordsFromFile').click(function(){
		console.log('open dialog "Open File"')
		var input = document.createElement("input");
		input.type = "file";
		input.accept = ".brd";
		input.onchange = function() {
			console.log('file selected')
			var file = input.files[0]
			var reader = new FileReader ();
			reader.onload = function (e) {
				console.log('reading of file is completed')
				try{
					Backend.uploadBoards(JSON.parse(reader.result))
				}
				catch(error){
					Event.send('openMessage', {title: 'Bad File', text: error.message});
				}
				Event.send('loadState', {boardList: true});
				setTimeout(function(){
					Backend._socket.send('boards')
				},0)

			}
			reader.readAsText (file);
		};
		input.click();
	})
	/*
	$('.mailVerificationHint a').click(function(e) {
		e.preventDefault();
		$(this).unbind();
		$('.mailVerificationHint').delay(500).fadeOut(500);
		Backend.resendVerifyMail();
		return false;
	});
	*/
	//if(Config.lastRequestedProfile) this.processProfile(Config.lastRequestedProfile);
	if(Config.boards) this.updateBoards();

	if(mobileAndTabletcheck())
	{
		jqUserPage.find('.mobileHint').show();
	}
}

UserController.prototype.switch = function(args, url)
{
	var evilCharacters = [':', '/', '\\', '[', ']', '(', ')'];

	var urlParts = url.split('/');
	if(urlParts.length < 2) return false;
	
	var superPage = urlParts[0].slice(1);// '?user/boards' -> 'user'
	var subPage = args[0];

	// check for evil characters
	var error = false;
	for(var i = 0; i < evilCharacters.length; i++)
	{
		if(superPage && superPage.indexOf(evilCharacters[i]) != -1) error = true;
		if(subPage && subPage.indexOf(evilCharacters[i]) != -1) error = true;
	}
	if(error)
	{
		Pages.go('error404');
		return;
	}

	// handle profile page
	//if(superPage == 'profile') subPage = 'profile';

	// make subpage visible
	var jqSubPages = $('ul.pages li.page.user li.subPage');
	var jqSubPage = jqSubPages.filter('.' + subPage);
	jqSubPages.hide();
	jqSubPage.show();

	// check if subpage is available
	if(jqSubPage.size() == 0)
	{
		Pages.go('error404');
		return;
	}

	// make title visible
	var title = jqSubPage.attr('title') || '';
	var jqHead = $('ul.pages li.page.user .column1 .head');
	jqHead.toggle(title != '');
	jqHead.find('h1').text(title);
	MetaData.setPageTitle(title);
	
	// update main navi
	updateProfileMeta();

	// some extra stuff for special sites
	if(superPage == 'user' && subPage == 'boards')
	{
		// update board list
		this.updateBoards();
		LoadingBar.done();
	}
	/*
	else if(superPage == 'profile')
	{
		var name;
		if(args.length == 0)
		{
			name = Config.userName;
		}
		else
		{
			name = args[0];
		}

		this.requestedProfileName = name;
		Backend.requestProfile(this.requestedProfileName);
	}*/
	else
	{
		console.error('user pages: ',superPage,subPage)
		LoadingBar.done();
	}

	Event.send('loadState', {boardList: true});
	setTimeout(function(){
		Backend._socket.send('boards')
	},0)
}

UserController.prototype.updateBoards = function()
{
	var boardList = $('li.subPage.boards ul.boards');
	boardList.empty();
	
	if(!Config.boards) return;

	$('#saveAllBordsToFile').click(function(){
		var a = document.createElement("a");
		a.href = 'data:application/xml;charset=utf-8,'+JSON.stringify(Config.boards)
		a.download = 'all-boards.brd'
		a.click()
	})

	$('#boardsSize').text(Math.round(Config.boardsSize/1024)+' kB')
	$('#boardsFreeSpace').text(Math.round(10*1024-Config.boardsSize/1024)+' kB')

	// hint or table?
	$('li.subPage.boards .hint').toggle(Config.boards.length == 0);
	$('li.subPage.boards .boards').toggle(Config.boards.length != 0);

	// sort boards
	var sortedBoards = Config.boards.sort(function(a, b) {
		if(a.time == null && b.time == null)
		{
			if(a.created < b.created) return 1;
			if(a.created > b.created) return -1;
			return 0;
		}

		if(a.time == null && b.time != null) return -1;
		if(b.time == null && a.time != null) return 1;

		if(a.time < b.time) return 1;
		if(a.time > b.time) return -1;
		return 0;
	});

	// render boards
	for(var i = 0; i < sortedBoards.length; i++)
	{
		var boardObj = sortedBoards[i];
		var dateStr = '';
		var previewDataUrl = null;

		// get preview data url
		if(boardObj.previewImage)
		{
			previewDataUrl = boardObj.previewImage //this.getDataUrlFromArrayBuffer(boardObj.previewImage);
		}		

		// get string from last access date
		if(boardObj.time)
		{
			dateStr = new Date(boardObj.time).getRelativeDateString(true, true);
		}
		else
		{
			dateStr = 'Never accessed yet';
		}

		var jqRow = $('<li>').attr('title', '');
		var jqImgWrap  = $('<div>').addClass('imgWrap');
		var jqDivName  = $('<div>').addClass('name').text(boardObj.title+'/'+boardObj.snapshot);
		var jqDivOwner = $('<div>').addClass('owner').text( 'origin: ' + boardObj.parent);
		if(boardObj.parent===undefined){
			jqDivOwner.text('The origin')
			jqDivOwner.attr('style','color:black;font-weight: bold')
		}else{
			[oldName,oldSnap] = boardObj.parent.split('/')
			if(oldName!=boardObj.title || 1+ +oldSnap != +boardObj.snapshot){
				if(boardObj.snapshot!=1)
					jqDivOwner.attr('style','color:red;font-weight: bold')
				else
					jqDivOwner.attr('style','color:black;font-weight: bold')
			}
		}
		var jqDivDate  = $('<div>').addClass('date').text( 'saved ' + dateStr);
		var jqDivCtrl  = $('<div>').addClass('ctrl');

		if(previewDataUrl)
		{
			jqImgWrap.append(  $('<img />').attr('src', previewDataUrl)  );
		}
		else
		{
			jqImgWrap.text('No preview');
		}

		jqRow.data('board-id', boardObj.urlId); // ERROR FIX
		jqRow.data('board-title', boardObj.title);
		jqRow.data('board-snapshot', boardObj.snapshot);
		
		jqRow.append(jqImgWrap);
		jqRow.append(jqDivName);
		jqRow.append(jqDivOwner);
		jqRow.append(jqDivDate);
		jqRow.append(jqDivCtrl);
		boardList.append(jqRow);

		// add controls
		
		var jqButtonSave = $('<div>').text('\u{1F4BE}').addClass('save').appendTo(jqDivCtrl); // diskette
		var jqButtonDelete = $('<div>').addClass('delete').text('\u{1F5D1}').appendTo(jqDivCtrl); // trash

		// click handler
		jqRow.click(function() {
			var boardId = $(this).data('board-id');
			var boardSnap = $(this).data('board-snapshot');
			Event.send('clickBoardRecord', boardId+'/'+boardSnap);
		});

		(function(boardObj) {
			jqButtonSave.click(function(event) {
				event.stopPropagation()
				var a = document.createElement("a");
				a.href = 'data:application/xml;charset=utf-8,'+JSON.stringify([boardObj])
				a.download = boardObj.title+'-'+boardObj.snapshot+'.brd'
				a.click()
				/*
				var jqRow = $(this).closest('li');

				Event.send('openRenameBoard', {
					ctx: jqRow.data('board-id'),
					title: jqRow.data('board-title'),
					rename: true
				});
				return false;*/
			});
		})(boardObj)

		that = this
		jqButtonDelete.click(function(event) {
			event.stopPropagation()
			if(confirm("Do you really want to delete this board?"))
			{
				var jqRow = $(this).closest('li');
				Backend.deleteBoard(jqRow.data('board-id'),jqRow.data('board-snapshot'));
				setTimeout(function(){
					Backend._socket.send('boards')
				},0)
			}

			return false;
		});
	}
}
/*
UserController.prototype.processProfile = function(profile)
{
	var that = this;

	if(profile == null && that.requestedProfileName != null) // requested user not found?
	{
		Pages.go('error404');
		return;
	}

	var ownProfile = (Config.userId == profile.uid);

	// profile page
	if(that.requestedProfileName == profile.name)
	{
		// collect information
		var shareInformation = false;
		if(!!profile.mail) shareInformation = true;

		// set page title
		MetaData.setPageTitle(profile.name);

		// render
		var jqProfilePage = $('li.page.user li.subPage.profile');

		jqProfilePage.find('.profileName').text(profile.name);
		jqProfilePage.find('.avatarBig').attr('src', profile.avatarBig);

		jqProfilePage.find('.editOwnProfileSection').toggle( ownProfile );

		jqProfilePage.find('.mail span').text(profile.mail);

		jqProfilePage.find('.mail').toggle(shareInformation);
		jqProfilePage.find('.noInfo').toggle(!shareInformation);

		that.requestedProfileName = null;
	}

	// edit profile page
	if(ownProfile && profile.settings)
	{
		var jqEditProfilePage = $('li.page.user li.subPage.editprofile');

		// set avatar
		jqEditProfilePage.find('.avatarBig').attr('src', profile.avatarBig);

		// show mail input
		$('input.showMail').prop('checked', profile.settings.showMail);

		// show/hide verification hint

		$('.mailVerificationHint').toggle(!profile.settings.verified);
	}

	LoadingBar.done();
}
*/
UserController.prototype.getDataUrlFromArrayBuffer = function(buffer)
{
	if(!btoa) return null;

	var dataUrlHeader = 'data:image/png;base64,';

	var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }

    var base64Str = btoa(binary);

    return dataUrlHeader + base64Str;
}

addController('UserController', UserController);