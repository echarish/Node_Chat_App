var userName;
var loginTime;
var myAvatarName = "defaultAvatar.png";
var avatarListArray = [];
var myChatterArray = [];

// onLoadFunctions

$(function() {
	//alert('ready function '+userName);
	// $('#chooseUserNameContainer').hide();
	userName=getUrlParameter('userName');


	/*if (userName == undefined || userName == '') {
		// alert('inside if');
		$('#chatDisplayRowContainer').hide();
		$('#chooseUserNameContainer').show();
	} else {
		// alert('inside else');
		$('#chatDisplayRowContainer').show();
		$('#chooseUserNameContainer').hide();
	}*/

	$('#chooseAvatarAnchor').popover({
		title : 'Cool Avatars',
		placement : 'bottom',
		trigger : 'click,hover,focus',
		animation : true,
		html : true,
		content : function() {
			// alert($('#popover_content_wrapper').html());
			return $('#popover_content_wrapper').html();
		}
	});

	$('#changeAvatarAnchor').popover({
		title : 'Cool Avatars',
		placement : 'bottom',
		trigger : 'click,hover,focus',
		animation : true,
		html : true,
		content : function() {
			// alert($('#popover_content_wrapper').html());
			return $('#popover_content_wrapper').html();
		}
	});
    var publicChatTab=getChatterObject("global", "publicChatTabUlLiID",
                      			"publicChatContentDivID", "publicChatHistoryListID", "publicMessageBoxID",
                      			"publicMessageSendBtnID", "publicAnchor", "publicChatHome");
    attachEventsToChatTab(publicChatTab, "global");
	myChatterArray.push(publicChatTab);

	setUsername(userName);
});

// UI Functions
$('#publicMessageSendBtnID').click(
		function() {
			sendChatMessage('global', 'publicMessageBoxID', 'publicChatHistoryListID',
					true, 'publicChatContentDivID');
			return false;
		});

$('#publicMessageBoxID').keypress(
		function(e) {
			if (e.keyCode == 13) {
				sendChatMessage('global', 'publicMessageBoxID', 'publicChatHistoryListID',
                					true, 'publicChatContentDivID');
				e.stopPropagation();
				e.stopped = true;
				e.preventDefault();
			}
		});

/*$('input#userName').keypress(function(e) {
	if (e.keyCode == 13) {
		setUsername()
		e.stopPropagation();
		e.stopped = true;
		e.preventDefault();
	}
});*/

function sendChatMessage(sendTo, messageBoxID, chatHistoryList, global,
		chatTabContentDivId) {

	var msg = $('#' + messageBoxID).val();
	// ('Send Message'+ msg+' to '+sendTo+' '+messageBoxID+' '+chatHistoryList+'
	// '+userName);
	if (msg != "") {
		var currentTime = new Date();
		var chatMessage = {
			"message" : msg,
			"sender" : userName,
			"sentAt" : getTimeDisplay(currentTime),
			"sendTo" : sendTo
		};
		// alert('Send Message ' +chatMessage);
		if (global) {
			socket.emit('globalChat', chatMessage);
		} else {
			socket.emit('privateChat', chatMessage);
		}
		$('#' + chatHistoryList).append(getStructuredMessage(chatMessage));
		$('#' + messageBoxID).val('');
		scrollMessageToEnd(chatTabContentDivId);
	}
}

function scrollMessageToEnd(chatTabContentDivId) {

	var onlineUsersList = $("#onlineUsersList");
	onlineUsersList.animate({
		scrollTop : onlineUsersList.prop("scrollHeight")
				- onlineUsersList.height()
	}, 200);

	var chatTabContentDivIdObject = $("#" + chatTabContentDivId);
	//alert(chatTabContentDivId+' '+chatTabContentDivIdObject);
	chatTabContentDivIdObject.animate({
		scrollTop : chatTabContentDivIdObject.prop("scrollHeight")
				- chatTabContentDivIdObject.height()
	}, 200);
}

