/*
  Countdown Timer Component

  Usage:
    <countdown-timer
     :date="2024-11-11"
     :topCaption="Top"
     :bottomCaption="Bottom"
     :type="minimal"
    ></countdown-timer>
 */

class CountdownTimer extends CustomElement {

  props = {
    date: "",
    heading: "",
    caption: "",
    type: "full",
    pattern: "dd:hh:mm:ss",
  };

  SECONDS_PER_MINUTE = 60;
  SECONDS_PER_HOUR = 60 * this.SECONDS_PER_MINUTE; // 3,600 seconds;
  SECONDS_PER_DAY = 24 * this.SECONDS_PER_HOUR; // 86,400 seconds;

  get timeUnits() {
    return [
      {
        notations: ["D", "DD", "d", "dd"],
        label: "days",
        delta: this.SECONDS_PER_DAY,
        specifier: "dd",
      },
      {
        notations: ["H", "HH", "h", "hh"],
        label: "hours",
        delta: this.SECONDS_PER_HOUR,
        specifier: "hh",
      },
      {
        notations: ["M", "MM", "m", "mm"],
        label: "minutes",
        delta: this.SECONDS_PER_MINUTE,
        specifier: "mm",
      },
      {
        notations: ["S", "SS", "s", "ss"],
        label: "seconds",
        delta: 1,
        specifier: "ss",
      },
    ];
  }

  get format() {
    return this.parseUnits(this.props.pattern);
  }

  constructor() {
    super();
  }

  template() {
    super.template();

    const { heading, caption } = this.props;

    return `
           ${heading ? `<div class="timer-content rtf-viewer">${heading}</div>` : ""}
           
           <div class="timer"></div>
          
            ${caption ? `<div class="timer-content timer-caption rtf-viewer">${caption}</div>` : ""}
        `;
  }

  beforeMount() {
    if (!this.$el.attr(":type")) this.$el.attr(":type", this.props.type);
  }

  mounted() {
    super.mounted();

    const { date } = this.props;

    const startTime = Date.now();
    const endTime = new Date(date.replace(" ", "T"));

    let delta = (endTime - startTime) / 1000;

    this.tick(delta);
  }

  parseUnits(pattern) {
    if (!pattern) return Object.values(this.timeUnits);

    return pattern.split(":").reduce((acc, timeSpecifier) => {
      const foundUnit = this.timeUnits.find(({ notations }) => notations.includes(timeSpecifier));

      if (foundUnit) acc.push({
        ...foundUnit,
        specifier: timeSpecifier,
      });

      return acc;
    }, []);
  }

  tick(delta) {
    if (!delta || delta < 0) {
      this.$el.remove();
      return;
    }
    const { minimal } = this.props;

    const timeParts = this.getTimeParts(delta);

    timeParts.forEach(this.renderTimeUnit.bind(this));

    setTimeout(() => this.tick(delta - 1), 1000);
  }

  getTimeParts(delta) {
    return this.format.map((unit) => {
      const unitValue = Math.floor(delta / unit.delta);

      delta -= unitValue * unit.delta;

      return {
        ...unit,
        label: unit.label,
        value: unitValue,
      };
    });
  }

  renderTimeUnit(unit) {
    const $timer = this.$el.find(".timer");

    const $foundUnitDisplay = $timer.find(`[\\:specifier="${unit.specifier}"]`);

    if (!!$foundUnitDisplay.length) {
      $foundUnitDisplay.find(".digit").text(unit.value);
      return;
    }

    $timer.append(` <div :specifier="${unit.specifier}" class="time-display">
      <p class="digit">${unit.value}</p>
      <p class="label">${unit.label}</p>
    </div>`);
  }
}

customElements.define("countdown-timer", CountdownTimer);
