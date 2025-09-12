(function(){
    // Enter your Mention Me partner code here:
    var partnerCode = "mm2c885498";

    var situation = "cart";

    var urlComponents = [
        "https://tag.mention-me.com/api/v2/refereefind/",
        partnerCode,
    ];
    const locale = window.location.host.startsWith("qc") ? "fr" : "en";

    var queryComponents = [
        ["situation", situation],
        // Locale
        ["locale", locale + "_CA"],
    ];

    queryComponents = queryComponents.map((qc) => qc[0] + "=" + encodeURIComponent(qc[1]));

    var url = urlComponents.join("") + "?" + queryComponents.join("&");

    var script = document.createElement("script");
    script.src = url;

    document.getElementsByTagName("head")[0].appendChild(script);

})()
