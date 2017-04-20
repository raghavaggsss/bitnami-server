/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var analyser1 = null;
var theBuffer = null;
var DEBUGCANVAS = null;
var mediaStreamSource = null;
var detectorElem,
	canvasElem,
	waveCanvas,
	pitchElem,
	noteElem,
	detuneElem,
	detuneAmount;
var score = 0;
var csrftoken="a";

var sourceNode1 = null;
var analyser2 = null;
var theBuffer1 = null;
window.onload = function() {
    var vocals = (document.getElementById("vocals")).innerText;
	audioContext = new AudioContext();
	MAX_SIZE = Math.max(4,Math.floor(audioContext.sampleRate/4000));	// corresponds to a 5kHz signal
	var request = new XMLHttpRequest();
	request.open("GET", "/media/vocals/" + vocals, true);
	request.responseType = "arraybuffer";
	request.onload = setTimeout(function() {
	  audioContext.decodeAudioData( request.response, function(buffer) {
	    	theBuffer = buffer;

			togglePlayback();
			toggleLiveInput();

			plotgraph();

		} );

	}, 5000)
	request.send();

	var karaoke_request = new XMLHttpRequest();
    	karaoke_request.open("GET", "/media/karaoke/" + vocals, true);
    	karaoke_request.responseType = "arraybuffer";
    	karaoke_request.onload = setTimeout(function() {
    	audioContext.decodeAudioData(karaoke_request.response, function(buffer) {
    		sourceNode1 = audioContext.createBufferSource();

        		sourceNode1.buffer = buffer;
        		sourceNode1.loop = false;

        		analyser2 = audioContext.createAnalyser();
        		analyser2.fftSize = 2048;
        		sourceNode1.connect( analyser2 );
        		analyser2.connect( audioContext.destination );
        		sourceNode1.start( 0 );
        		sourceNode1.onended = function() {
        		    togglePlayback();
                    score = score_calculate();
                    //score = 5;
                    csrftoken = getCookie('csrftoken');
                    setup();
                    sendScore(score);
        		}
    })
    }, 4845);
    karaoke_request.send();

	detectorElem = document.getElementById( "detector" );
	canvasElem = document.getElementById( "output" );
	DEBUGCANVAS = document.getElementById( "waveform" );
	if (DEBUGCANVAS) {
		waveCanvas = DEBUGCANVAS.getContext("2d");
		waveCanvas.strokeStyle = "black";
		waveCanvas.lineWidth = 1;
	}
	pitchElem = document.getElementById( "pitch" );
	noteElem = document.getElementById( "note" );
	detuneElem = document.getElementById( "detune" );
	detuneAmount = document.getElementById( "detune_amt" );

	detectorElem.ondragenter = function () {
		this.classList.add("droptarget");
		return false; };
	detectorElem.ondragleave = function () { this.classList.remove("droptarget"); return false; };
	detectorElem.ondrop = function (e) {
  		this.classList.remove("droptarget");
  		e.preventDefault();
		theBuffer = null;

	  	var reader = new FileReader();
	  	reader.onload = function (event) {
	  		audioContext.decodeAudioData( event.target.result, function(buffer) {
	    		theBuffer = buffer;
	  		}, function(){alert("error loading!");} );

	  	};
	  	reader.onerror = function (event) {
	  		alert("Error: " + reader.error );
		};
	  	reader.readAsArrayBuffer(e.dataTransfer.files[0]);
	  	return false;
	};




}

function error() {
    alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia =
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Connect it to the destination. SAME DESTINATION??

    analyser1 = audioContext.createAnalyser();
    analyser1.fftSize = 2048;
    mediaStreamSource.connect( analyser1 );


    updatePitch1();
}

function toggleOscillator() {
    if (isPlaying) {
        //stop playing and return
        sourceNode.stop( 0 );
        sourceNode = null;
        analyser = null;
        isPlaying = false;
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );
        return "play oscillator";
    }
    sourceNode = audioContext.createOscillator();

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    sourceNode.connect( analyser );
    analyser.connect( audioContext.destination );
    sourceNode.start(0);
    isPlaying = true;
    isLiveInput = false;
    updatePitch();

    return "stop";
}

