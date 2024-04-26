UI.init(function(system) {
	console.log('UI.init sections.js # 1')
	$('.tbSection').each(function(){
		var section = $(this);
		var header = section.find('.sectionHeader');
		var content = section.find('.sectionContent');
		
		header.click(function() {
			if(section.hasClass('closed'))
			{
				content.slideDown(200);
			}
			else
			{
				content.slideUp(200);
			}
			
			section.toggleClass('closed');
		});
	});
});