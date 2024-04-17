function initOverlayRegister()
{
	var jqBox = $('#uiOverlayRegister');

	function resetValidation()
	{
		jqBox.find('.valid.msg').hide();
		setFormActive(true);
	}

	function setFormActive(state)
	{
		jqBox.find('input, button').prop('disabled', !state);
	}
	
	function updateValidation()
	{	
		var registerValid = true;

		for(var i = 0; i < Validation.RegisterSet.length; i++)
		{
			var fieldInfo = Validation.RegisterSet[i];
			var value = $(fieldInfo.src).val();
			var target = $(fieldInfo.src).parent().find('.valid');
			
			var result = Validation[fieldInfo.func](value);
			var hintText = fieldInfo.hintText[result.hint];
			registerValid &= result.valid;

			target.text(hintText);
			target.toggle(!registerValid);
		}

		//jqBox.find('button').prop('disabled', !registerValid);

		return registerValid;
	}
	

	/*jqBox.find('form').find('input').bind('change paste keyup', function() {
		updateValidation();
	});*/

	jqBox.find('form').submit(function(e){
		e.preventDefault();

		if(updateValidation())
		{
			var name = $(this).find('input[name="name"]').val();
			var mail = $(this).find('input[name="mail"]').val();
			var pass = $(this).find('input[name="pass"]').val();
			
			setFormActive(false);

			Config.loginOnRegisterAuthData = [name, pass];
			Backend.register(name, mail, pass);
		}
		
		return false;
	});
	
	Event.on('validationUpdated', function() {
		updateValidation();
		setFormActive(true);
	});

	Event.on('overlayOpened', function(name) {
		if(name == 'Register')
		{
			resetValidation();
			jqBox.find('form')[0].reset();
			jqBox.find('input[name="name"]').focus();
		}
	});
}


Event.onKey('button', 'openRegister', function() {
	openOverlay('Register');
});