
$(document).ready( function() {
                  
  
          var coll = document.getElementsByClassName("collapsible");
          var i;

          for (i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
              this.classList.toggle("active");
              var content = this.nextElementSibling;
              if (content.style.maxHeight){
                content.style.maxHeight = null;
              } else {
                content.style.maxHeight = content.scrollHeight + "px";
              } 
            });
          }
		
                  
       
                  
                
  
        $('.custom-home-slider').slick({
          	dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
          	adaptiveHeight: true,
            arrows: false,
            responsive: [
              {
                breakpoint: 992,
                settings: {
                  slidesToShow: 1,
                  arrows: false
                
                }
              },
              {
                breakpoint: 600,
                settings: {
                  slidesToShow: 1,
                  arrows: false
                }
              }
            ]
        });
  
  		$('.custom-award-slider').slick({
          	dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 5,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
          	adaptiveHeight: true,
            arrows: true,
          	prevArrow:"<img class='a-left control-c prev slick-prev' src='https://cdn.shopify.com/s/files/1/0595/4830/3544/t/2/assets/award-arrow-left.svg?v=1630575753'>",
            nextArrow:"<img class='a-right control-c next slick-next' src='https://cdn.shopify.com/s/files/1/0595/4830/3544/t/2/assets/award-arrow-right.svg?v=1630575759'>",
            responsive: [
              {
                breakpoint: 992,
                settings: {
                  slidesToShow: 3,
                  arrows: true
                
                }
              },
              {
                breakpoint: 600,
                settings: {
                  slidesToShow: 3,
                  arrows: true
                }
              }
            ]
        });
  
  		$('.custom-testimonial-slider--wrapper').slick({
          	dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
          	adaptiveHeight: true,
            arrows: false,
          	fade: true,
  			cssEase: 'linear'
        });
  
  		$('.custom-featured-products-row').slick({
          dots: false,
          arrows: false,
          infinite: false,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: false,
          autoplaySpeed: 5000,
          adaptiveHeight: true,
          responsive: [
            {
              breakpoint: 4000,
              settings: 'unslick'
            },
            {
              breakpoint: 769,
              settings: {
                slidesToShow: 2,
                arrows: false,
                dots: false
              }
            },
            {
              breakpoint: 600,
              settings: {
                slidesToShow: 1,
                arrows: false,
                dots: false,
                variableWidth: true,
                centerMode: true
              }
            }
          ]
        });
  
  
  $('.techmat-slider').slick({
    mobileFirst: true,
    dots: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: "unslick",
      }
    ]

  });
  
  $(".popup-close").click(function(){
    $(".modal").css("display", "none");
  });

        new WOW().init();
 });

