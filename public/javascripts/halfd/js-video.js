/*
* Universal Primer - Video components
*
* AGPL - Halfdan Mouritzen
*
*/

window.playerIsReady = function(st) {
	console.log('den siger den er klar- og burgere');
}

var videoBaseFolder = 'http://hmmedie.imm.dtu.dk/videos/';

html5player = (function html5player(playerId) {
	// Build a html5 video player and attach functions to it
	//
	// Return element

	var videoDisplay = document.createElement('video');
	videoDisplay.id = playerId;
	//videoDisplay.width = '640';
	//videoDisplay.height = '390';
	//videoDisplay.addEventListener('click', function() { upVideo.controls.toggle(); }, false );
	videoDisplay.addEventListener('ended', function() { upVideo.controls.pause(); }, false);
	videoDisplay.addEventListener('loadedmetadata', function() { }, false);
	videoDisplay.addEventListener('timeupdate', function() { this.updateTime(); }, false);

	videoDisplay.setSource = function(videoId, hardUrl) {
		this.poster = 'video/ss/' + videoId + '.jpg';

		// Add the webm source
		var source = document.createElement('source');
		source.src = videoBaseFolder + videoId + '.webm';
		source.type = 'video/webm; codecs="vp8, vorbis"';
		this.appendChild(source);

		// Add the ogg source
		var source = document.createElement('source');
		source.src = videoBaseFolder + videoId + '.ogg';
		source.type = 'video/ogg; codecs="theora, vorbis"';

        if (hardUrl) {
            source.src = videoId;
        }

		this.appendChild(source);
	};

	videoDisplay.toggle = function() {
        videoDisplay.initVideo();
		if (/paused/.test(this.parentNode.className)) {
			this.play();
			this.parentNode.className = 'upVideoDisplay';
		} else {
			this.pause();
			this.parentNode.className = 'upVideoDisplay paused';
		}
	};

    videoDisplay.fullscreen = function() {
        var h = videoDisplay.parentNode;
        document.body.appendChild(h);


        videoDisplay.style.width = '100%';

        h.style.position = 'absolute';
        h.style.top = '0';
        h.style.right = '0';
        h.style.bottom = '0';
        h.style.left = '0';

        h.addEventListener('mousemove', function(ev) {
            clearTimeout(window.fullscreen_timer); 

            h.childNodes[2].style.opacity = '1';
            h.childNodes[3].style.height = '15px';
            document.body.style.cursor = 'default';

            window.fullscreen_timer = window.setTimeout(function() {
                h.childNodes[2].style.opacity = '0';
                h.childNodes[3].style.height = '4px';
                // For some reason, turning the cursor 'off' breaks everything
                // in chrome ...
                //document.body.style.cursor = 'none';
            }, 1900);
        });
    }

	return videoDisplay
});

flashplayer = (function flashplayer(playerId) {
	var videoDisplay = document.createElement('object');
	//videoDisplay.width = '640';
	//videoDisplay.height = '390';
	videoDisplay.id = playerId;
	var param = document.createElement('param');
	param.value = 'video_display.swf';
	param.name = 'movie';

	var wmode = document.createElement('param');
	wmode.name = 'wmode';
	wmode.value = 'transparent';

	var embed = document.createElement('embed');
	embed.name = 'videoDisplayembed';
	embed.src = 'video_player.swf';

    var scale = document.createElement('param');
    scale.name = 'scale';
    scale.value = 'exactfit';

	videoDisplay.appendChild(param);
	videoDisplay.appendChild(scale);
	videoDisplay.appendChild(wmode);
	videoDisplay.appendChild(embed);

	videoDisplay.toggle = function() {
		if (/paused/.test(this.parentNode.className)) {
			videoDisplay.play();
			this.parentNode.className = 'upVideoDisplay';
		} else {
			this.pause();
			this.parentNode.className = 'upVideoDisplay paused';
		}
	};
	
	videoDisplay.setSource2 = function(videoId, hardUrl) {
        console.log('setting source');
        if (hardUrl) {
            this.setSource(videoId);
        } else {
            this.setSource(videoBaseFolder + videoId + '.flv');
        }
	};

	return videoDisplay
});

pluginplayer = (function pluginplayer(playerId) {
    // Make a generic object that uses whatever plugin the browser has
    // TODO - also actually do it
});