function getStructuredMessage(msg) {
	// alert(msg);
	// alert(msg.message);
	var d = new Date();
	var messageBuilder = '<li class="media"><div class="media-body"><div class="media"><div class="media-body"><p style="color:black;">';
	messageBuilder = messageBuilder.concat(msg.message);
	messageBuilder = messageBuilder
			.concat('</p><br><small class="text-muted">');
	messageBuilder = messageBuilder.concat(msg.sender + " | " + msg.sentAt);
	messageBuilder = messageBuilder
			.concat('</small><hr></div></div></div></li>');
	return messageBuilder;
}

function appendOnlineUserInfo(onlineUserName, logTime, userAvatarId) {

	var privateChatter = '>';
	if (onlineUserName != userName) {
		privateChatter = 'onclick="createPrivateChat(\'' + onlineUserName
				+ '\');">';
	}
	// alert('Private Chatter ' + privateChatter)
	var onlineUserBuilder = '<li class="media" id="'
			+ onlineUserName
			+ '">'
			+

			'<a  href="#" '
			+ privateChatter
			+ '<img class="media-object img-circle pull-left" style="max-height:40px;" id="'
			+ onlineUserName
			+ 'avatarImage" src="images/avatar/'
			+ userAvatarId
			+ '" />'
			+ '<img class="media-object img-circle pull-left" style="max-height:40px;" src="images/status/status-online.png" />'
			+ '<h5>' + onlineUserName + ' </h5>'
			+ '<small class="text-muted"> Since ' + logTime + '</small>'
			+ '</a>' + '</li>';

	// alert(onlineUserBuilder);
	$('#onlineUsersList').append(onlineUserBuilder);
	return onlineUserBuilder;
}

function setUsername(userName) {
	//userName = $('input#userName').val();
	loginTime = new Date();

	var sendUserNameData = {
		"userName" : userName,
		"loginTime" : getTimeDisplay(loginTime),
		"userAvatarId" : myAvatarName
	}

	socket.emit('set username', sendUserNameData, function(data) {
		//console.log('emit set username on client side', data);
	});
	//console.log('Set user name as ' + $('input#userName').val());
	//$('#chatDisplayRowContainer').show();
	//$('#chooseUserNameContainer').hide();
	// appendOnlineUserInfo(userName);
}

function setFeedback(fb) {
	$('span#feedback').html(fb);
}

function setCurrentUserInfo(fb) {
	$('span#currentUserInfoSpan').html(fb);
}

function getTimeDisplay(time) {
	return time.toLocaleDateString() + " | " + time.toLocaleTimeString()

}

function handleUserLeft(msg) {
	$("#" + msg.userName).remove();
}

function playSound(filename) {
	filename = "./sounds/" + filename;
	document.getElementById("sound").innerHTML = '<audio autoplay="autoplay"><source src="'
			+ filename
			+ '.mp3" type="audio/mpeg" /><source src="'
			+ filename
			+ '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="'
			+ filename + '.mp3" /></audio>';
}

function getAvatarList() {
	// alert('getting avatar list')
	var avatarListFinal = "";
	for (var i = 0; i < avatarListArray.length; i++) {
		var avatarName = avatarListArray[i];
		var avatarId = avatarName.split(".")[0];
		var singleAvatarItem = '<li><a class="avatarli" onclick="changeAvatar(\'';
		singleAvatarItem = singleAvatarItem.concat(avatarId);
		singleAvatarItem = singleAvatarItem.concat('\');" id="');
		singleAvatarItem = singleAvatarItem.concat(avatarId);
		singleAvatarItem = singleAvatarItem
				.concat('"><img  src="images/avatar/');
		singleAvatarItem = singleAvatarItem.concat(avatarName);
		singleAvatarItem = singleAvatarItem.concat('" alt="');
		singleAvatarItem = singleAvatarItem.concat(avatarName);
		singleAvatarItem = singleAvatarItem.concat('"/></a></li>');
		avatarListFinal = avatarListFinal.concat(singleAvatarItem);
	}
	// alert(avatarListFinal);
	return avatarListFinal;
}

