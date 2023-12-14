 $(document).ready(function() {
		$('.myqtyminus').click(function () {
// var qty = parseInt($(this).parent('.qtybox').find('.quantity-input').val());
            var $input = $(this).parent().find('input.qtychange');
             
             // var currentVariant = $('input.qtychange').attr("data-id");
              //alert(currentVariant);
         
			 //var count = parseInt($input.val()) - 1;
              $input.val(parseInt($input.val()) - 1); 				
                 
 				// count = count < 1 ? 1 : count;
 				// $input.val(count);
 				
 				//return false;
               if($input.val() == 1){
                 $('.myqtyminus').click(false);
                 //var href =$(this).parent().find('idtlcart').attr('href');
                   //var href = $('.dtlcart').attr('href');
              // alert(href);
               // window.location.href = href;
                
               }else{
                  
                 $input.change();
                  $('[name=update]').trigger('click');
               }
              
 			});
			$('.myqtyplus').click(function () {
 				var $input = $(this).parent().find('input.qtychange');
 				$input.val(parseInt($input.val()) + 1); 				
                 $input.change();
				//return false;
              $('[name=update]').trigger('click');
 			});

 
 		});




// $('.qtybox .btnqty').on('click', function(){
//   var qty = parseInt($(this).parent('.qtybox').find('.quantity-input').val());
//   if($(this).hasClass('qtyplus')) {
//     qty++;
//     qty.change();
// // 				//return false;
// $('[name=update]').trigger('click');
//   }else {
//     if(qty > 0) {
//       qty--;
//     }
//   }
//   qty = (isNaN(qty))?0:qty;
//   $(this).parent('.qtybox').find('.quantity-input').val(qty);
// });

  




