initmessage = function (page) {
    // Conversation flag
    var conversationStarted = false;

    // Init Messages
    var myMessages = $$('.messages')[0].f7Messages;
    // Now you can use it
    myMessages.layout();

    // Init Messagebar
    var myMessagebar = $$('.messagebar')[0].f7Messagebar;
    // Now you can use it
    myMessagebar.value('مرحبًا');
    //myMessagebar.

    // Handle message
    $$('.messagebar .link').on('click', function () {
        // Message text
        var messageText = myMessagebar.value().trim();
        // Exit if empy message
        if (messageText.length === 0) return;

        // Empty messagebar
        myMessagebar.clear()

        // Random message type
        var messageType = (['sent', 'received'])[Math.round(Math.random())];

        // Avatar and name for received message
        var avatar, name;
        if (messageType === 'received') {
            avatar = 'images/profile.jpg';
            name = 'User';
        }
        // Add message
        myMessages.addMessage({
            // Message text
            text: messageText,
            // Random message type
            type: messageType,
            // Avatar and name:
            avatar: avatar,
            name: name,
            // Day
            day: !conversationStarted ? 'Today' : false,
            time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
        })

        // Update conversation flag
        conversationStarted = true;
    });
}