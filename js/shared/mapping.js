// URL to controller map
//
// Types:
//	 1 = Private page (e.g. User pages)
//   2 = Public page (e.g. Home, FAQ,...)

var PageMap = [
	/* special pages */
	{"url": "error404",                              "controller": 'Error404Controller',		type: 2, title: "Page not found"},

	/* main pages */ // $ превращается в аргументы of ...
	{"url": "?",                                     "controller": 'HomeController',			type: 2, title: ""},
	{"url": "?samples",                              "controller": 'StaticController',			type: 2, title: ""},
	{"url": "?terms-of-use",                         "controller": 'StaticController',			type: 2, title: ""},
	{"url": "?faq",                             	 "controller": 'StaticController',			type: 2, title: ""},
	{"url": "?privacy",                              "controller": 'StaticController',			type: 2, title: ""},
	{"url": "?imprint",                              "controller": 'StaticController',			type: 2, title: ""},
	{"url": "?features",                             "controller": 'StaticController',			type: 2, title: ""},
	{"url": "?plans",	                             "controller": 'StaticController',			type: 2, title: ""},

	
	{"url": "?board/$/$",                            "controller": 'EditorController',			type: 2, title: "Board"},
	{"url": "?board/$",                              "controller": 'EditorController',			type: 2, title: "Board"},
	{"url": "?board",                                "controller": 'EditorController',			type: 2, title: "Board"},
	
	{"url": "?user/$",  /* /user/boards */           "controller": 'UserController',			type: 1, title: ""},//private 
	/*{"url": "?profile",                              "controller": 'UserController',       		type: 1, title: ""},//private
	{"url": "?profile/$",                            "controller": 'UserController',        	type: 1, title: ""},//private
	{"url": "?account/passwordreset",                "controller": 'PassResetController',		type: 2, title: "Reset your password"},
	{"url": "?account/passwordreset/$/$",            "controller": 'PassResetController',		type: 2, title: "Reset your password"},
	{"url": "?account/verify/$/$",        	         "controller": 'ActivationController',		type: 2, title: "Verify your Email address"},*/
];

// map for static controller, wildcards not allowed here
var StaticPageMap = [
	{"url": "?samples",						view: "samples", 			title: "Samples"},
	{"url": "?terms-of-use",				view: "terms", 				title: "Terms of Use"},
	{"url": "?faq",							view: "faq", 				title: "FAQ"},
	{"url": "?privacy",						view: "privacy", 			title: "Privacy"},
	{"url": "?imprint",						view: "imprint", 			title: "Imprint"},
	{"url": "?features",					view: "features", 			title: "Features"},
	{"url": "?plans",						view: "plans", 				title: "Plans"}
];

if(typeof module != 'undefined') // undefined
{
	module.exports.PageMap = PageMap;
	module.exports.StaticPageMap = StaticPageMap;
}