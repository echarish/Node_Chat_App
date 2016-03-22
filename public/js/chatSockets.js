/**
 * Created by harishkumar on 3/18/16.
 */
var socket = io();


// All Socket methods
socket.on('globalChat', function(msg) {
    // alert('Global Chat Socket '+msg);
    $('#chatHistoryAllList').append(getStructuredMessage(msg));
    playSound("bing");
    scrollMessageToEnd();
    $.titleAlert(msg.message, {
        requireBlur : true,
        stopOnFocus : true,
        duration : 10000,
        interval : 500
    });

});

socket.on('savedGlobalChat', function(msg) {
    // alert('Global Chat Socket '+msg);
    $('#chatHistoryAllList').append(getStructuredMessage(msg));
    scrollMessageToEnd();
});

socket.on('userJoined', function(userDetails) {
    // alert('User Joined Socket '+msg);
    appendOnlineUserInfo(userDetails.userName, userDetails.loginTime,userDetails.userAvatarId);
});

socket
    .on(
        'error',
        function(msg) {
            if (msg.userNameInUse) {
                setFeedback("<span style='color: red'> Username already in use. Try another name.</span>");
            }
        });

socket.on('welcome', function(userDetails) {
    // alert('welcomeMsg '+ userDetails.userName + ' ,'+
    // userDetails.currentUsers);
    var currentUsersObject = JSON.parse(userDetails.currentUsers);
    var userArray = [];
    for ( var x in currentUsersObject) {
        userArray.push(currentUsersObject[x]);
    }
    for (var i = 0; i < userArray.length; i++) {

        // alert(userArray[i]);
        if (userName != userArray[i].userName) {
            appendOnlineUserInfo(userArray[i].userName, userArray[i].loginTime,userArray[i].userAvatarId);
        }
    }
    setCurrentUserInfo("<span style='color: green'> Welcome " + userName
        + "</span>");
});

socket
    .on(
        'error',
        function(msg) {
            if (msg.userNameInUse) {
                setFeedback("<span style='color: red'> Username already in use. Try another name.</span>");
            }
        });

socket.on('userLeft', function(msg) {
    handleUserLeft(msg);
});

socket.on('avatarList',function(avatarList){
    //alert(avatarList);
    var avatarListObject = JSON.parse(avatarList);

    for ( var x in avatarListObject) {
        //alert(avatarListObject[x])
        avatarListArray.push(avatarListObject[x]);
    }
    $("#avatarListUL").append(getAvatarList());
})

socket.on('avatarChange', function(msg) {
	   //alert(msg);
	    $("#"+msg.userName+"avatarImage").attr("src", msg.avatarLocation);
});
