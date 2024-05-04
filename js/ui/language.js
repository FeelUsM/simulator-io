var siteLanguage = 'en' // default language
const allLanguages = ['en', 'ru']
const jqLangSelectors = $('#navLangSelect,#boardLangSelect') // all Lang Selectors

if(localStorage.getItem('language')===null) {
	localStorage.setItem('language',siteLanguage)
}
else
	siteLanguage = localStorage.getItem('language')
jqLangSelectors.val(siteLanguage)

/*
языковой объект - это просто {en:'тект на английском' , ru:'текст на русском'}
В DOM дереве каждый переводимый элемент имеет класс translatable а также атрибуты data-en и lata-ru
*/
function renderLang(){
	"находит все переводимые элементы и устанавливает их inner_html в data-en или data-ru"
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
	//console.log('init language',siteLanguage)
	renderLang()
	jqLangSelectors.change(function(){
		siteLanguage = this.value;
		localStorage.setItem('language',siteLanguage)
		//console.log('select language',siteLanguage)
		renderLang()
		jqLangSelectors.val(siteLanguage) // если изменился один селектор, то надо поменять все остальные
		MetaData.updateTitle()
	})
})
function isStringable(obj) {
	return typeof obj == "string" || typeof obj == "number"
}
jQuery.fn.lang_text = function(obj){
	"без аргументов - преобразует DOM элемент в языковой объект"
	"если аргумент строка - это просто this.html()"
	"если аргумент - языковой объект - устанавливает его в DOM элемент и this.html(текущий язык)"
	if(obj===undefined){
		obj = {}
		var cnt = 0
		for(key of allLanguages)
			if(this.data(key)!==null) {
				obj[key] = this.data(key)
				cnt++
			}
		if(cnt==0)
			return {'en':this.html()}
		return obj
	}	
	if(isStringable(obj))
		return this.html(obj)
	this.addClass('translatable')
	for(key in obj)
		this.data(key,obj[key])
	if(obj[siteLanguage]!==null)
		return this.html(obj[siteLanguage])
	else
		return this.html(obj['en'])
}

function lang_text(obj) {
	"преобразует язывковой объект в строку, выбирая текущий язык"
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
	"складывает языковые объекты как строки (для каждого языка)"
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