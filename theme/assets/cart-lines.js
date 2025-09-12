import {EVENTS} from "./data-constants.js";
import {cartLineUpdateTransformer} from "./cart.data-processor.js";

if (!customElements.get("cart-lines")) {
    class CartLines extends Element {
        lineTag = "cart-line";

        get refs() {
            return {
                lines: this.querySelectorAll("cart-line"),
            };
        }

        setup() {
        }

        setupListeners() {
            document.addEventListener(EVENTS.CART_LOADED, this.render.bind(this), {once: true});

            document.addEventListener(EVENTS.CART_LINE_ADDED, this.render.bind(this));

            this.addEventListener(EVENTS.CART_LINE_CHANGED, this.onLineChanged.bind(this));
        }

        template() {
            if (!window.Cart?.state) return "";

            const lines = window.Cart.state.lines;

            if (!lines || !lines.length) return "";

            return lines.map((_, i) => `
                <${this.lineTag} :index="${i}"></${this.lineTag}>
            `).join("");
        }

        async onLineChanged(e) {
            e.preventDefault();

            const cartLine = e.target;

            cartLine.fetching = true;

            const {action, line, quantity} = e.detail;

            switch (action) {
                case "update-quantity":
                    if (!quantity) {
                        await this.removeLine(line);
                        break;
                    }

                    const transformedLine = cartLineUpdateTransformer({
                        ...line,
                        quantity,
                    });

                    await window.Cart.update([transformedLine]);
                    break;
                case "remove":
                    await this.removeLine(line);
                    break;
                default:
                    break;

            }

            if (cartLine) {
                requestAnimationFrame(() => {
                    cartLine.fetching = false;
                });
            }

        }

        async removeLine(line) {
            const $lineEl = this.$el.find(`#${line.id}`);
            const $nextAllSiblings = $lineEl.nextAll();

            try {
                await window.Cart.removeSingle(line.gid);

                $lineEl.remove();
                $nextAllSiblings.each(function () {
                    this.index = this.index - 1;
                });
            } catch (e) {

            }

        }
    }

    customElements.define("cart-lines", CartLines);

    class CartLine extends Element {
        props = {
            index: 0,
        };

        schema = "";

        line = null;

        get refs() {
            return {
                removeBtn: this.querySelector("line-remove-button"),
                quantityAdjuster: this.querySelector("quantity-adjuster"),
                // variantSelector: this.querySelector("cart-variant-selector"),
            };
        }

        async setup() {
            this.onCartUpdated();
        }

        setupListeners() {
            document.addEventListener(EVENTS.CART_UPDATED, this.onCartUpdated.bind(this), {capture: true});

            this.addEventListener("change", (e) => {
                e.preventDefault();

                const action = e.target.tagName.toLowerCase() === "quantity-adjuster" ? "update-quantity" : "remove";

                this.dispatchEvent(new CustomEvent(EVENTS.CART_LINE_CHANGED, {
                    bubbles: true,
                    detail: {
                        action,
                        line: this.line,
                        quantity: e.target.value,
                    },
                }));
            });
        }

        onCartUpdated() {
            const state = window.Cart.state.lines[this.index];

            if (!state) return;

            const schema = `${state.quantity}:${state.id}:${JSON.stringify(state.discount.allocations)}`;

            const prevLine = this.line;
            this.line = state;
            this.$el.attr("type", this.line.type);

            if (!prevLine || !prevLine.id) {
                this.id = `${state.id}`;

                this.render();
            } else if (this.schema !== schema) {
                this.schema = schema;

                setTimeout(this.update.bind(this), 45);
            }
        }

        render() {
            super.render();
            this.renderPricing();

            this.renderComposite();
        }

        template() {
            if (!this.line) return;

            const {
                gid,
                discount: {allocations},
                merchandise: {product: {title: productTitle, url}, title: variantTitle, featuredImage},
                note,
            } = this.line;

            return `
                    <picture-tag      
                        slot="picture" 
                        class="line-media"
                        :src="${featuredImage.url}"
                        :placeholderWidth="500"
                        :fit="cover"
                    ></picture-tag>

                    <div slot="product-details" class="line-product-details">
                        <div slot="name-tag" class="line-name-tag">
                            <a href="${url}" slot="product-name" class="product-name font-semibold">
                                ${productTitle}
                            </a>
                        </div>
                        
                          ${variantTitle !== "Default Title" ? `<div slot="variant-name" class="variant-name paragraph-14">
                            ${variantTitle}
                        </div>` : ""}
                        
                          <coupon-viewer slot="coupon-viewer" :variant="minimal" :removable="false" :allocations="${encodeURIComponent(JSON.stringify(allocations))}"></coupon-viewer>
          
                        
                        <div slot="description" class="line-description">${note ? `<span>${note}</span>` : ""}</div>
                    </div>
                
                  <div slot="quantity-adjuster">${this.getQuantityAdjusterSlot()}</div>
                
                    <div slot="pricing">
                        <div class="pricing-container">
                            <loader-element :type="skeleton"></loader-element>  
                            <div class="pricing-content"></div>
                        </div>
                    </div>
                    
                    <div slot="remove-button">
                         ${!gid ? "" : `
                             <tracked-button :trackId="Delete_cart_ver">
                                <line-remove-button :label="Remove"></line-remove-button>
                            </tracked-button>
                        `}
                    </div>
                      `;
        }

        discountTemplate() {

        }

        compositeTemplate() {
            if (!this.line || this.line.type !== "composite") return "";

            const {lineComponents, quantity, merchandise: {id}} = this.line;

            const otherLineComps = lineComponents.filter(({merchandise: {id: targetId}}) => targetId !== id);

            return `
                <div slot="composite-trigger" class="composite-trigger">
                          <span><span class="composite-trigger__action">Show</span> details</span>
                        
                           <svg xmlns="http://www.w3.org/2000/svg" class="plus" width="14" height="14" viewBox="0 0 160 160">
                              <rect class="vertical-line" x="70" width="20" height="160"/>
                              <rect class="horizontal-line" y="70" width="160" height="20"/>
                           </svg>
                        </div>
                <div slot="composite" class="line-composite">
                     
                    <div class="composite-content">
                        ${otherLineComps.map((lineComponent) => {
                const {
                    merchandise: {
                        product: {title: productTitle, metafields},
                        title: variantTitle,
                        url,
                        featuredImage,
                    },
                    cost: {total, subtotal},
                    discount: {totalDiscount},
                } = lineComponent;
                const componentQty = (metafields["bundle_quantity"] || 1);
                const compositeQty = componentQty * quantity;


                return `
                        <div class="line-component">
<!--                            <div slot="quantity-badge" data-quantity="${componentQty}">${compositeQty}</div>-->
                            <picture-tag      
                                slot="picture" 
                                class="line-media"
                                :src="${featuredImage.url}"
                                :placeholderWidth="500"
                                :fit="cover"
                            ></picture-tag>
        
                            <div slot="product-details" class="line-product-details">
                                <div slot="name-tag" class="line-name-tag">
                                    <a href="${url}" slot="product-name" class="product-name font-semibold">
                                        ${productTitle}
                                    </a>
                                </div>
                                
                                ${variantTitle !== "Default Title" ? `<div slot="variant-name" class="variant-name paragraph-14">
                                  <span class="font-semibold">Size:</span> ${variantTitle}
                                </div>` : ""}
      
                            </div>
                            
                           ${!total?.amount ? `<div slot="pricing" class="flex gap-2 text-right h-fit items-center">
                                 ${(totalDiscount) ? `
                                     <s class="text-comet text-xs">
                                        ${subtotal.formatted}
                                     </s>
                                ` : ``}
                                    <strong class="text-scarlet font-bold">
                                        ${(total?.amount) ? total.formatted : "FREE"}
                                    </strong>        
                                </div>` : ""}
                           
                        </div>
                    `;
            }).join("")}
                    </div>
                </div>
            `;
        }

        async renderComposite() {

            const template = this.compositeTemplate();

            if (!template) return "";

            await ResourceCoordinator.requestVendor("Beefup");

            this.$el.find(`[slot="composite-trigger"], [slot="composite"]`).remove();


            this.$el.append(template);

            requestAnimationFrame(() => {
                const beefup = $(this).beefup({
                    trigger: ".composite-trigger",
                    content: ".composite-content",
                    openSpeed: 250,
                    closeSpeed: 250,
                    stayOpen: "last",
                    openSingle: true,
                    onOpen: ($el) => $el.find(".composite-trigger__action").text("Hide"),
                    onClose: ($el) => $el.find(".composite-trigger__action").text("Show"),
                });

                beefup.open();
            });

            const {lineComponents, merchandise: {id}} = this.line;

            const anchorLineComp = lineComponents.find((({merchandise: {id: targetId}}) => targetId === id));

            const $productNameSlot = this.$el.find(`> [slot="product-details"] [slot="product-name"]`);

            $productNameSlot.text(anchorLineComp.attributes["_bundleTitle"]);
        }

        getQuantityAdjusterSlot() {

            return !this.line.gid ? "" : `
                <quantity-adjuster
                
                    :index="${this.index}"
                    :value="${this.line.quantity}"
                    :inventoryPolicy="${this.line?.variant?.inventory_policy}"
                    :min="0"
                    :max="${this.line?.variant?.inventory_quantity}"
                ></quantity-adjuster>
            `;
        }

        update() {
            this.renderPricing();

            this.updateQuantity();

            this.updateCoupon();

            // this.updateComposite();
        }

        onFetching(isFetching) {
            this.disabled = isFetching;

            const loader = this.querySelector("[slot='pricing'] loader-element");

            loader[isFetching ? "show" : "hide"]();
        }

        renderPricing() {
            if (!this.line) return;

            const $pricingEl = this.$el.find("[slot='pricing'] .pricing-content");
            const {
                cost: {
                    subtotal,
                    total,
                },
                discount: {totalDiscount},
            } = this.line;

            $pricingEl.html(`
                    ${(totalDiscount)
                ? `<s class="cart-pricing__price cart-pricing__price--original">${subtotal.formatted}</s> `
                : ""
            }
                    <strong class="cart-pricing__price">${(total.amount) ? total.formatted : "FREE"}</strong>         
            `);

            this.querySelector(`[slot="pricing"] loader-element`).hide()
        }

        updateQuantity() {
            if (!this.line) return;

            const $qtyAdjuster = this.$el.find("quantity-adjuster");

            if (!$qtyAdjuster.length) return;

            $qtyAdjuster.get(0)?.onValueChange?.(this.line.quantity);
        }

        updateCoupon() {

            const $couponViewer = this.$el.find("coupon-viewer");
            if (!$couponViewer.length) return;

            $couponViewer.get(0).allocations = this.line.discount.allocations;
        }

        // updateComposite() {
        //     const $compositeSlot = this.$el.find("[slot='composite']");
        //     if (!$compositeSlot.length) return;
        //
        //     Array.from($compositeSlot.find(`[slot="quantity-badge"]`)).forEach((el) => {
        //         const $el = $(el);
        //         $el.text(+$el.data("quantity") * this.line.quantity);
        //     });
        // }


        onDisabled(isDisabled) {
            super.onDisabled(isDisabled);

            const {removeBtn, quantityAdjuster} = this.refs;

            removeBtn.disabled = quantityAdjuster.disabled = isDisabled;

        }
    }

    customElements.define("cart-line", CartLine);

    customElements.define("cart-drawer-lines", class CartDrawerLines extends CartLines {
        lineTag = "cart-drawer-line";

        beforeMount() {
            this.$el.addClass("cart-lines");
        }
    });

    customElements.define("cart-drawer-line", class CartDrawerLine extends CartLine {
        beforeMount() {
            this.$el.addClass("cart-line");
        }

        template() {
            if (!this.line) return;

            const {
                discount: {allocations},
                merchandise: {product: {title: productTitle, url}, title: variantTitle, featuredImage},
            } = this.line;

            return `
                    <picture-tag      
                        slot="picture" 
                        class="line-media"
                        :src="${featuredImage.url}"
                        :placeholderWidth="500"
                        :fit="cover"
                    ></picture-tag>

                    <div slot="product-details" class="line-product-details">
                        <div slot="name-tag" class="line-name-tag">
                            <a href="${url}" slot="product-name" class="product-name font-semibold">
                                ${productTitle}
                            </a>
                        </div>
                        <div class="product-details__second-row">
                            ${variantTitle !== "Default Title" ? `<div slot="variant-name" class="variant-name paragraph-14">
                                ${variantTitle}
                            </div>` : ""}
                         
                            <quantity-adjuster
                                slot="quantity-adjuster"
                                :variant="mini"
                                :index="${this.index}"
                                :value="${this.line.quantity}"
                                :inventoryPolicy="${this.line?.variant?.inventory_policy}"
                                :max="${this.line?.variant?.inventory_quantity}"
                            ></quantity-adjuster>
                        </div>
                       
                        
                        <coupon-viewer slot="coupon-viewer" :variant="minimal" :removable="false" :allocations="${encodeURIComponent(JSON.stringify(allocations))}"></coupon-viewer>

                    </div>
                    <tracked-button slot="remove-button" :trackId="Delete_cart_ver">
                        <line-remove-button></line-remove-button>
                    </tracked-button>
                
                   <div slot="pricing">
                        <div class="pricing-container">
                            <loader-element :type="skeleton"></loader-element>  

                            <div class="pricing-content"></div>
                        </div>
                   </div>
            `;
        }

        renderPricing() {
            if (!this.line) return;

            const $pricingEl = this.$el.find("[slot='pricing'] .pricing-content");
            const {
                cost: {
                    subtotal,
                    total,
                },
                discount: {totalDiscount},
            } = this.line;

            $pricingEl.html(`
                    ${(totalDiscount) ? `
                         <s class="cart-pricing__price cart-pricing__price--original">
                            ${subtotal.formatted}
                         </s>
                    ` : ``}

                    <strong class="cart-pricing__price text-scarlet">
                        ${(total.amount) ? total.formatted : "FREE"}
                    </strong>         
            `);
        }
    });

    customElements.define("line-remove-button", class LineRemoveButton extends Button {
        props = {
            index: 0,
            label: null,
        };

        setupListeners() {
            this.changeEvent = new CustomEvent("change", {
                bubbles: true,
                details: {
                    index: this.index,
                },
            });
        }

        onClick(e) {
            super.onClick(e);

            this.dispatchEvent(this.changeEvent);
        }

        template() {
            return `
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.75 3.5H2.91667H12.25" stroke="#55576F" stroke-width="1.5" stroke-linecap="round"
                              stroke-linejoin="round"></path>
                        <path
                            d="M11.0827 3.50033V11.667C11.0827 11.9764 10.9598 12.2732 10.741 12.492C10.5222 12.7107 10.2254 12.8337 9.91602 12.8337H4.08268C3.77326 12.8337 3.47652 12.7107 3.25772 12.492C3.03893 12.2732 2.91602 11.9764 2.91602 11.667V3.50033M4.66602 3.50033V2.33366C4.66602 2.02424 4.78893 1.72749 5.00772 1.5087C5.22652 1.28991 5.52326 1.16699 5.83268 1.16699H8.16602C8.47544 1.16699 8.77218 1.28991 8.99097 1.5087C9.20977 1.72749 9.33268 2.02424 9.33268 2.33366V3.50033"
                            stroke="#55576F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    
                    ${this.label ? `<span>${this.label}</span>` : ""}
            `;
        }
    });
}


