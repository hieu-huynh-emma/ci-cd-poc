class Element extends HTMLElement {
    props = null;

    keepProps = true;

    _providers = [];


    static get observedAttributes() {
        return ["data"];
    }

    _value = null;
    get value() {
        return this._value;
    }

    set value(newVal) {
        if (newVal === this._value) return;
        this._value = newVal;

        this.onValueChange(newVal);
    }

    _loading = false;
    get loading() {
        return this._loading;
    }

    set loading(newVal) {
        if (newVal === this._loading) return;
        this._loading = newVal;
        this.onLoad(newVal);
    }


    _disabled = false;
    get disabled() {
        return this._disabled;
    }

    set disabled(isDisabled) {
        if (isDisabled === this._disabled) return;
        this._disabled = isDisabled;
        this.onDisabled(isDisabled);
    }

    _readOnly = false;
    get readOnly() {
        return this._readOnly;
    }

    set readOnly(isReadOnly) {
        if (isReadOnly === this._readOnly) return;
        this._readOnly = isReadOnly;
        this.onReadOnlyChanged(isReadOnly);
    }

    _fetching = false;
    get fetching() {
        return this._fetching;
    }

    set fetching(newVal) {
        if (newVal === this._fetching) return;
        this._fetching = newVal;
        this.onFetching(newVal);
    }

    onFetching(isFetching) {
        this.$el[!!isFetching ? "addClass" : "removeClass"]("is-fetching");

        const firstLoadingOverlays = this.$el.find("loading-overlay").first().get(0);

        if (!!firstLoadingOverlays && firstLoadingOverlays.show) {
            firstLoadingOverlays[isFetching ? "show" : "hide"]();
        }

        const loader = this.$el.find("loader-element").first().get(0);

        loader?.[isFetching ? "show" : "hide"]();


        this.dispatchEvent(new CustomEvent("fetching", {detail: {isFetching}}));
    }


    constructor() {
        super();
        this.$el = $(this);

        this.mutationObserver = new MutationObserver(this.onMutation.bind(this));
    }

    async connectedCallback() {
        this.created();
        this.extractProps();
        this._init();
        await this._postInit();

        this.beforeMount();
        this.render();

        setTimeout(() => {
            $(this).ready(this.mounted.bind(this));
        }, 0);
    }

    disconnectedCallback() {
        this.mutationObserver?.disconnect();

        this.onDestroy();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = this.parseProp(newValue);

        this.render();
    }

    _init() {
        if (!this.props) return;

        this._data = {...this.props};

        this.data = new Proxy(this._data, {
            set: (target, key, value) => {
                Reflect.set(target, key, value);
                this.render();
                return true;
            },
        });

        Object.keys(this.props).forEach((key) => {
            Object.defineProperty(this, key, {
                get: function () {
                    return this.data[key];
                },
                set: function (value) {
                    this.data[key] = value;
                },
                enumerable: true,
                configurable: true
            });
        });
    }

    async _postInit() {
        await this.injectingResources();

        this.setup?.(this.props);

        this.setupListeners?.(this.props);
    }

    injectingResources() {
        if (!this._providers && !this._providers.length) return Promise.resolve();

        return Promise.allSettled(this._providers.map(provider => ResourceCoordinator.requestVendor(provider)));
    }

    extractProps() {
        const isObject = typeof this.props === "object" && this.props !== null;

        if (!isObject) return;

        this.value = this.getAttribute(`:value`);

        this.readOnly = this.hasAttribute("readOnly") || this.getAttribute("readOnly") === "readOnly";

        this.props = Object.entries(this.props).reduce((r, [propName, defaultValue]) => {

            const attrName = `:${propName.toLowerCase()}`;
            const rawVal = this.getAttribute(attrName);


            r[propName] = this.parseProp(rawVal, defaultValue, propName);

            if (!this.keepProps) this.removeAttribute(attrName);

            return r;
        }, {});
    }

    parseProp(rawVal, defaultValue, propName) {
        let val;

        try {
            val = JSON.parse(decodeURIComponent(rawVal));
        } catch {
            val = rawVal;
        }

        switch (typeof defaultValue) {
            case "boolean":
                return (val === undefined || val === null) ? defaultValue : !!val;
            default:
                return val || defaultValue;
        }
    }

    created() {
    }

    beforeMount() {
        this.$el.addClass(`${this.tagName.toLowerCase()}`);
    }

    template() {
    }

    render() {
        if (this.template()) {
            this.innerHTML = this.template();

            this.onUpdated();
        }
    }

    mounted() {
    }

    onUpdated() {
    }

    onMutation() {
    }

    onDestroy() {
    }

    onValueChange() {
    }

    onLoad(isLoading) {
        this.$el[!!isLoading ? "addClass" : "removeClass"]("is-loading");

        const firstLoadingOverlays = this.$el.find("loading-overlay").first().get(0);

        if (!!firstLoadingOverlays) {
            firstLoadingOverlays[isLoading ? "show" : "hide"]();
        }

        this.disabled = isLoading;
    }

    onDisabled(isDisabled) {
        this.$el.attr("disabled", isDisabled);
    }


    onReadOnlyChanged(isReadOnly) {
        this.$el[!!isReadOnly ? "attr" : "removeAttr"]("readOnly", "readOnly");
    }
}

class Container extends Element {


}


class Button extends Element {

    $hyperlink;

    constructor() {
        super();
    }

    render() {
        super.render();

        const hasHyperlink = this.hasAttribute("href")

        if (hasHyperlink) {

            this.$el.addClass("cursor-pointer");

            this.renderHyperlink();
        }
    }

    renderHyperlink() {
        this.$hyperlink = $("<a></a>");

        [...this.attributes].forEach((attr) => {
            if (["download", "href", "hreflang", "media", "ping", "referrerpolicy", "rel", "target", "type"].includes(attr.name)) {
                this.$hyperlink.attr(attr.name, attr.value);
                this.removeAttribute(attr.name);
            }
        });

        this.$el.append(this.$hyperlink);

        this.$el.addClass("relative");
    }


    _init() {
        super._init();

        this.addEventListener("click", (event) => {
            if (this.disabled || this.readOnly) {
                event.stopPropagation();
                event.preventDefault();
                event.cancelBubble = true;
                event.stopImmediatePropagation();

                return false
            }

            console.log("clicked")
            this.onClick(event);
        });

        this.$el.addClass("cursor-pointer");
    }

    onClick(e) {
    }
}

customElements.define("button-block", Button);

