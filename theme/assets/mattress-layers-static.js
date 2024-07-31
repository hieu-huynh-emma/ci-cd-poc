$("#mattress-layers-section").ready(async () => {
    await ResourceCoordinator.requestVendor('Splide');

    var splide = new Splide('#mattress-layers', {
        arrows: false,
    });
    splide.mount();

    //extra custom pagination
    const layersController = document.querySelector('#mattress-layers-controller');
    const listItems = layersController.querySelectorAll('button');

    splide.on('move', (destIndex) => {
        listItems[destIndex].click();
    });

    listItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            listItems.forEach((item) => {
                item.classList.remove('active');
            });
            item.classList.add('active');

            splide.go(index);
        });
    });

    listItems[0].click();
});
