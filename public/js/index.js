var userName;
var loginTime;
var myAvatarName = "mustacheMan.png";
var avatarListArray = [];
var myChatterArray = [];

// onLoadFunctions

$(function() {
	// alert('ready function');
	// $('#chooseUserNameContainer').hide();
	$('#chatDisplayRowContainer').hide();

	$('#chooseAvatarAnchor').popover({
		title : 'Cool Avatars',
		placement : 'bottom',
		trigger : 'click,focus,hover',
		animation : true,
		html : true,
		content : function() {

			return $('#popover_content_wrapper').html();
		}
	});

	$('#changeAvatarAnchor').popover({
		title : 'Cool Avatars',
		placement : 'bottom',
		trigger : 'click,focus,hover',
		animation : true,
		html : true,
		content : function() {

			return $('#popover_content_wrapper').html();
		}
	});

	var globalChatterObject = {
		"chatTo" : "global",
		"chatTabUlLiId" : "globalChatUlLi",
		"chatTabContentDivId" : "pubChatHome",
		"chatHistoryAllList" : "chatHistoryAllList",
		"messageBox" : "publicMessageBox",
		"sendMessageBtn" : "publicMessageSendBtn",
		"tabAnchor" : "globalAnchor"
	};
	myChatterArray.push(globalChatterObject);
});

// UI Functions
$('#publicMessageSendBtn').click(function() {
	sendChatMessage('global', 'publicMessageBox', 'chatHistoryAllList');
	return false;
});

$('#publicMessageBox').keypress(function(e) {
	if (e.keyCode == 13) {
		sendChatMessage('global', 'publicMessageBox', 'chatHistoryAllList');
		e.stopPropagation();
		e.stopped = true;
		e.preventDefault();
	}
});

$('input#userName').keypress(function(e) {
	if (e.keyCode == 13) {
		setUsername()
		e.stopPropagation();
		e.stopped = true;
		e.preventDefault();
	}
});

$('input#userName').change(setUsername());

// $('#chooseAvatarAnchor').onclick(openAvatarSelector);
// $('#chooseAvatarAnchor').popover({ html : true});

// General View Functions
/*
 * function sendPublicMessage() { // alert('Send Message '); var msg =
 * $('#publicMessageBox').val(); if (msg != "") { var currentTime = new Date();
 * var chatMessage = { "message" : msg, "sender" : userName, "sentAt" :
 * getTimeDisplay(currentTime), "sendTo":"All" }; // alert('Send Message '
 * +chatMessage); socket.emit('globalChat', chatMessage);
 * $('#chatHistoryAllList').append(getStructuredMessage(chatMessage));
 * $('#publicMessageBox').val('');
 * scrollMessageToEnd($("#publicChatHistoryDiv")); }
 *  }
 */

function sendChatMessage(sendTo, messageBoxID, chatHistoryList) {
	// alert('Send Message '+sendTo+' '+messageBoxID+' '+chatHistoryList);
	var msg = $('#' + messageBoxID).val();
	if (msg != "") {
		var currentTime = new Date();
		var chatMessage = {
			"message" : msg,
			"sender" : userName,
			"sentAt" : getTimeDisplay(currentTime),
			"sendTo" : sendTo
		};
		// alert('Send Message ' +chatMessage);
		socket.emit(sendTo + 'Chat', chatMessage);
		$('#' + chatHistoryList).append(getStructuredMessage(chatMessage));
		$('#' + messageBoxID).val('');
		scrollMessageToEnd($('#' + chatHistoryList));
	}
}

function scrollMessageToEnd(chatHistoryListID) {
	// alert(chatHistoryListID);
	var onlineUsersList = $("#onlineUsersList");
	onlineUsersList.animate({
		scrollTop : onlineUsersList.prop("scrollHeight")
				- onlineUsersList.height()
	}, 200);

	chatHistoryListID.animate({
		scrollTop : chatHistoryListID.prop("scrollHeight")
				- chatHistoryListID.height()
	}, 200);
}

