$(function() {
	// bug mail in footer
	var bugMail = "mai" + String.fromCharCode(108) + "to:bug" + String.fromCharCode(64) + "simulator.io";

	$('#mailPlaceholderAddressBug').attr('href', bugMail);
});