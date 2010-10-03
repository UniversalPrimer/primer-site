
var chan_ready = false;
var chat_nickname = null;
var paper = null;

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
        if(!cmd.md5 || (cmd.md5 == '') || !cmd.page || (cmd.page == '')) {
            alert("slide change without md5 or page: " + json);
            return false;
        }
        slide_change(cmd.md5, cmd.page, cmd.size);
        break;

    case 'draw/lines':
        if(!cmd.lines || (cmd.lines.length == 0)) {
            alert("lines command with no lines to draw: " + json);
            return false;
        }
        draw_lines(cmd.lines, cmd.color);
        break;

    case 'draw/clear':
        draw_clear();
        break;

    case 'draw/cursor-clear':
        cursor_clear();
        break;

    case 'draw/cursor':
        if(!cmd.x || !cmd.y || (cmd.x == '') || (cmd.y == '')) {
            alert("cursor command with no coordinate: " + json);
            return false;
        }
        draw_cursor(cmd.x, cmd.y);
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

// ============================================
//   Begin raphael stuff
// ============================================

function init_raphael() {
    paper = Raphael(
                    $('slide_viewer_overlay'), 
                    640, 
                    480, 
                    {
                        stroke: 'red'
                    });

}

function draw_lines(lines, color) {

    color = color || 'black';

    var i;
    var line;
    for(i=0; i < (lines.length - 1); i++) {
        from = lines[i];
        to = lines[i+1];
        draw_line(from[0], from[1], to[0], to[1], color);
    }
}

function draw_line(x1, y1, x2, y2, color) {
    paper.path('M'+x1+' '+y1+'L'+x2+' '+y2).attr({
            stroke: color
        });
}

function draw_clear() {
    paper.clear();
}



// ================================
//  Tests
// ================================

function slideTest() {
    if(!chan_ready) {
        alert("not connected");
        return false;
    }

    var md5 = 'c959f9f83fab203e09672e0ce45d4568';

    change_slide_cmd(md5, 0, 'medium');
}


function raph_test() {

    var lines = [
                 [10, 10],
                 [10, 150],
                 [200, 30],
                 [50, 470]
                 ];


    draw_lines(lines, 'red');

}