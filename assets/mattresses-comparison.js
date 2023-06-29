$(document).ready(() => {
  const swipeLeftObserser = new IntersectionObserver(function (entries) {
    const [{ isIntersecting }] = entries;
    $(".mattresses-comparison-section .swipe-left-icon")[isIntersecting ? "show" : "hide"]();

  }, {
    rootMargin: "-50% 0px -50% 0px",
  });
  swipeLeftObserser.observe($(".mattresses-comparison-section").get(0));
});