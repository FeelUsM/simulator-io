var siteLanguage = 'en' // default language
const allLanguages = ['en', 'ru']
if(localStorage.getItem('language')===null) {
	localStorage.setItem('language',siteLanguage)
}
else
	siteLanguage = localStorage.getItem('language')
$('#navLangSelect,#boardLangSelect').val(siteLanguage)

function renderLang(){
	$('html').attr('lang',siteLanguage)
	$('.translatable').each(function(){
		if($(this).data(siteLanguage)!==null)
			$(this).html($(this).data(siteLanguage))
		else if($(this).data('en')!==null) {
			$(this).html($(this).data('en'))
			console.warn('element',this,'has no language',siteLanguage)
		}
		else
			console.error('element',this,'has neither language',siteLanguage,'nor','en')
	})
	$('.titletranslatable').each(function(){
		if($(this).data(siteLanguage)!==null) {
			$(this).attr('title',$(this).data(siteLanguage))
		}
		else if($(this).data('en')!==null) {
			$(this).attr('title',$(this).data('en'))
			console.warn('element',this,'has no language',siteLanguage)
		}
		else
			console.error('element',this,'has neither language',siteLanguage,'nor','en')
	})
}
$(function() {
	console.log('init language',siteLanguage)
	renderLang()
	$('#navLangSelect,#boardLangSelect').change(function(){
		siteLanguage = this.value;
		localStorage.setItem('language',siteLanguage)
		console.log('select language',siteLanguage)
		renderLang()
		$('#navLangSelect,#boardLangSelect').val(siteLanguage)
		MetaData.updateTitle()
	})
})
function isStringable(obj) {
	return typeof obj == "string" || typeof obj == "number"
}
jQuery.fn.lang_text = function(obj){
	if(obj===undefined){
		obj = {}
		var cnt = 0
		for(key of allLanguages)  // All registered languages
			if(this.data(key)!==null) {
				obj[key] = this.data(key)
				cnt++
			}
		if(cnt==0)
			return {'en':this.text()}
		return obj
	}	
	if(isStringable(obj))
		return this.text(obj)
	this.addClass('translatable')
	for(key in obj)
		this.data(key,obj[key])
	if(obj[siteLanguage]!==null)
		return this.text(obj[siteLanguage])
	else
		return this.text(obj['en'])
}

function lang_text(obj) {
	if(isStringable(obj))
		return obj
	else if(obj[siteLanguage]!==null)
		return obj[siteLanguage]
	else if(obj['en']!==null) {
		console.warn('object',obj,'has no language',siteLanguage)
		return obj['en']
	}
	else {
		console.error('object',obj,'has neither language',siteLanguage,'nor','en')
		return undefined
	}
}

function lang_cat() {
	var result = {}
	for(key of allLanguages) {
		result[key]=''
	}
	for(var arg of arguments){
		if(isStringable(arg))
			for(key of allLanguages) {
				result[key]+=arg
			}
		else
			for(key of allLanguages) {
				if(arg[key]!==null)
					result[key]+=arg[key]
				else if(arg['en']!==null) {
					console.warn('object',arg,'has no language',key)
					result[key]+=arg['en']
				}
				else {
					console.error('object',arg,'has neither language',key,'nor','en')
					result[key]+=undefined
				}
			}
	}
	return result
}