function changeAvatar(avatarName) {
	// alert(avatarName);
	myAvatarName = avatarName + ".png"
	var avatarLocation = '/images/avatar/' + myAvatarName;
	// alert(avatarLocation);
	$("#myAvatarAtNameChooser").attr("src", avatarLocation);
	$("#myAvatarImage").attr("src", avatarLocation);
	if (userName != undefined && userName != "") {
		$("#" + userName + "avatarImage").attr("src", avatarLocation);
		socket.emit('avatarChange', {
			"userName" : userName,
			"avatarLocation" : avatarLocation
		});
	}

}

function createPrivateChat(chatWith) {
	var privateChatterObject = findChatterTab(chatWith);

	makeOtherChatTabDeactive(privateChatterObject);
	if (privateChatterObject == null) {

		privateChatterObject = addPrivateChatter(chatWith);
		attachEventsToChatTab(privateChatterObject, chatWith);
		myChatterArray.push(privateChatterObject);
	} else {
		activateChatterTab(privateChatterObject);
	}
	return privateChatterObject;
}

function addPrivateChatter(chatWith) {
	var chatTabUlLiId = chatWith + 'ChatTabUlLiID';
	var chatTabContentDivId = chatWith + 'ChatTabContentDivID';
	var chatHistoryAllList = chatWith + 'ChatHistoryListID';
	var messageBox = chatWith + 'MessageBoxID';
	var sendMessageBtn = chatWith + 'SendMessageBtnID';
	var privateChatHomeDiv = chatWith + 'ChatHome';
	var tabAnchorId = chatWith + 'Anchor';

	var privateChatterObject = getChatterObject(chatWith, chatTabUlLiId,
                               			chatTabContentDivId, chatHistoryAllList,messageBox,
                               			sendMessageBtn, tabAnchorId, privateChatHomeDiv);

	var chatterTab = '<li tabindex="'+myChatterArray.length+'" class="active" id="' + chatTabUlLiId + '" ><a id="'
			+ tabAnchorId + '" aria-expanded="true" data-toggle="tab" href="#'
			+ privateChatHomeDiv + '">' + chatWith + '</a></li>';

	var chatterContent = '<div id="'
			+ privateChatHomeDiv
			+ '" class="tab-pane fade in active">'
			+ '<div class="panel panel-info" >'
			+ '<div  id="'
			+ chatTabContentDivId
			+ '" class="panel-body panel-height">'
			+ '<ul id="'
			+ chatHistoryAllList
			+ '" class="media-list"></ul>'
			+ '</div>'
			+ '<div class="panel-footer">'
			+ '<div class="input-group">'
			+ '<input id="'
			+ messageBox
			+ '" type="text" placeholder="Write a message here..."'
			+ 'rows="3" class="form-control input-lg"/><span class="input-group-btn">'
			+ '<button id="' + sendMessageBtn
			+ '" type="button" class="btn btn-info">Send'
			+ 'Message</button></span>' + '</div>' + '</div>' + '</div>'
			+ '</div>';
	// alert(chatterContent);
	$("#chatTabUL").append(chatterTab);
	$('#chatTabContentDiv').append(chatterContent);

	return privateChatterObject;
}
function findChatterTab(chatWith) {
	for (var i = 0; i < myChatterArray.length; i++) {
		if (myChatterArray[i].chatTo == chatWith) {
			return myChatterArray[i];
		}

	}
	return null;
}

function makeOtherChatTabDeactive(exludedTab) {
	for (var i = 0; i < myChatterArray.length; i++) {

	    if(exludedTab!=myChatterArray[i]){
	       /* alert("deactivating "+myChatterArray[i].chatTo+
	        ' \n chatHomeDiv - '+myChatterArray[i].chatHomeDiv+
	        ' \n chatTabContentDivId - '+myChatterArray[i].chatTabContentDivId);*/
		    deactivateChatterTab(myChatterArray[i]);
		}
	}
}

var chatterContentActivateClass = 'in';
var activateTabClass = 'active';
var chatterTabActiveProperty = 'aria-expanded';

