class AnnouncementBarCountdownTimer extends HTMLElement {
    constructor() {
        super();
        this.currentLanguage = document.querySelector('html').getAttribute('lang')
        this.countdownSlide = document.querySelector('.announcement-bar-wrapper .countdown-slide')
        this.timer = this.querySelector('#countdown-timer');
        this.message = this.querySelector('#announcement-message');
        this.endTime = this.getAttribute('end-time')
        this.timerText = this.getAttribute('timer-text')
    }

    connectedCallback() {
        this.startCountdown()
    }

    disconnectedCallback() {}

    startCountdown() {
        const intervalReference = setInterval(() => {
            const delta = (new Date(this.endTime) - Date.now()) / 1000;
            if (delta >= 0) {
                this.render(calculateCountdownTime(this.endTime))
            } else {
                this.countdownSlide.remove()
                clearInterval(intervalReference)
            }
        }, 1000)
    }

    render(time) {
        const { days, hours, minutes, seconds } = time;
        this.message.innerHTML = `${this.timerText}&nbsp;`;
        this.timer.innerHTML =
            this.currentLanguage === 'en'
                ? `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`
                : `${days} jours ${hours} heures ${minutes} minutes ${seconds} secondes`;
    }
}

customElements.define('announcement-bar-countdown-timer', AnnouncementBarCountdownTimer);


$(document).ready(function () {
    announcementBarSlide()
    announcementBarCountdown()
});

function announcementBarCountdown() {
    const timer = document.getElementById('countdown-timer');
    const message = document.getElementById('announcement-message');
    const currentLanguage = $('html').attr('lang');

    function getEndTime() {
        return new Date('{{ end_time }}').getTime();
    }

    function format(t) {
        return t < 10 ? '0' + t : t;
    }

    function render(time) {
        const { days, hours, minutes, seconds } = time;
        message.innerHTML = `{{ timer_text }}&nbsp;`;
        timer.innerHTML =
            currentLanguage === 'en'
                ? `${format(days)} days ${format(hours)} hours ${format(minutes)} minutes ${format(seconds)} seconds`
                : `${format(days)} jours ${format(hours)} heures ${format(minutes)} minutes ${format(seconds)} secondes`;
    }

    function complete() {
        message.innerHTML = `{{ text }}`;
        timer.style.display = 'none';
    }

    const countdownTimer = new Countdown(getEndTime(), render, complete);
}
function announcementBarSlide() {
    new Splide('.announcement-bar-wrapper .splide', {
        pagination: false,
        autoplay: true,
        rewind: true,
        interval: 8000,
        perPage: 1,
        perMove: 1,
        pauseOnHover: false,
        pauseOnFocus: false,
    }).mount();
}
