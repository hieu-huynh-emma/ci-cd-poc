document.addEventListener('DOMContentLoaded', () => {

    setTimeout(function () {
        // Ometria workaround
        if ($('html').attr('lang') === 'fr') {
            const newsletterFormTags = $(`footer input[name="contact[tags]"]`)

            newsletterFormTags.val(newsletterFormTags.val() + ",locale=fr")
        }
    }, 500)

})