function activateChatterTab(chatterTab) {
	$('#' + chatterTab.chatTabUlLiID).addClass(activateTabClass);
	$('#' + chatterTab.chatHomeDiv).addClass(activateTabClass);
    $('#' + chatterTab.chatHomeDiv).addClass(chatterContentActivateClass);
	$('#' + chatterTab.tabAnchor).attr(chatterTabActiveProperty, "true");
}

function deactivateChatterTab(chatterTab) {
	$('#' + chatterTab.chatTabUlLiID).removeClass(activateTabClass);
    $('#' + chatterTab.chatHomeDiv).removeClass(activateTabClass);
    $('#' + chatterTab.chatHomeDiv).removeClass(chatterContentActivateClass);
	$('#' + chatterTab.tabAnchor).attr(chatterTabActiveProperty, "false");
}

function attachEventsToChatTab(chatterTab, sendTo) {

	$('#' + chatterTab.sendMessageBtnID).click(
			function() {
				sendChatMessage(sendTo, chatterTab.messageBoxID, chatterTab.chatHistoryListID, false,
						chatterTab.chatContentDivID);
				return false;
			});

	$('#' + chatterTab.messageBoxID).keypress(
			function(e) {
				if (e.keyCode == 13) {
					sendChatMessage(sendTo, chatterTab.messageBoxID, chatterTab.chatHistoryListID, false,
                    						chatterTab.chatContentDivID);
					e.stopPropagation();
					e.stopped = true;
					e.preventDefault();
				}
			});

	$( "#"+chatterTab.chatTabUlLiID ).click(function() {
	       makeOtherChatTabDeactive(chatterTab);
           activateChatterTab(chatterTab);
	       scrollMessageToEnd(chatterTab.chatContentDivID);
    });

}

function getChatterObject(chatTo, chatTabUlLiId, chatTabContentDivId,
		chatHistoryAllList, messageBox, sendMessageBtn, tabAnchor, chatHomeDiv) {
	/*alert(chatTo+'\n'+chatTabUlLiId+'\n'+chatTabContentDivId+'\n'+chatHistoryAllList+'\n'+messageBox+'\n'+
                                         			sendMessageBtn+'\n'+tabAnchor+'\n'+ chatHomeDiv);*/
	var globalChatterObject = {
		"chatTo" :chatTo,
		"chatTabUlLiID" : chatTabUlLiId,
		"chatContentDivID" : chatTabContentDivId,
		"chatHistoryListID" : chatHistoryAllList,
		"messageBoxID" : messageBox,
		"sendMessageBtnID" : sendMessageBtn,
		"tabAnchor" : tabAnchor,
		"chatHomeDiv" : chatHomeDiv
	};
	return globalChatterObject;
}

function blinkElement(chatterTab){

    var toggle=true;
    for(i=0;i<5;i++) {
         $('#'+chatterTab.chatTabUlLiID).fadeTo('slow', 0.5).fadeTo('slow', 1.0);
         //$('#'+chatterTab.chatContentDivID).fadeTo('slow', 0.5).fadeTo('slow', 1.0);
        /* alert(toggle);
         if(toggle){
           $('#' + chatterTab.chatTabUlLiID).addClass(activateTabClass);
         }else{
           $('#' + chatterTab.chatTabUlLiID).removeClass(activateTabClass);
         }

         toggle=!toggle;*/
     }
      //$('#' + chatterTab.chatTabUlLiID).removeClass(activateTabClass);
}

function doChaterTabAction(chatterTab,msg){
    $('#'+chatterTab.chatHistoryListID).append(getStructuredMessage(msg));
    //makeOtherChatTabDeactive(chatterTab);
   // activateChatterTab(chatterTab);
   // scrollMessageToEnd(chatterTab.chatContentDivID);
    blinkElement(chatterTab);
}

function alertMessage(msg){
     playSound("bing");
     $.titleAlert(msg, {
            requireBlur : true,
            stopOnFocus : true,
            duration : 10000,
            interval : 500
        });
}


function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};