
var chan_ready = false;
var chat_nickname = null;

function doSend() {
    var msg = $('msg').value.escapeHTML();

    if(!chat_nickname) {
        reg_chat_nickname(msg);
        return false;
    }
    
    var cmd = {
        type: 'chat/public-msg',
        nickname: chat_nickname,
        msg: msg
    };

    chan.send(Object.toJSON(cmd));
    chat_add_msg(chat_nickname, msg);

    $('msg').value = '';

}

function reg_chat_nickname(name) {
    if(!name || (name =='')) {
        alert("nickname missing");
    }
    chat_nickname = name;

    if(chan_ready) {
        $('send_button').disabled = false;
        $('msg').style.backgroundColor = 'white';
        $('msg').value = '';
    } else {
        $('send_button').disabled = true;
        $('msg').style.backgroundColor = 'gray';
    }
    $('send_button').value = 'Say';
}

function onChanReady() {
    $('send_button').disabled = false;
    chan_ready = true;
}

function onReceive(json) {
    if(!json || (json == '')) {
        return false;
    }
    var cmd = json.evalJSON(true);
    if(!cmd || !cmd.type || (cmd.type == '')) {
        alert("invalid command received: " + json);
        return false;
    }

    switch(cmd.type) {
    case 'chat/public-msg':
        if(!cmd.msg || (cmd.msg == '') || !cmd.nickname || (cmd.nickname == '')) {
            alert("invalid chat message received: " + json);
            return false
        }
        chat_add_msg(cmd.nickname, cmd.msg);
        break;
    case 'slides/change':
        slide_change(cmd.md5, cmd.page, cmd.size);
        break;
    default:
        alert('unknown command type received: ' + cmd.type);
        return false
    }

}


function chat_add_msg(nickname, msg) {
    nickname = nickname.escapeHTML();
    msg = msg.escapeHTML();
    
    $('chat_messages').innerHTML += nickname + ': ' + msg + '<br />';
}

// =============================================
//  Slide viewer stuff
// =============================================


function slideTest() {
    if(!chan_ready) {
        alert("not connected");
        return false;
    }

    var md5 = 'c959f9f83fab203e09672e0ce45d4568';

    change_slide_cmd(md5, 0, 'medium');
}


function change_slide_cmd(md5, page, size) {

    var cmd = {
        type: 'slides/change',
        md5: md5,
        page: page,
        size: size
    };

    chan.send(Object.toJSON(cmd));
    slide_change(md5, page, size);


}

function slide_change(md5, page, size) {
    var img = document.createElement('IMG');
    var parms = {
        md5: md5,
        page: page,
        size: size
    }
    img.src = '/data_file/image?'+Object.toQueryString(parms);

    $('slide_viewer').innerHTML = '';
    $('slide_viewer').appendChild(img);
}