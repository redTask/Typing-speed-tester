
    var samples = [
      {name: "Default", text: "The quick brown fox jumps over the lazy dog."},
      {name: "Sentences", text: "Practice typing. Accuracy beats speed at first."},
      {name: "Short", text: "Sphinx of black quartz, judge my vow."}
    ];

    var targetEl = document.getElementById('target');
    var typingEl = document.getElementById('typing');
    var durationEl = document.getElementById('duration');
    var timeEl = document.getElementById('time');
    var statusEl = document.getElementById('status');
    var wpmEl = document.getElementById('wpm');
    var accEl = document.getElementById('acc');
    var errsEl = document.getElementById('errs');

    var nextBtn = document.getElementById('next');
    var restartBtn = document.getElementById('restart');
    var finishBtn = document.getElementById('finish');

    var sampleIndex = 0;
    var chars = [];      
    var typed = "";      
    var timerId = null;   
    var startTime = null;
    var remaining = parseInt(durationEl.value, 10) || 30;
    var running = false;
    var totalTyped = 0;
    var errors = 0;


    function loadSample(i) {
      sampleIndex = i % samples.length;
      var text = samples[sampleIndex].text;

      chars = [];
      for (var j=0; j<text.length; j++){
        chars.push({ch: text.charAt(j), state: 'untouched'});
      }
      renderTarget(0);
      resetState(true);
    }

    function renderTarget(cursorIndex) {
      targetEl.innerHTML = "";
      for (var i=0; i<chars.length; i++){
        var span = document.createElement('span'); 
        span.className = 'char ' + (chars[i].state === 'untouched' ? '' : chars[i].state);
        if (running && i === cursorIndex) {
          span.className += ' current';
        }
        span.textContent = chars[i].ch;
        targetEl.appendChild(span);
      }
    }


    function resetState(stopTimer) {
      typed = "";
      typingEl.value = "";
      totalTyped = 0;
      errors = 0;
      running = false;
      startTime = null;
      remaining = parseInt(durationEl.value, 10) || 30;
      timeEl.textContent = remaining + "s";
      statusEl.textContent = "Status: Idle";
      if (stopTimer && timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
  
      for (var i=0;i<chars.length;i++) chars[i].state = 'untouched';
      updateStats();
      renderTarget(0);
    }

    function startTimer() {
      if (running) return;
      running = true;
      startTime = Date.now();
      statusEl.textContent = "Status: Running";

      timerId = setInterval(function(){
        var elapsed = Math.floor((Date.now() - startTime)/1000);
        var total = parseInt(durationEl.value,10) || 30;
        var left = total - elapsed;
        if (left <= 0) {
          finishTest();
          left = 0;
        }
        remaining = left;
        timeEl.textContent = left + "s";
        updateStats();
      }, 250);
    }
    function finishTest() {
      if (timerId !== null) {
        clearInterval(timerId); timerId = null;
      }
      running = false;
      statusEl.textContent = "Status: Finished";
      updateStats(true);
    }

    function updateStats(final) {
      var elapsedSec;
      if (final) {
        var totalDuration = parseInt(durationEl.value,10) || 30;
        elapsedSec = totalDuration - remaining;
        if (elapsedSec <= 0) elapsedSec = 1;
      } else {
        if (!startTime) elapsedSec = 1; else elapsedSec = Math.max(1, (Date.now() - startTime)/1000);
      }

      var minutes = Math.max(elapsedSec / 60, 1/60);
      var grossWPM = Math.round((totalTyped / 5) / minutes); 
      var accuracy = totalTyped === 0 ? 100 : Math.round(((totalTyped - errors) / totalTyped) * 100);

      wpmEl.textContent = isFinite(grossWPM) ? grossWPM : 0;
      accEl.textContent = accuracy + "%";
      errsEl.textContent = errors;
    }

    function handleTyping() {
      if (!running) startTimer();

      typed = typingEl.value;
      totalTyped = typed.length;

      errors = 0;
      for (var i=0; i<chars.length; i++){
        var expected = chars[i].ch;
        var given = typed.charAt(i);
        if (given === "") {
          chars[i].state = 'untouched';
        } else if (given === expected) {
          chars[i].state = 'correct';
        } else {
          chars[i].state = 'wrong';
          errors++;
        }
      }
      if (typed.length > chars.length) {
        errors += (typed.length - chars.length);
      }

      var cursor = Math.min(typed.length, Math.max(0, chars.length-1));
      renderTarget(cursor);
      updateStats();
    }
    typingEl.addEventListener('input', handleTyping);

    nextBtn.addEventListener('click', function(){
      loadSample((sampleIndex + 1) % samples.length);
      typingEl.focus();
    });

    restartBtn.addEventListener('click', function(){
      resetState(true);
      typingEl.focus();
    });

    finishBtn.addEventListener('click', function(){
      finishTest();
    });

    durationEl.addEventListener('change', function(){
      var v = parseInt(durationEl.value,10) || 30;
      if (v < 10) v = 10;
      durationEl.value = v;
      remaining = v;
      timeEl.textContent = v + "s";
    });

    loadSample(0);

    console.log("Simple Typing Tester ready. Samples loaded:", samples.length);