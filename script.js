//circle start
let progressBar = document.querySelector('.e-c-progress');
let indicator = document.getElementById('e-indicator');
let pointer = document.getElementById('e-pointer');
let length = Math.PI * 2 * 100;

progressBar.style.strokeDasharray = length;

function update(value, timePercent) {
	var offset = - length - length * value / (timePercent);
	progressBar.style.strokeDashoffset = offset; 
	pointer.style.transform = `rotate(${360 * value / (timePercent)}deg)`; 
};

//circle ends
const displayOutput = document.querySelector('.display-remain-time')
const pauseBtn = document.getElementById('pause');
const setterBtns = document.querySelectorAll('button[data-setter]');

let intervalTimer;
let alarmTimer;
let timeLeft;
let remainTime;
let wholeTime = 5 * 60; // manage this to set the whole time 
let isPaused = false;
let isStarted = false;
let sound = {};

update(wholeTime,wholeTime); //refreshes progress bar
displayTimeLeft(wholeTime);
initAlarm();
playSound('');

function initAlarm() {
  alarmTimer = setInterval(function() {
    
      var xhr = new XMLHttpRequest();
      xhr.open("GET", 'https://68.183.76.12/countdown/pong', true);
      xhr.setRequestHeader('Pragma', 'no-cache');
      xhr.onload = function() {
        if (xhr.status && xhr.response == 'true' && isStarted && !isPaused) {
          playSound('alarm.wav');
          sound.play();
        }
      };
      xhr.send();
  }, 8000)
}

function playSound(src) {
  sound = document.querySelector("audio");
  if (!sound) {
    sound = document.createElement("audio");
  }
  sound.src = src;
  sound.setAttribute("preload", "auto");
  sound.setAttribute("controls", "none");
  sound.style.display = "none";
  document.body.appendChild(sound);
}

function changeWholeTime(seconds){
  if ((wholeTime + seconds) > 0){
    wholeTime += seconds;
    update(wholeTime,wholeTime);
  }
}

for (var i = 0; i < setterBtns.length; i++) {
    setterBtns[i].addEventListener("click", function(event) {
        var param = this.dataset.setter;
        switch (param) {
            case 'minutes-plus':
                changeWholeTime(1 * 60);
                break;
            case 'minutes-minus':
                changeWholeTime(-1 * 60);
                break;
            case 'seconds-plus':
                changeWholeTime(1);
                break;
            case 'seconds-minus':
                changeWholeTime(-1);
                break;
            case 'five-minutes':
              sound.pause();
              changeWholeTime(5*60);
              remainTime += 5*60*1000;
              break;
            case 'ten-minutes':
              sound.pause();
              changeWholeTime(10*60);
              remainTime += 10*60*1000;
              break;
            case 'reset':
              sound.pause();
              clearInterval(intervalTimer);
              isStarted = false;
              isPaused = false;
              pauseBtn.classList.remove('pause');
              pauseBtn.classList.add('play');
              wholeTime = 5*60;
              timeLeft = wholeTime;
              update(wholeTime,wholeTime);
              break;
        }
      displayTimeLeft(wholeTime);
    });
}

function timer (seconds){ //counts time, takes seconds
  remainTime = Date.now() + (seconds * 1000);
  displayTimeLeft(seconds);
  
  intervalTimer = setInterval(function(){
    timeLeft = Math.round((remainTime - Date.now()) / 1000);
    if (timeLeft === 8)
    {
      playSound('timesup.wav');
      sound.play();
    }
    if(timeLeft < 0){
      clearInterval(intervalTimer);
      isStarted = false;
      setterBtns.forEach(function(btn){
        btn.disabled = false;
        btn.style.opacity = 1;
      });
      displayTimeLeft(wholeTime);
      pauseBtn.classList.remove('pause');
      pauseBtn.classList.add('play');
      return ;
    }
    displayTimeLeft(timeLeft);
  }, 1000);
}

function pauseTimer(event){
  if(isStarted === false){
    timer(wholeTime);
    isStarted = true;
    pauseBtn.classList.remove('play');
    pauseBtn.classList.add('pause');

  }else if(isPaused){
    pauseBtn.classList.remove('play');
    pauseBtn.classList.add('pause');
    timer(timeLeft);
    sound.pause();
    isPaused = isPaused ? false : true
  }else{
    pauseBtn.classList.remove(pauseBtn.classList.value);
    pauseBtn.classList.add(isPaused ? 'pause' : 'play');
    clearInterval(intervalTimer);
    sound.pause();
    isPaused = isPaused ? false : true ;
  }
}

function displayTimeLeft (timeLeft) { //displays time on the input
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  let displayString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  displayOutput.textContent = displayString;
  update(timeLeft, wholeTime);
}

pauseBtn.addEventListener('click',pauseTimer);