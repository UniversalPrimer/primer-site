
function start() {
/*
//    var mainvid = getUrlVars()['vid']; 
//    mainvid = 'd2f57177-1a0c-4306-9e80-7311cc9352ed';
		ho2 = document.getElementById('display2');
		up2 = new upVideo(); 

		up2.setup(ho2);
//    up2.video.setSource(mainvid);

		up2.video.setSource('http://localhost/cuepoints.flv');
		up2.setWidth(360);
		document.getElementById('chat').style.right = '35000px';
*/
}



function toggleChat() {
    var ch = document.getElementById('chat');
    var chd = ch.style.right;
    var hidden = chd == '35000px' || chd == '';
    
    var cht = document.getElementById('chat-toggle');
    var cht_text = cht.childNodes[0];
    cht_text.innerHTML = (hidden) ? 'Close' : 'Chat';
    cht.style.right = (hidden) ? '350px' : '0px';
    ch.style.right = (hidden) ? '0px' : '35000px';
}


function postMessage() {
		var inputfield = document.getElementById('chat-input-field');
		var str = inputfield.value;
		inputfield.value = '';
		
  	var time = document.createElement('div');
		time.className = 'time';
		time.innerHTML = 'Right now';
		var name = document.createElement('h4');
		name.innerHTML = 'You';

		var msg = document.createTextNode(str);
    
		var post = document.createElement('div');
		post.appendChild(time);
		post.appendChild(name);
		post.appendChild(msg);
    
		document.getElementById('chat-log').appendChild(post);
}