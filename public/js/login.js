$(document).ready(function() {

$.facebox.settings.closeImage = 'images/facebox/closelabel.png';
$.facebox.settings.loadingImage = 'images/facebox/loading.gif';

$('#signInBtnID').click(
		function() {
			 alert('Sing me in');

			return false;
		});


$('#signUpBtnID').click(
		function() {
			 //alert('Sing me up');
			 $.ajax( '/signup').done(function( signUpHtmlPage ) {

			    $.facebox(signUpHtmlPage);

			    //$(signUpHtmlPage).appendTo('body');
               /* $(signUpHtmlPage).popup({
                			width: 600,
                			modal: true,
                			close: function(event, ui) {
                				$("#animatedModal").remove();
                				}
                			});*/
               // $('#animatedModal').animatedModal();

			 });
			return false;
		});


});