upVideo = (function upVideo(holder) {
    /*************************************************************
     * var up = new upVideo();
     * 
     * var display = document.getElementById('display');
     * up.setup(display);
     *
     *************************************************************/

    // Private
    var displayContainer = null;
    var videoDisplay = null;
    var playIcon = null;
    var controlDisplay = null;
    var updateScrubberTimer = null;

    var totalVideoTime = null;
    var currentVideoTime = null;
    var timeDisplay = null;

    var scrubberDisplay = null;
    var playedDisplay = null;
    var bufferedDisplay = null;

    var videoSource = null;

    // Testing
    // Right now we just set this to html5 we're ust testing
//    var html5video = true; //(getUrlVars()['html5'] == 'oui');
    var html5video = false; //(getUrlVars()['html5'] == 'oui');
    var flashvideo = (!html5video);

    var __init__ = function() {
        // Do initial setup

        // This sets up the HTML5 video element
        // Make a fallback for flash etc.
		var videoId = 'video_' + Math.floor(Math.random() * 1000);

        if (html5video) {
			videoDisplay = html5player(videoId); 
        } else if (flashvideo) {
			videoDisplay = flashplayer(videoId);
        }

		videoDisplay.updateTime = function() {
			var cur = videoDisplay.currentTime;
			var tot = videoDisplay.duration;

			var curfull = cur/60;
			var totfull = tot/60;

			var curmin = Math.floor(curfull);
			var cursecs = curfull - curmin; 
			var cursecs = Math.floor((((curfull - curmin) / 100) * 60) * 100);

			var totmin = Math.floor(totfull);
			var totsecs = Math.floor((((totfull - totmin) / 100) * 60) * 100);

            var tothour = 0;
            var curhour = 0;

            if (totmin > 60) {
                tothour = Math.floor(totmin / 60);
                totmin = totmin - 60 * tothour;
            }

            if (curmin > 60) {
                curhour = Math.floor(curmin / 60);
                curmin = curmin - 60 * curhour;
            }

			curhour = (curhour < 10) ? '0' + curhour : curhour;
			curmin = (curmin < 10) ? '0' + curmin : curmin;
			cursecs = (cursecs < 10) ? '0' + cursecs : cursecs;

            tothour = (tothour < 10) ? '0' + tothour : tothour;
            totmin = (totmin < 10) ? '0' + totmin : totmin;
            totsecs = (totsecs < 10) ? '0' + totsecs : totsecs;

            if (tothour > 0) {
			    var str = curhour + ':' + curmin + ':' + cursecs + ' / ' + tothour + ':' + totmin + ':' + totsecs;
            } else {
			    var str = curmin + ':' + cursecs + ' / ' + totmin + ':' + totsecs;
            }

			timeDisplay.innerHTML = str; 
		}

        // This places the play icon inside the displayContainer
        playIcon = document.createElement('img');
        playIcon.src = 'images/play.png';
        playIcon.className = 'playicon';
		playIcon.canToggle = true;

        playIconWrapper = document.createElement('div');
        playIconWrapper.className = 'playiconwrapper';
        playIconWrapper.appendChild(playIcon);
		playIconWrapper.canToggle = true;

		/*
        playIconWrapper.addEventListener('click',
			function(el) {
        		//this.parentNode.firstChild.toggle();
				//this.controlDisplay.controls.play();	
				updateScrubberTimer = setInterval(scrubberDisplay.update, 250, scrubberDisplay);
				console.log(videoDisplay.play());
			},
		true );
		*/

        buildControls();

		updateBufferedTimer = setInterval(updateBuffered, 100);

        return null
    }

    var buildControls = function() {
        var controls = document.createElement('div');
        controls.className = 'up-controls';

        var toggle = document.createElement('div');
        toggle.className = 'up-toggle';
		toggle.canToggle = true;

        var slider = document.createElement('input');
        slider.className = 'up-slider';
        slider.type = 'range';
		slider.addEventListener('change', function() {
			videoDisplay.volume = this.value/100;
		}, true);

		/*
        toggle.addEventListener('click', function() {
			this.toggle();
			//console.log(this.parentNode.parentNode.firstChild.toggle());
		}, false );
		*/

        var scrubber = document.createElement('div');
        scrubber.className = 'up-scrubber';
		scrubber.update = function(scrubber) {
			currentVideoTime = scrubber.parentNode.firstChild.currentTime;
			totalVideoTime = scrubber.parentNode.firstChild.duration;

			var per = (currentVideoTime / totalVideoTime) * 100;
			scrubber.lastChild.style.width = per + '%';
		};

		scrubber.addEventListener('click', function(ev) {
			var x = ev.offsetX;
			
			var video = scrubber.parentNode.firstChild;
			currentVideoTime = video.currentTime;
			totalVideoTime = video.duration;

			var w_per = (x / video.width) * 100;
			var jumptime = (totalVideoTime / 100) * w_per;
			//console.log(jumptime);
			video.currentTime = jumptime; 

		}, false);

        playedDisplay = document.createElement('div');
        playedDisplay.className = 'up-played';

		var ddd = document.createElement('div');
		ddd.className = 'up-handle';
		playedDisplay.appendChild(ddd);

		scrubber.played = playedDisplay;

        bufferedDisplay = document.createElement('div');
        bufferedDisplay.className = 'up-buffered';

        scrubber.appendChild(bufferedDisplay);
        scrubber.appendChild(playedDisplay);

		timeDisplay = document.createElement('div');
		timeDisplay.className = 'timedisplay';
		timeDisplay.innerHTML = '00:00:00 / 00:00:00';

        controls.appendChild(toggle);
        controls.appendChild(timeDisplay);
        controls.appendChild(slider);
        //controls.appendChild(pause);

		scrubberDisplay = scrubber;
        controlDisplay = controls;

		playIconWrapper.controls = controls;

    }

    var updateBuffered = function() {
		try {
			var buffered = videoDisplay.buffered.end();
			var totalTime = videoDisplay.duration;

			var per = (buffered / totalTime)* 100;

			bufferedDisplay.style.width = per + '%';
			if (per === 100) {
				clearInterval(updateBufferedTimer);            
			}
		} catch(e) {}
    }


    var setControls = function() {
        // Set the status of the play/pause button
    }

    // initiate
    __init__();

    // return public methods
    return {
        video: videoDisplay,
		playicon : playIcon,
		controlHolder : controlDisplay,
		scrubber : scrubberDisplay,
        autoPlay : false,

        check: function() {
            return displayContainer;
        },

        setup: function(div) {
            /****************************************************
             * 
             * Pass it a container DIV, then upVideo fills it with
             * the video and controllers
             * 
             ****************************************************/

            displayContainer = div;
            div.appendChild(videoDisplay);
            div.appendChild(playIconWrapper);
            div.appendChild(controlDisplay);
            div.appendChild(scrubberDisplay);
            displayContainer.className = displayContainer.className + ' paused';

			displayContainer.addEventListener('click', function(ev) {
				if (/true/.test(ev.target.canToggle)) {
					displayContainer.toggle();
				}
			}, true);

			displayContainer.play = function() { 
				updateScrubberTimer = setInterval(scrubberDisplay.update, 250, scrubberDisplay);
				displayContainer.className = 'upVideoDisplay';
				return videoDisplay.play();
			}

			displayContainer.pause = function() {
				clearInterval(updateScrubberTimer);
				displayContainer.className = 'upVideoDisplay paused';
				return videoDisplay.pause();
			}

			displayContainer.toggle = function() {
				if (/paused/.test(displayContainer.className)) {
					this.play();
				} else {
					this.pause();
				}

				return videoDisplay.paused
			}

        },

		setWidth : function(width) {
			// Calculate the height of the video (using 16/9)

			// Set width and height
			this.video.width = width;
			// Auto resize handles this way better
			//this.video.height = height; 
			
			// Calculate and set the position of the play icon
			var height = this.video.getClientRects()[0].height;

			this.playicon.style.left = (width/2) - 45 + 'px';
			this.playicon.style.top = (height/2) - 45 + 'px';
		},

        setHeight : function(height) {
            // Much simpler then what is going on up above
            this.video.height = height;
        },

        loadVideo : function(videoId) {
            videoUrl = videoId;
            if (html5video) {
                upVideo.setSource();
            } else if (flashvideo) {
                // Wait for the flash element to be loaded before we try to set
                // source
            }
        },

        playerIsReady : function() {
            //upVideo.setSource();
        },

		displayTime : function() {
			
		},

        controls : {
            play : function() {
                // Start the timer that counts our progress
               	updateScrubberTimer = setInterval(scrubberDisplay.update, 250, scrubberDisplay);
                displayContainer.className = 'upVideoDisplay';
                return videoDisplay.play();
            },
            pause : function() {
                // Stop the timer that counts our progress
                clearInterval(updateScrubberTimer);
                displayContainer.className = 'upVideoDisplay paused';
                return videoDisplay.pause();
            },
            toggle : function() {
                if (/paused/.test(displayContainer.className)) {
                    upVideo.controls.play();
                } else {
                    upVideo.controls.pause();
                }

                return videoDisplay.paused
            },
            setCallback : function(funcStr, ms) {
                videoDisplay.setTimerCallback(funcStr, ms);
            },
            status : function() {
                videoDisplay.status();
            },
        },
    }
});

// Helpers and temporary stuff

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function besked(str) {
    console.info(str);
}
