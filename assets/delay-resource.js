window.addEventListener("load", () => {
  setTimeout(() => {
    window.dispatchEvent(new Event("complete"));
  }, 100);
}, { once: true });

class DelayScript extends HTMLScriptElement {
  constructor() {
    super();


    this.type = "javascript/blocked";
  }

  connectedCallback() {
    const phase = this.getAttribute("phase") || "load";

    window.addEventListener(phase === "load" ? "DOMContentLoaded" : "FirstInteractive", () => {
      setTimeout(this.load.bind(this), 0);
    }, false);

    this.type = "javascript/blocked";
    this.setAttribute("metric", phase === "load" ? "fcp" : "fid");
  }

  load = () => {

    const script = document.createElement("script");

    Array.from(this.attributes).forEach((attr) => {
      if (!["type", "is", "metric", "url", "phase"].includes(attr.name)) {
        script.setAttribute(attr.name, this.getAttribute(attr.name));
      }
    });

    if (!script.src && !!this.hasAttribute("url")) script.src = this.getAttribute("url");

    script.innerHTML = this.innerHTML;

    script.onload = () => {
      this.dispatchEvent(new Event("load"));
    };

    this.replaceWith(script);
  };
}

customElements.define("delay-script", DelayScript, { extends: "script" });

class DelayStylesheet extends HTMLLinkElement {
  constructor() {
    super();

    window.addEventListener("DOMContentLoaded", () => {
      setTimeout(this.load, 0);
    });
  }

  connectedCallback() {
    this.rel = "";
  }

  load = () => {
    this.rel = "stylesheet";
  };
}

customElements.define("delay-stylesheet", DelayStylesheet, { extends: "link" });