function getStructuredMessage(msg) {
	// alert(msg);
	// alert(msg.message);
	var d = new Date();
	var messageBuilder = '<li class="media"><div class="media-body"><div class="media"><div class="media-body">';
	messageBuilder = messageBuilder.concat(msg.message);
	messageBuilder = messageBuilder.concat('<br><small class="text-muted">');
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

function setUsername() {
	userName = $('input#userName').val();
	loginTime = new Date();

	var sendUserNameData = {
		"userName" : userName,
		"loginTime" : getTimeDisplay(loginTime),
		"userAvatarId" : myAvatarName
	}

	socket.emit('set username', sendUserNameData, function(data) {
		console.log('emit set username on client side', data);
	});
	console.log('Set user name as ' + $('input#userName').val());
	$('#chatDisplayRowContainer').show();
	$('#chooseUserNameContainer').hide();
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
	if (userName != 'undefined' && userName != "") {
		$("#" + userName + "avatarImage").attr("src", avatarLocation);
		socket.emit('avatarChange', {
			"userName" : userName,
			"avatarLocation" : avatarLocation
		});
	}

}

function createPrivateChat(chatWith) {
	// var chatWith=chatWith.value();
	// alert(userName + " wants to chat with " + chatWith);
	var privateChatterObject = findChatterTab(chatWith);
	makeOtherChatTabDeactive();
	if (privateChatterObject == null) {
		addPrivateChatter(chatWith);
		privateChatterObject = addPrivateChatter(chatWith);
		attachKeyPress(privateChatterObject.sendMessageBtn,
				privateChatterObject.messageBox, chatWith,
				privateChatterObject.chatHistoryAllList);
		myChatterArray.push(privateChatterObject);
	} else {
		activateChatterTab(privateChatterObject);
	}

}

function addPrivateChatter(chatWith) {
	var chatTabUlLiId = chatWith + 'chatTabUlLiId';
	var chatTabContentDivId = chatWith + 'chatTabContentDiv';
	var chatHistoryAllList = chatWith + 'chatHistoryAllList';
	var messageBox = chatWith + 'message-box';
	var sendMessageBtn = chatWith + 'send-message-btn';
	var privateChatHistoryDiv = chatWith + 'chatHistoryDiv';
	var tabAnchorId = chatWith + 'Anchor';

	var privateChatterObject = {
		"chatTo" : chatWith,
		"chatTabUlLiId" : chatTabUlLiId,
		"chatTabContentDivId" : chatTabContentDivId,
		"chatHistoryAllList" : chatHistoryAllList,
		"messageBox" : messageBox,
		"sendMessageBtn" : sendMessageBtn,
		"tabAnchor" : tabAnchorId
	};

	var chatterTab = '<li class="active" id="' + chatTabUlLiId + '" ><a id="'
			+ tabAnchorId + '" aria-expanded="true" data-toggle="tab" href="#'
			+ chatTabContentDivId + '">' + chatWith + '</a></li>';

	var chatterContent = '<div id="'
			+ chatTabContentDivId
			+ '" class="tab-pane fade in active">'
			+ '<div class="panel panel-info">'
			+ '<div id="'
			+ privateChatHistoryDiv
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

var chatterContentDeactiveClass = 'tab-pane fade';
var chatterContentActivateClass = 'tab-pane fade active in';
var chatterTabActiveClass = 'active';
var chatterTabDeactiveClass = '';
var chatterTabActiveProperty = 'aria-expanded';

function findChatterTab(chatWith) {
	for (var i = 0; i < myChatterArray.length; i++) {
		if (myChatterArray[i].chatTo == chatWith) {
			return myChatterArray[i];
		}

	}
	return null;
}

function makeOtherChatTabDeactive() {
	for (var i = 0; i < myChatterArray.length; i++) {
		/*
		 * alert(myChatterArray[i] + ' ' + myChatterArray[i].chatTabUlLiId + ' ' +
		 * myChatterArray[i].chatTabContentDivId + ' ' +
		 * myChatterArray[i].chatHistoryAllList + ' ' +
		 * myChatterArray[i].messageBox + ' ' + myChatterArray[i].sendMessageBtn + ' ' +
		 * myChatterArray[i].tabAnchor + ' ');
		 */
		deactivateChatterTab(myChatterArray[i]);

	}
}

function activateChatterTab(chatterTab) {
	$('#' + chatterTab.chatTabUlLiId).removeClass(chatterTabDeactiveClass);
	$('#' + chatterTab.chatTabUlLiId).addClass(chatterTabActiveClass);
	$('#' + chatterTab.chatTabContentDivId).removeClass(
			chatterContentDeactiveClass);
	$('#' + chatterTab.chatTabContentDivId).addClass(
			chatterContentActivateClass);
	$('#' + chatterTab.tabAnchor).attr("aria-expanded", "true");
}

function deactivateChatterTab(chatterTab) {
	$('#' + chatterTab.chatTabUlLiId).removeClass(chatterTabActiveClass);
	$('#' + chatterTab.chatTabUlLiId).addClass(chatterTabDeactiveClass);
	$('#' + chatterTab.chatTabContentDivId).removeClass(
			chatterContentActivateClass);
	$('#' + chatterTab.chatTabContentDivId).addClass(
			chatterContentDeactiveClass);
	$('#' + chatterTab.tabAnchor).attr("aria-expanded", "false");
}

function attachKeyPress(messageSendBtnID, messageBoxID, sendTo, chatHistoryList) {

	$('#' + messageSendBtnID).click(function() {
		sendChatMessage(sendTo, messageBoxID, chatHistoryList);
		return false;
	});

	$('#' + messageBoxID).keypress(function(e) {
		if (e.keyCode == 13) {
			sendChatMessage(sendTo, messageBoxID, chatHistoryList);
			e.stopPropagation();
			e.stopped = true;
			e.preventDefault();
		}
	});

}