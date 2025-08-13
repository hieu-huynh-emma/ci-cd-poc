const kdDiscountMutationObserver = new MutationObserver(onKdDiscountReady);

kdDiscountMutationObserver.observe(document.querySelector(".sum_row.ship_row"), {
    childList: true,
});

function onKdDiscountReady() {
    const kdDiscount = document.querySelector("#af_kd_discount_container0");

    if (!kdDiscount) return;

    const $kdDiscount = $(kdDiscount);

    kdDiscountMutationObserver.disconnect();

    const $applyBtnEl = $kdDiscount.find(".af_kd_btn_holder");


    $applyBtnEl.html(`
                <tracked-button :trackId="Apply_coupon_cart">${$applyBtnEl.html()}</tracked-button>
            `);
}
