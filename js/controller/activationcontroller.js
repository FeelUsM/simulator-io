function ActivationController()
{
}

// prototype
ActivationController.prototype = Object.create(ControllerBase.prototype);

// implementations
ActivationController.prototype.getView = function()
{
	return 'activation';
}

ActivationController.prototype.setup = function()
{

}

ActivationController.prototype.switch = function(args)
{
	var jqActivation = $('section.accountActivation');

	var mail = args[0];
	var hash = args[1];

	jqActivation.find('.hint').hide();
	jqActivation.find('.hintLoading').show();

	Backend.verifyMail(mail, hash, function(result) {
		jqActivation.find('.hintLoading').hide();

		if(result.result) // success ? 
		{
			jqActivation.find('.hintSuccess').show();
		}
		else
		{
			if(result.error == 1) // error 1 ? (invalid identhash)
			{
				jqActivation.find('.hintError1').show();
			}
			else // error 2 or something else ?
			{
				jqActivation.find('.hintError2').show();
			}
		}

		LoadingBar.done();
	});
}

addController('ActivationController', ActivationController);