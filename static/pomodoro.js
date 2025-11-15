document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer-display');
    const statusDisplay = document.getElementById('pomodoro-status');
    const startPomodoroBtn = document.getElementById('start-pomodoro');
    const startShortBreakBtn = document.getElementById('start-short-break');
    const startLongBreakBtn = document.getElementById('start-long-break');
    const cancelTimerBtn = document.getElementById('cancel-timer');
    const saveBtn = document.getElementById('save-durations');
    const resetBtn = document.getElementById('reset-durations');

    const studyInput = document.getElementById('study-duration');
    const shortInput = document.getElementById('short-duration');
    const longInput = document.getElementById('long-duration');

    let timerInterval = null;
    let secondsRemaining = 0;

    const defaults = { study: 25, short: 5, long: 15 };

    // Tick sound from static file
    const tickAudio = new Audio('/static/tick.wav');
    tickAudio.volume = 0.5;

    function loadSettings() {
        const study = parseInt(localStorage.getItem('pomodoro_study')) || defaults.study;
        const short = parseInt(localStorage.getItem('pomodoro_short')) || defaults.short;
        const long = parseInt(localStorage.getItem('pomodoro_long')) || defaults.long;
        studyInput.value = study;
        shortInput.value = short;
        longInput.value = long;
        return { study, short, long };
    }

    function saveSettings() {
        localStorage.setItem('pomodoro_study', studyInput.value);
        localStorage.setItem('pomodoro_short', shortInput.value);
        localStorage.setItem('pomodoro_long', longInput.value);
    }

    function resetSettings() {
        localStorage.removeItem('pomodoro_study');
        localStorage.removeItem('pomodoro_short');
        localStorage.removeItem('pomodoro_long');
        const s = loadSettings();
        return s;
    }

    function startTimer(durationMinutes, mode) {
        clearInterval(timerInterval);
        secondsRemaining = Math.max(1, Math.floor(durationMinutes)) * 60;
        statusDisplay.textContent = `Mode: ${mode}`;
        updateDisplay();

        timerInterval = setInterval(() => {
            secondsRemaining--;
            updateDisplay();

            // Play tick sound during countdown (except last second)
            if (secondsRemaining > 0) {
                try {
                    tickAudio.currentTime = 0;
                    tickAudio.play().catch(() => {});
                } catch(e) {}
            }

            if (secondsRemaining <= 0) {
                clearInterval(timerInterval);
                statusDisplay.textContent = "Mode: Selesai!";
                timerDisplay.textContent = "00:00";
                try { window.navigator.vibrate && window.navigator.vibrate(200); } catch(e){}
            }
        }, 1000);
    }

    function updateDisplay() {
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        if (timerDisplay) timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function cancelTimer() {
        clearInterval(timerInterval);
        const s = loadSettings();
        secondsRemaining = s.study * 60;
        updateDisplay();
        statusDisplay.textContent = "Mode: Dibatalkan";
    }

    // init
    const settings = loadSettings();
    secondsRemaining = settings.study * 60;
    updateDisplay();

    if (startPomodoroBtn) startPomodoroBtn.addEventListener('click', () => startTimer(parseInt(studyInput.value || defaults.study), 'Belajar'));
    if (startShortBreakBtn) startShortBreakBtn.addEventListener('click', () => startTimer(parseInt(shortInput.value || defaults.short), 'Istirahat Singkat'));
    if (startLongBreakBtn) startLongBreakBtn.addEventListener('click', () => startTimer(parseInt(longInput.value || defaults.long), 'Istirahat Panjang'));
    if (cancelTimerBtn) cancelTimerBtn.addEventListener('click', cancelTimer);

    if (saveBtn) saveBtn.addEventListener('click', (e) => { e.preventDefault(); saveSettings(); statusDisplay.textContent = 'Pengaturan disimpan'; });
    if (resetBtn) resetBtn.addEventListener('click', (e) => { e.preventDefault(); resetSettings(); statusDisplay.textContent = 'Direset ke default'; });
});
