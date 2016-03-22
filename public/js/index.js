var userName;
var loginTime;
var myAvatarName = "mustacheMan.png";
var avatarListArray = [];

// onLoadFunctions

$(function () {
    //alert('ready function');
    // $('#chooseUserNameContainer').hide();
    $('#chatDisplayRowContainer').hide();

    $('#chooseAvatarAnchor').popover({
        title: 'Cool Avatars',
        placement: 'bottom',
        trigger: 'click,focus,hover',
        animation: true,
        html: true,
        content: function () {

            return $('#popover_content_wrapper').html();
        }
    });



    $('#changeAvatarAnchor').popover({
        title: 'Cool Avatars',
        placement: 'bottom',
        trigger: 'click,focus,hover',
        animation: true,
        html: true,
        content: function () {

            return $('#popover_content_wrapper').html();
        }
    });
});


// UI Functions
$('#send-message-btn').click(function () {
    sendMessage();
    return false;
});

$('#message-box').keypress(function (e) {
    if (e.keyCode == 13) {
        sendMessage();
        e.stopPropagation();
        e.stopped = true;
        e.preventDefault();
    }
});

$('input#userName').keypress(function (e) {
    if (e.keyCode == 13) {
        setUsername();
        e.stopPropagation();
        e.stopped = true;
        e.preventDefault();
    }
});

$('input#userName').change(setUsername);


//$('#chooseAvatarAnchor').onclick(openAvatarSelector);
//$('#chooseAvatarAnchor').popover({ html : true});


// General View Functions
function sendMessage() {
    // alert('Send Message ');
    var msg = $('#message-box').val();
    if (msg != "") {
        var currentTime = new Date();
        var chatMessage = {
            "message": msg,
            "sender": userName,
            "sentAt": getTimeDisplay(currentTime)
        };
        // alert('Send Message ' +chatMessage);
        socket.emit('globalChat', chatMessage);
        $('#chatHistoryAllList').append(getStructuredMessage(chatMessage));
        $('#message-box').val('');
        scrollMessageToEnd();
    }
}

function scrollMessageToEnd() {

    var onlineUsersList = $("#onlineUsersList");
    onlineUsersList.animate({
        scrollTop: onlineUsersList.prop("scrollHeight")
        - onlineUsersList.height()
    }, 200);

    var publicChatHistoryDiv = $("#publicChatHistoryDiv");
    publicChatHistoryDiv.animate({
        scrollTop: publicChatHistoryDiv.prop("scrollHeight")
        - publicChatHistoryDiv.height()
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

function appendOnlineUserInfo(userName, logTime, userAvatarId) {


    var onlineUserBuilder = '<li class="media" id="'+userName+'">'+

        '<a  href="">' +
        '<img class="media-object img-circle pull-left" style="max-height:40px;" id="'+userName+'avatarImage" src="images/avatar/' +
        userAvatarId +
        '" />' +
        '<img class="media-object img-circle pull-left" style="max-height:40px;" src="images/status/status-online.png" />'+
        '<h5>' +
        userName +
        ' </h5>' +
        '<small class="text-muted"> Since '
        +logTime+
        '</small>' +
        '</a>' +
        '</li>' ;

    //alert(onlineUserBuilder);
    $('#onlineUsersList').append(onlineUserBuilder);
    return onlineUserBuilder;
}

function setUsername() {
    userName = $('input#userName').val();
    loginTime = new Date();

    var sendUserNameData = {
        "userName": userName,
        "loginTime": getTimeDisplay(loginTime),
        "userAvatarId": myAvatarName
    }

    socket.emit('set username', sendUserNameData, function (data) {
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
    //alert('getting avatar list')
    var avatarListFinal = "";
    for (var i = 0; i < avatarListArray.length; i++) {
        var avatarName = avatarListArray[i];
        var avatarId = avatarName.split(".")[0];
        var singleAvatarItem = '<li><a class="avatarli" onclick="changeAvatar(\'';
        singleAvatarItem = singleAvatarItem.concat(avatarId);
        singleAvatarItem = singleAvatarItem.concat('\');" id="');
        singleAvatarItem = singleAvatarItem.concat(avatarId);
        singleAvatarItem = singleAvatarItem.concat('"><img  src="images/avatar/');
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
    //alert(avatarName);
    myAvatarName = avatarName + ".png"
    var avatarLocation = '/images/avatar/' + myAvatarName;
    //alert(avatarLocation);
    $("#myAvatarAtNameChooser").attr("src", avatarLocation);
    $("#myAvatarImage").attr("src", avatarLocation);
    if(userName!='undefined' && userName!=""){
        $("#"+userName+"avatarImage").attr("src", avatarLocation);
        socket.emit('avatarChange', {"userName":userName,"avatarLocation":avatarLocation});
    }


}




