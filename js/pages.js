var Pages = (new function() {
	var that = this;
	var compiledMap = [];
	var loadedControllers = {};
	var loadedViews = [];
	var currentPage = null;
	var currentController = null;
	var outstandingSwitch = null; // if we want to switch on login

	// ----------------------------------------------------------------------------------------------------
	this.go = function(url, virtualPost, initial)
	{
		console.log("go ", url);

		//ga('send', 'pageview', url); // google analytics

		if(currentController)
		{
			currentController.leave();
			currentController = null;
		}
		
		url = this.redirectUrl(url)
		initial = initial || false;
		var args = [];
		var ctrl = this.setCurrentPageByUrl(decodeURI(url), args);
		// ищет в compiledMap подходящую строку
		// args = то что соответсвует '$' из PageMap
		// ctrl = compiledMap[i]
		// currentPage = PageMap[i]
		console.log("go ctrl",ctrl," - ",args)

		if(ctrl != null)
		{
			if(!initial)
			{
				LoadingBar.start();
				LoadingBar.setStage(1);
			}

			var ctrlType = ctrl.type;
			var ctrlName = ctrl.controller;

			// found controller name, check if there is already an instance
			var instance = null;
			if(!!loadedControllers[ctrlName])
			{
				instance = loadedControllers[ctrlName];
			}
			else
			{
				// nothing found, create new instance
				var func = FrontendControllers[ctrlName] || window[ctrlName] || null;
				//console.log("start load controller:",ctrlName,func)
				if(func)
				{
					var ctrlInstance = new func();
					instance = loadedControllers[ctrlName] = ctrlInstance;
					console.log("load controller:",instance)
				}
				//else	console.log("controller not found",ctrlName)
			}

			// set page title
			MetaData.setPageTitle(ctrl.title);

			// handle instance lookup result
			if(instance)
			{
				// toggle body scroll
				$('body').toggleClass('noScroll', instance.getProperty('scroll') !== true);

				// toggle main nav (header,footer)
				showMainNav(instance.getProperty('showMainNav') === true);

				// load view and switch
				var view = instance.getView(url);
				this.switchToView(view, function() {
					LoadingBar.setStage(2);
					setSidebar(0); // hide sidebar

					// setup controller if necessary
					if(!instance.setupDone)
					{
						instance.setup();
						instance.setupDone = true;
					}

					var switchNow = true;
					var forbidden = false;

					Event.send('closeOverlay');

					if(ctrlType == 1) // private page?
					{
						if(Backend.isReady())
						{
							if(!Backend.isLoggedIn())
							{
								forbidden = true;
								switchNow = false;
							}
						}
						else
						{
							outstandingSwitch = {
								instance: instance,
								args: args,
								url: url,
								virtualPost: virtualPost,
								type: ctrlType
							};
							switchNow = false;

							Event.send('loadState', {switchWaitForLogin: true});
						}
					}

					if(switchNow)
					{
						instance.switch(args, url, virtualPost); // tell controller to switch

						if(!initial) that.simulateNativeSwitch(url, MetaData.getMetaTitle(), virtualPost);
					}
					else
					{
						if(forbidden)
						{							
							Event.send('fullSizeError', {type: 'error403'});
						}
					}

					currentController = instance;
				});
			}
			else
			{
				console.error("ERROR\tCannot find controller");
			}
		}
		else
		{
			console.error("ERROR\tCannot find controller to URL: ", url);
		}
	}

	// ----------------------------------------------------------------------------------------------------
	this.init = function()
	{
		// compile url map 
		for(var i = 0; i < PageMap.length; i++)
		{
			var record = PageMap[i];
			compiledMap.push({
				url: this.compileUrl(record.url),
				controller: record.controller,
				type: record.type,
				title: record.title
			});
		}
		console.log("compiledMap",compiledMap)

		// collect views from html
		$('ul.pages>li.page').each(function(){
			var viewName = $(this).data('view');
			that.addView(viewName);
		});
		console.log("loadedViews",loadedViews)

		// init <a> listender
		this.initLinkListener();

		// init "back" button in browser
		this.initBackListener();

		// init basic transitions (like: what happens when the logout is complete?)		
		this.initBasicTransitions(); // .on('userStatusChange'), .on('backendReady')

		// go to page
		this.go(window.location.pathname+window.location.search, null, true);
	}

	this.initLinkListener = function() // listens to all a.virtual elements for clicks
	{
		$('body').on('click', 'a.virtual', function(e) {
			if(e.which == 1) // only do that on left mouse click
			{
				e.preventDefault();

				Pages.go($(this).attr('href'));

				return false;
			}
		});
	}

	this.initBasicTransitions = function()
	{
		// switch if there is an outstanding one
		function processOutstandingSwitch()
		{
			if(outstandingSwitch)
			{
				var o = outstandingSwitch;

				if(!Backend.isLoggedIn() && o.type == 1)
				{
					Event.send('fullSizeError', {type: 'error403'});
				}
				else
				{
					o.instance.switch(o.args, o.url, o.virtualPost); // tell controller to switch
				}

				outstandingSwitch = null;
			}
		}

		Event.on('userStatusChange', function() {
			//handlerPublicPrivateTransition();
		}, thisLine());

		Event.on('backendReady', function() {
			processOutstandingSwitch();

			if(currentController)
			{
				currentController.onBackendReady();
			}

			Event.send('loadState', {switchWaitForLogin: false});
		}, thisLine());
	}

	// ----------------------------------------------------------------------------------------------------
	this.redirectUrl = function(url) {
		// preprocess url
		if(url.includes("simulator.html")){
			url = url.split("simulator.html")[1]
		}
		if(url.includes(".html")) 
			console.warn("html in url",url)
		if(url.length == 0) url = '/';
		if(url.length > 1 && url[url.length - 1] == '/') url = url.substring(0, url.length - 1);
		if(url[0]=='/') { 
			url = '?'+url.slice(1)
		}
		if(url[0]!='?')
			console.warn("non standart url",url)
		else
			console.log("standart url",url)
		return url	
	}
	this.setCurrentPageByUrl = function(url, refVars)
	{
		// get controller
		for(var i = 0; i < compiledMap.length; i++)
		{
			var vars = this.urlMatch(compiledMap[i], url);
			
			if(!!vars)
			{
				// copy to refed vars
				for(var n = 0; n < vars.length; n++)
				{
					refVars.push(vars[n]);
				}
			
				currentPage = PageMap[i];

				return compiledMap[i];
			}
		}
		
		return null;
	}

	// ----------------------------------------------------------------------------------------------------
	this.getCurrentController = function()
	{
		return currentController;
	}

	// ----------------------------------------------------------------------------------------------------
	this.switchToView = function(viewName, cb)
	{
		function doIt()
		{
			var allViews = $('ul.pages>li.page');
			allViews.removeClass('active');
			allViews.filter('.' + viewName).addClass('active');

			cb();
		}

		var view = this.getView(viewName);

		if(view)
		{
			if(view.cb != null) // not loaded yet, add callback
			{
				view.cb.push(doIt);
			}
			else // fully loaded
			{
				doIt();
			}
		}
		else // request
		{
			console.error("view is apsent on html",viewName) // server-less implementation

			var newView = this.addView(viewName);
			newView.cb = [ doIt ];
			Backend.requestView(viewName);
		}
	}

	// ----------------------------------------------------------------------------------------------------
	this.getView = function(viewName)
	{
		for(var i = 0; i < loadedViews.length; i++)
		{
			if(loadedViews[i].name == viewName) return loadedViews[i];
		}

		return null;
	}

	// ----------------------------------------------------------------------------------------------------
	this.addView = function(viewName)
	{
		var view = {
			name: viewName,
			cb: null
		};
		loadedViews.push(view);

		return view;
	}

	// ----------------------------------------------------------------------------------------------------
	this.viewLoaded = function(viewName, viewHtml)
	{
		if(viewHtml == null) return;

		// add to pages
		$('ul.pages').append($(viewHtml));

		// process callbacks
		var view = this.getView(viewName);

		if(view && view.cb != null)
		{
			for(var i = 0; i < view.cb.length; i++)
			{
				view.cb[i]();
			}

			view.cb = null;
		}
	}

	// ----------------------------------------------------------------------------------------------------
	this.simulateNativeSwitch = function(url, title, virtualPost)
	{
		$('body').scrollTop(0);
  		$('body').scrollLeft(0);

		if(history.pushState && !url.includes("://") && !url.includes(".html")) // only set if supported and not for special pages (like 404 pages without leading slash)
		{
			history.pushState({
				virtualPost: virtualPost
			}, title, url);
		}
	}

	// ----------------------------------------------------------------------------------------------------
	this.initBackListener = function()
	{
		window.addEventListener('popstate', function(event) {
			var virtualPost = null;

			if(!!event.state)
			{
				virtualPost = event.state.virtualPost;
			}

			Pages.go(location.pathname+window.location.search, virtualPost, true); // todo virtual post
		});
	}

	// ----------------------------------------------------------------------------------------------------
	this.compileUrl = function(pattern)
	{
		pattern = pattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\|]/g, "\\$&");

		var sourceStr = "";
		for(var i = 0; i < pattern.length; i++)
		{
			if(pattern[i] != '$')
			{
				sourceStr = sourceStr + pattern[i];
			}
			else
			{
				sourceStr = sourceStr + "(.*)";
			}
		}
		
		return new RegExp("^" + sourceStr + "$");
	}
	
	// ----------------------------------------------------------------------------------------------------
	this.urlMatch = function(compiled, url) // если подошло, возвращает оставшуюся часть compiled
	{	
		var match = compiled.url.exec(url);
		//console.log(compiled, url, match)
		if(match)
		{
			var vars = [];
			
			for(var i = 1; i < match.length; i++)
			{
				vars.push(match[i]);
			}
			
			return vars;
		}
		else
		{
			return null;
		}
	}
});