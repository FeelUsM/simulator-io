$(function() {
	var jqMainNav = $('body header.mainNav');
	var jqSidebar = $('nav.mobileSidebar'); // main stuff is in mobilesidebar.js, but mainnav also controls the sidebar

	jqMainNav.find('a.login').click(function() {
		Event.send('button', {key: 'openLogin'});
		return false;
	});
	
	jqMainNav.find('a.register').click(function() {
		Event.send('button', {key: 'openRegister'});
		return false;
	});

	Event.on('userStatusChange', function() {
		var state = Backend.isLoggedIn();

		jqMainNav.find('a.loginState0').toggle(!state);
		jqMainNav.find('a.loginState1').toggle(state);

		jqSidebar.find('a.loginState0').toggle(!state);
		jqSidebar.find('a.loginState1').toggle(state);
	});

	if(isOldBrowser())
	{
		$('#oldBrowserHint').show();
	}
});

function showMainNav(show)
{
	$('body header.mainNav').toggle(show);
	$('body footer.mainFooter').toggle(show);
}

function updateProfileMeta()
{
	if(Backend.isLoggedIn())
	{
		var avatar = null;
		if(Config.profile) avatar = Config.profile.avatarSmall;
		if(avatar == null && initConfig) avatar = initConfig.avatarSmall;

		var workspaceButtons = $('header.mainNav a.workspace, nav.mobileSidebar a.workspace');
		workspaceButtons.find('img').attr('src', avatar);
		workspaceButtons.find('span').text(Config.userName);
	}
}