function toggleLiveInput() {

    getUserMedia(
    	{
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream);
}

function togglePlayback() {
    if (isPlaying) {
        //stop playing and return
        sourceNode.stop( 0 );

        sourceNode = null;
        analyser = null;
        isPlaying = false;
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );
        return "start";
    }

    sourceNode = audioContext.createBufferSource();

    sourceNode.buffer = theBuffer;
    sourceNode.loop = false;

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    sourceNode.connect( analyser );
    //analyser.connect( audioContext.destination );
    sourceNode.start( 0 );
    isPlaying = true;
    isLiveInput = false;
    console.log('hr');
    updatePitch();

    return "stop";
}


var rafID = null;
var tracks = null;
var buflen = 1024;
var buf = new Float32Array( buflen );

var buf1 = new Float32Array( buflen );

var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteFromPitch( frequency ) {
	var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
	return Math.round( noteNum ) + 69;
}

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

function centsOffFromPitch( frequency, note ) {
	return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
}

// this is a float version of the algorithm below - but it's not currently used.
/*
function autoCorrelateFloat( buf, sampleRate ) {
	var MIN_SAMPLES = 4;	// corresponds to an 11kHz signal
	var MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
	var SIZE = 1000;
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;

	if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES))
		return -1;  // Not enough data

	for (var i=0;i<SIZE;i++)
		rms += buf[i]*buf[i];
	rms = Math.sqrt(rms/SIZE);

	for (var offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<SIZE; i++) {
			correlation += Math.abs(buf[i]-buf[i+offset]);
		}
		correlation = 1 - (correlation/SIZE);
		if (correlation > best_correlation) {
			best_correlation = correlation;
			best_offset = offset;
		}
	}
	if ((rms>0.1)&&(best_correlation > 0.1)) {
		console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")");
	}
//	var best_frequency = sampleRate/best_offset;
}
*/

