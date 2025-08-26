class CookieConsentBar extends HTMLElement {
    constructor() {
        super();
        this.button = this.querySelector('#cookie-consent-button')
        this.bar = this.querySelector('#cookie-consent-bar')
    }

    connectedCallback() {
        const hasConsent = localStorage.getItem('emmaCookieConsent')
        if (!hasConsent) this.bar.classList.remove('hidden')
        this.button.addEventListener('click', this.handleClick.bind(this));
    }

    disconnectedCallback() {
        this.button.removeEventListener('click', this.handleClick.bind(this));
    }

    handleClick(event) {
        localStorage.setItem('emmaCookieConsent', "accepted")
        this.bar.classList.add('hidden')
    }
}

customElements.define('cookie-consent-bar', CookieConsentBar);
