UI.init(function(system) {
	function initSpinner()
	{
		$('input[type=number]').each(function(){
			$(this).focusout(function(){
				var value = ~~$(this).val();
				
				if(!!$(this).attr('min'))
				{
					if(value < ~~($(this).attr('min'))) $(this).val($(this).attr('min'));
				}
				
				if(!!$(this).attr('max'))
				{
					if(value > ~~($(this).attr('max'))) $(this).val($(this).attr('max'));
				}
			});
		})
	}
	
	initSpinner();
});