var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be
var rms_setting = 18;
function autoCorrelate( buf, sampleRate ) {
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if(document.getElementById('rmsValue'))
	    rms_setting = document.getElementById('rmsValue').innerText;
	if (rms<rms_setting/100) // not enough signal
		return -1;

	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i])-(buf[i+offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation>GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			// short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
			// Now we need to tweak the offset - by interpolating between the values to the left and right of the
			// best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
			// we need to do a curve fit on correlations[] around best_offset in order to better determine precise
			// (anti-aliased) offset.

			// we know best_offset >=1,
			// since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
			// we can't drop into this clause until the following pass (else if).
			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate/best_offset;
	}
	return -1;
//	var best_frequency = sampleRate/best_offset;
}
var notes =  new Array;
var count = 0;
var a = new Array;
var time_array = new Array;
var tmp = 0;
var tmp_time = 0;
var init_time =0;
function updatePitch( time ) {
	if ( count > 0 && tmp_time-init_time > theBuffer.duration*1000-2000)
	{


		return;
	}
	var cycles = new Array;
	analyser.getFloatTimeDomainData( buf );
	var ac = autoCorrelate( buf, audioContext.sampleRate );
	// TODO: Paint confidence meter on canvasElem here.
	if (DEBUGCANVAS) {  // This draws the current waveform, useful for debugging
		waveCanvas.clearRect(0,0,512,256);
		waveCanvas.strokeStyle = "red";
		waveCanvas.beginPath();
		waveCanvas.moveTo(0,0);
		waveCanvas.lineTo(0,256);
		waveCanvas.moveTo(128,0);
		waveCanvas.lineTo(128,256);
		waveCanvas.moveTo(256,0);
		waveCanvas.lineTo(256,256);
		waveCanvas.moveTo(384,0);
		waveCanvas.lineTo(384,256);
		waveCanvas.moveTo(512,0);
		waveCanvas.lineTo(512,256);
		waveCanvas.stroke();
		waveCanvas.strokeStyle = "black";
		waveCanvas.beginPath();
		waveCanvas.moveTo(0,buf[0]);
		for (var i=1;i<512;i++) {
			waveCanvas.lineTo(i,128+(buf[i]*128));
		}
		waveCanvas.stroke();
	}

 	if (ac == -1) {
 		detectorElem.className = "vague";
	 	pitchElem.innerText = "--";
		noteElem.innerText = "-";
		detuneElem.className = "";
		detuneAmount.innerText = "--";
 	} else {
	 	detectorElem.className = "confident";
	 	pitch = ac;
	 	if (count ==0)
	 	{
	 		if ( pitch > 1000)
	 		{
	 			tmp = 500;
	 		}
	 		else
	 		{
	 			tmp = pitch;
	 		}
	 		init_time = time;
	 		tmp_time =time;
	 		a.push(tmp);
	 		time_array.push(0);
	 	}

	 	else if (count==1)
	 	{
	 		tmp = pitch;
	 		tmp_time = time;
	 	}
	 	else if (tmp>1000)
	 	{
	 		average_a = 0;
	 		a_length = a.length;
	 		for ( i = 0 ; i < a_length ; i ++)
	 		{
	 			average_a = average_a + a[i];
	 		}
	 		a.push(average_a/a_length);

	 		time_array.push(Math.round((tmp_time-init_time)/10) / 100);
	 		tmp = pitch;
	 		tmp_time = time;
	 	}
	 	else if (Math.abs(tmp- pitch) > 150 && Math.abs(tmp - a[a.length-1]) > 150)
	 	{
	 		tmp = (a[a.length-1]+pitch)/2;
	 		a.push(tmp);
	 		time_array.push(Math.round((tmp_time-init_time)/10) / 100);
	 		tmp = pitch;
	 		tmp_time = time;
	 	}
	 	else
	 	{
	 		a.push(tmp);
	 		time_array.push(Math.round((tmp_time-init_time)/10) / 100);
	 		tmp = pitch;
	 		tmp_time = time;
	 	}
	 	count++;
	 	pitchElem.innerText = Math.round( time ) ;
	 	var note =  noteFromPitch( pitch );
		notes.push(noteStrings[note%12]);
		var detune = centsOffFromPitch( pitch, note );
		if (detune == 0 ) {
			detuneElem.className = "";
			detuneAmount.innerHTML = "--";
		} else {
			if (detune < 0)
				detuneElem.className = "flat";
			else
				detuneElem.className = "sharp";
			detuneAmount.innerHTML = Math.abs( detune );
		}
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	rafID = window.requestAnimationFrame( updatePitch );
}


var a1 = new Array;
var time_array1 = new Array;
var count1 = 0;
var tmp1 = 0;
var tmp_time1 = 0;
var init_time1 = 0;
function updatePitch1( time ) {

	var cycles = new Array;
	analyser1.getFloatTimeDomainData( buf1 );
	var ac = autoCorrelate( buf1, audioContext.sampleRate );
	// TODO: Paint confidence meter on canvasElem here.

	if (DEBUGCANVAS) {  // This draws the current waveform, useful for debugging
		waveCanvas.clearRect(0,0,512,256);
		waveCanvas.strokeStyle = "red";
		waveCanvas.beginPath();
		waveCanvas.moveTo(0,0);
		waveCanvas.lineTo(0,256);
		waveCanvas.moveTo(128,0);
		waveCanvas.lineTo(128,256);
		waveCanvas.moveTo(256,0);
		waveCanvas.lineTo(256,256);
		waveCanvas.moveTo(384,0);
		waveCanvas.lineTo(384,256);
		waveCanvas.moveTo(512,0);
		waveCanvas.lineTo(512,256);
		waveCanvas.stroke();
		waveCanvas.strokeStyle = "black";
		waveCanvas.beginPath();
		waveCanvas.moveTo(0,buf[0]);
		for (var i=1;i<512;i++) {
			waveCanvas.lineTo(i,128+(buf1[i]*128));
		}
		waveCanvas.stroke();
	}
	if ( count1 > 0 && time-init_time > theBuffer.duration*1000+5000)
	{
		
		return;
	}
	if ( count1 > 0 && time_array1[time_array1.length-1] >= (Math.round((tmp_time-init_time)/10) / 100))
	{
		ac =- 1;
	}
 	if (ac == -1) {
 		detectorElem.className = "vague";
	 	pitchElem.innerText = "--";
		noteElem.innerText = "-";
		detuneElem.className = "";
		detuneAmount.innerText = "--";
 	} else {
	 	detectorElem.className = "confident";
	 	pitch = ac;
	 	if (count1 ==0)
	 	{
	 		if ( pitch > 1000)
	 		{
	 			tmp1 = tmp;
	 		}
	 		else
	 		{
	 			tmp1 = pitch;
	 		}
	 		init_time1 = time;
	 		tmp_time1 =time;
	 		a1.push(tmp1);
	 		time_array1.push(0);
	 	}
	 	else if (count1==1)
	 	{
	 		tmp1 = pitch;
	 		tmp_time1 = time;
	 	}
	 	else if (tmp1>1000 )
	 	{
	 		average_a1 = 0;
	 		a1_length = a1.length;
	 		for ( i = 0 ; i < a1_length ; i ++)
	 		{
	 			average_a1 = average_a1 + a1[i];
	 		}
	 		a1.push(average_a1/a1_length);
	 		time_array1.push(Math.round((tmp_time-init_time)/10) / 100);
	 		tmp1 = pitch;
	 		tmp_time1 = time;
	 	}
	 	else if (Math.abs(tmp1- pitch) > 150 && Math.abs(tmp1 - a1[a1.length-1]) > 150)
	 	{
	 		tmp1 = (a1[a1.length-1]+pitch)/2;
	 		a1.push(tmp1);
	 		time_array1.push(Math.round((tmp_time-init_time)/10) / 100);
	 		tmp1 = pitch;
	 		tmp_time1 = time;
	 	}
	 	else
	 	{
	 		a1.push(tmp1);
	 		time_array1.push(Math.round((tmp_time-init_time)/10) / 100);
	 		tmp1 = pitch;
	 		tmp_time1 = time;
	 	}
	 	count1++;
	 	pitchElem.innerText = Math.round( time ) ;
	 	var note =  noteFromPitch( pitch );
		noteElem.innerHTML = noteStrings[note%12];
		var detune = centsOffFromPitch( pitch, note );
		if (detune == 0 ) {
			detuneElem.className = "";
			detuneAmount.innerHTML = "--";
		} else {
			if (detune < 0)
				detuneElem.className = "flat";
			else
				detuneElem.className = "sharp";
			detuneAmount.innerHTML = Math.abs( detune );
		}
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	rafID = window.requestAnimationFrame( updatePitch1 );
}
function score_calculate(){
	var score_percentage = 0;
	var j = 0;
	var error1 = 0;
	for(i = 0 ; i < time_array.length ; i++)
	{
			if (time_array[i] == time_array1[j])
			{
				if ( Math.abs(a[i] - a1[j]) <= 50)
				{
					error1 = error1 + (Math.abs(a[i] - a1[j]));
				}
				else
				{
					error1 = error1 + 50;
				}
				j = j + 1;
			}
			else
			{
				if ( Math.abs(a[i] - a1[j]) <= 50)
				{
					error1 = error1 + (Math.abs(a[i] - a1[j]));
				}
				else
				{
					error1 = error1 + 50;
				}
			}
		}
	return score_percentage = (1-(error1/50)/time_array.length)*100;
}


function sendScore(score){
    var data = {'score': score};
    $.post(url, data, function(response){
        if(response === 'success'){ setTimeout(function() {alert('Your score is ' + score);}, 1000) }
        else{ alert('Error! 😞'); }
    });
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function setup() {$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
})};
