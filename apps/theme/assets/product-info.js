document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('Quantity-{{ section.id }}');

    $('.quantity-input__button[name="minus"]').click(function() {
        if (input.value <= 1) {
            return;
        }
        input.value--;
    });
})
function switchAffirmMessage() {
    const lang = $('html').attr('lang');
    if (lang === 'en') {
        $('.fr_pop').hide();
        $('.pro_info').css('display', 'block');
        $('.img_bann.first_bann').addClass('eng');
        $('.img_bann.sec_bann').addClass('eng');
    } else {
        $('.pro_info').hide();
        $('.fr_pop').css('display', 'block');
        $('.img_bann').addClass('updfr');
        $('.img_bann>.tImHU').css('background', 'rgba(255,137,0,1)');
        $('.img_bann').css('display', 'flex');
        $('.img_bann.first_bann').css('background-image', '');
    }
}
