var Accordion = {
	init: function(jqList)
	{
		jqList.each(function() {
			var opened = true;
			var jqHead = $('<div>').addClass('accHead');
			var jqIndicator = $('<div>').addClass('accIndicator');
			var jqTitle = $('<div>').addClass('accTitle');
			var jqContent = $('<div>').addClass('accContent');		
			jqTitle.text($(this).data('title'));
			$(this).children().prependTo(jqContent);
			$(this).append(jqHead);
			$(this).append(jqContent);
			jqHead.append(jqIndicator);
			jqHead.append(jqTitle);
			
			function updateIndicator()
			{
				jqIndicator.text(opened ? '\u25BC' : '\u25BA');
			}
			
			if($(this).data('default') == 'closed')
			{
				jqContent.hide();
				opened = false;
			}
			
			updateIndicator();
			
			jqHead.click(function() {
				jqContent.slideToggle();
				opened = !opened;
				updateIndicator();
			});
		});
	}
};