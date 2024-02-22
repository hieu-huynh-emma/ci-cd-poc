function getTimeParts(delta) {
    const days = Math.floor(delta / 86400);
    delta -= days * 86400;

    const hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    const minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    const seconds = Math.floor(delta % 60);  // in theory the modulus is not required

    return [days, hours, minutes, seconds]
}

function renderTimer(delta) {
    const timeParts = getTimeParts(delta)

    $("#hero-banner-section .time-part").each(function (i) {
        $(this).find(".digit").text(timeParts[i])
    })
}

$("#hero-banner-section").ready(function () {

    const startTime = Date.now();
    const endTime = new Date(Shop.settings.saleTimer.replace(' ', 'T'));

    let delta = (endTime - startTime) / 1000;

    if (delta < 0) {
        $("#hero-banner-section").hide()
    }

    renderTimer(delta)

    setInterval(function () {
        delta -= 1;
        if (delta >= 0) renderTimer(delta)
        else  $("#hero-banner-section").hide()
    }, 1000);
})
