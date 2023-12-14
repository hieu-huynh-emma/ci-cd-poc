class CountdownTimer extends CustomElement {

    props = {
        targetDate: "",
        title: "",
        minimal: false,
        size: ''
    }

    constructor() {
        super();
    }

    template() {
        super.template();

        const {title, minimal} = this.props


        return `
           ${title ? `<p class="paragraph-14 font-semibold text-white md:text-black">${title}</p>` : ""}
           <div class="timer-display${minimal? " is-minimal": ""}">
              <div class="time-part">
                <p class="digit"></p>
                <p class="label">Days</p>
              </div>
              <div class="time-part">
                <p class="digit"></p>
                <p class="label">Hours</p>
              </div>
              <div class="time-part">
                <p class="digit"></p>
                <p class="label">Minutes</p>
              </div>
              <div class="time-part">
                <p class="digit"></p>
                <p class="label">Seconds</p>
              </div>
           </div>
        `
    }

    tick(delta) {
        if (delta < 0) {
            this.$el.remove();
            return
        }
        const {minimal} = this.props

        const timeParts = getTimeParts(delta)

        if(minimal) {
            const partLabels = ['days', 'hours', 'minutes', 'seconds'];

            $(this).find('.timer-display').html(timeParts.map((digit, i) => `<div><b>${digit}</b> ${partLabels[i]}</div>`).join(' '))
        }
        else {
            this.$el.find(".time-part").each(function (i) {

                $(this).find(".digit").text(timeParts[i])
            })
        }

    }

    mounted() {
        super.mounted();

        const {targetDate} = this.props;

        const startTime = Date.now();
        const endTime = new Date(targetDate.replace(' ', 'T'));

        let delta = (endTime - startTime) / 1000;

        this.tick(delta)

        setInterval(() => {
            delta -= 1;
            this.tick(delta)
        }, 1000);
    }


}

customElements.define('countdown-timer', CountdownTimer);
