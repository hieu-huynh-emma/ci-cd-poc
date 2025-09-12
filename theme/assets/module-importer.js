(function () {
    const script = document.createElement('script');

    script.src = document.currentScript.getAttribute('data-url');
    script.type = 'module'

    document.currentScript.replaceWith(script);
})()
