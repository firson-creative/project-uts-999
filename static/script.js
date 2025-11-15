document.addEventListener('DOMContentLoaded', () => {
    let sortState = {
        jadwal: 'asc',
        tugas: 'asc'
    };

    window.toggleSort = function(type) {
        sortState[type] = sortState[type] === 'asc' ? 'desc' : 'asc';
        if (type === 'jadwal') sortJadwal(sortState[type]);
        else if (type === 'tugas') sortTugas(sortState[type]);
    };

    function sortJadwal(direction) {
        const tbody = document.querySelector('#jadwal-display tbody');
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.querySelector('td'));
        const hari_urutan = {'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6};
        rows.sort((a, b) => {
            const order_a = hari_urutan[a.cells[2].textContent.trim()] || 7;
            const order_b = hari_urutan[b.cells[2].textContent.trim()] || 7;
            let result = order_a - order_b;
            if (result === 0) result = a.cells[3].textContent.split(' - ')[0].localeCompare(b.cells[3].textContent.split(' - ')[0]);
            return direction === 'asc' ? result : -result;
        });
        rows.forEach(row => tbody.appendChild(row));
    }

    function sortTugas(direction) {
        const tbody = document.querySelector('#tugas-display tbody');
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.querySelector('td'));
        rows.sort((a, b) => {
            const deadline_a = new Date(a.cells[3].querySelector('.countdown').dataset.deadline);
            const deadline_b = new Date(b.cells[3].querySelector('.countdown').dataset.deadline);
            return direction === 'asc' ? deadline_a - deadline_b : deadline_b - deadline_a;
        });
        rows.forEach(row => tbody.appendChild(row));
    }

    const timerDisplay = document.getElementById('timer-display');
    const statusDisplay = document.getElementById('pomodoro-status');
    const startPomodoroBtn = document.getElementById('start-pomodoro');
    const startShortBreakBtn = document.getElementById('start-short-break');
    const startLongBreakBtn = document.getElementById('start-long-break');
    const cancelTimerBtn = document.getElementById('cancel-timer');

    // Only run the inline timer logic when the timer elements exist (index.html no longer contains timer)
    if (timerDisplay) {
        let timerInterval = null;
        let secondsRemaining = 25 * 60;

        function startTimer(durationMinutes, mode) {
            clearInterval(timerInterval);
            secondsRemaining = durationMinutes * 60;
            statusDisplay.textContent = `Mode: ${mode}`;
            updateDisplay();

            timerInterval = setInterval(() => {
                secondsRemaining--;
                updateDisplay();

                if (secondsRemaining <= 0) {
                    clearInterval(timerInterval);
                    statusDisplay.textContent = "Mode: Selesai!";
                    timerDisplay.textContent = "00:00";
                    alert("Waktu Habis!");
                }
            }, 1000);
        }

        function updateDisplay() {
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = secondsRemaining % 60;
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        function cancelTimer() {
            clearInterval(timerInterval);
            secondsRemaining = 25 * 60;
            updateDisplay();
            statusDisplay.textContent = "Mode: Dibatalkan";
        }

        if(startPomodoroBtn) startPomodoroBtn.addEventListener('click', () => startTimer(25, 'Belajar'));
        if(startShortBreakBtn) startShortBreakBtn.addEventListener('click', () => startTimer(5, 'Istirahat Singkat'));
        if(startLongBreakBtn) startLongBreakBtn.addEventListener('click', () => startTimer(15, 'Istirahat Panjang'));
        if(cancelTimerBtn) cancelTimerBtn.addEventListener('click', cancelTimer);

        updateDisplay();
    }

    const countdownElements = document.querySelectorAll('.countdown');

    countdownElements.forEach(element => {
        const deadlineISO = element.dataset.deadline;
        if (!deadlineISO) return;

        const deadlineDate = new Date(deadlineISO);

        const countdownInterval = setInterval(() => {
            const now = new Date();
            const remaining = deadlineDate - now;

            if (remaining <= 0) {
                element.textContent = "DEADLINE LEWAT";
                element.style.color = "#c94c4c";
                element.style.fontWeight = "bold";
                clearInterval(countdownInterval);
            } else {
                const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

                if (days > 0) {
                    element.textContent = `${days}h ${hours}j ${minutes}m`;
                } else if (hours > 0) {
                    element.textContent = `${hours}j ${minutes}m ${seconds}d`;
                    element.style.color = "#E67E22";
                } else {
                    element.textContent = `${minutes}m ${seconds}d`;
                    element.style.color = "#c94c4c";
                }
            }
        }, 1000);
    });
});