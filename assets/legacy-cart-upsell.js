$("#cart-bedding-col-section").ready(async () => {
    await ResourceCoordinator.requestVendor('Splide');
    new Splide('#cart-bedding-col-section .splide', {
        autoWidth: false,
        padding: {right: '0rem'},
        loop:true,
        perPage: 4,
        perMove: 1,
        gap: '20px',
        pagination: false,
        breakpoints: {
            768: {
                perPage: 1,
                arrows: true,
                pagination: true,
            },
            864: {
                perPage: 2
            },
            1024: {
                perPage: 3,
                gap: '12px',
            }
        }
    }).mount();
})

$(document).ready(function() {
    $('.datachange').on('change', function() {
        var selectedVariant = $(this).val();
        var selectedfvar = $('option:selected',this).val();
        var selectedvarprice = $('option:selected',this).data("price");
        var selectedvarcompprice = $('option:selected',this).data("compare-price");

        if (selectedVariant !== '') {
            $('.id').val(selectedVariant).trigger('change');
            //  if(selectedvarprice !== '' && selectedfvar == selectedVariant){
            //     $('.dataprice').text(selectedvarprice).trigger('change');
            //  }
            // if(selectedvarcompprice !== ''){
            // $('.datacomprice').text(selectedvarcompprice).trigger('change');
            //   }
        }
    });
});
