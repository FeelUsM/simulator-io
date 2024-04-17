var ScrollArea = {
	find: function(key) {
		return $('.scrollArea[data-key="' + key + '"]');
	},
	
	init: function(scrollArea, showAlways) {
		return new function() {
			var that = this;
			var pos = 0;
			var mouseOffset = null;
			var posPerPixel = 0;
			var scrollableHeight = 0;
			var scrollHeight = 0;

			
			this.getHeight = function()
			{
				return scrollHeight;
			}
			
			this.getPos = function()
			{
				return pos;
			}
			
			this.setPos = function(p)
			{
				pos = p;
			}
		
			this.update = function()
			{
				var content = scrollArea.find('.content');
				scrollHeight = content.outerHeight(true) - scrollArea.height();

				// adjust
				if(pos > scrollHeight) pos = scrollHeight;
				if(pos < 0) pos = 0;
				
				// apply to content area
				content.css('top', (-pos) + 'px');
				
				// height of inner scrollbar
				var innerScrollbarHeight = (scrollArea.height() / content.outerHeight(true)) * scrollArea.height();
				var innerScrollbarHeightClip = Math.min(scrollArea.height(), innerScrollbarHeight);
				scrollArea.find('.slider .innerSlider').height( innerScrollbarHeightClip );
				
				
				// top of inner scrollbar
				scrollableHeight = scrollArea.height() - innerScrollbarHeight;
				var currentTop = (pos / scrollHeight) * scrollableHeight;
				posPerPixel = scrollHeight / scrollableHeight;

				scrollArea.find('.slider .innerSlider').css('top', (currentTop + 1) + 'px');
				
				if(!showAlways)
				{
					if(posPerPixel < 1)
					{
						scrollArea.find('.slider').hide();
					}
					else
					{
						scrollArea.find('.slider').show();
					}
				}
			}
		

			scrollArea.bind('mousewheel DOMMouseScroll', function(e){
				pos -= mathSign((!!e.originalEvent.wheelDelta) ? e.originalEvent.wheelDelta : e.originalEvent.detail * -1) * 35;
				that.update();
			});
			
			scrollArea.find('.slider .innerSlider').mousedown(function(e) {
				mouseOffset = e.pageY;
			});
			
			$(document).mouseup(function() {
				mouseOffset = null;
			});
			
			$(document).mousemove(function(e) {
				if(e.which == 0) mouseOffset = null;
			
				if(mouseOffset != null)
				{
					var diff = e.pageY - mouseOffset;
					pos += diff * posPerPixel;
					
					mouseOffset = e.pageY;
					that.update();
				}
			});
			
			that.update();
			//UI.registerShowUpdate(that.update);
		}
	},
};