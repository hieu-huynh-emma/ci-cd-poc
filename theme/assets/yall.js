(() => {
  const INTERSECTION_OBSERVER_SUPPORTED = "IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype;
  const CRAWLER = /baidu|(?:google|bing|yandex|duckduck)bot/i.test(navigator.userAgent);
  const DATA_ATTRS = ["src", "poster"];

  function yallBindEvents (element, events) {
    for (const eventIndex in events) {
      const eventObject = events[eventIndex];

      element.addEventListener(eventIndex, eventObject.listener || eventObject, eventObject.options || undefined);
    }
  }
  function yallFlipDataAttrs (element, lazyClass) {
    for (const dataAttr of DATA_ATTRS) {
      if (dataAttr in element.dataset) {
        element.setAttribute(dataAttr, element.dataset[dataAttr]);

        if (element.classList.contains(lazyClass)) {
          element.classList.remove(lazyClass);
        }
      }
    }
  }
  function yallLoad (element, lazyClass, lazyBackgroundClass, lazyBackgroundLoaded) {
    if (element.nodeName == "VIDEO") {
      const sourceElements = Array.from(element.querySelectorAll("source"));

      for (const sourceElement of sourceElements) {
        yallFlipDataAttrs(sourceElement, lazyClass);
      }

      element.load();
    }

    yallFlipDataAttrs(element, lazyClass);

    const classList = element.classList;

    // Lazy load CSS background images
    if (classList.contains(lazyBackgroundClass)) {
      classList.remove(lazyBackgroundClass);
      classList.add(lazyBackgroundLoaded);
    }
  }
  function yall (options) {
    const lazyClass = options?.lazyClass || "lazy";
    const lazyBackgroundClass = options?.lazyBackgroundClass || "lazy-bg";
    const lazyBackgroundLoaded = options?.lazyBackgroundLoaded || "lazy-bg-loaded";
    const threshold = options?.threshold || 200;
    const events = options?.events || {};
    const observeChanges = options?.observeChanges || false;
    const observeRootSelector = options?.observeRootSelector || "body";
    const mutationObserverOptions = options?.mutationObserverOptions || {
      childList: true,
      subtree: true
    };
    const lazySelector = `video.${lazyClass},.${lazyBackgroundClass}`;
    let lazyElements = Array.from(document.querySelectorAll(lazySelector));

    for (const lazyElement of lazyElements) {
      yallBindEvents(lazyElement, events);
    }

    // First we check if IntersectionObserver is supported. If the
    // current user agent is a known crawler we just load everything.
    if (INTERSECTION_OBSERVER_SUPPORTED === true && CRAWLER === false) {
      var intersectionListener = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio) {
            const { target } = entry;

            yallLoad(target, lazyClass, lazyBackgroundClass, lazyBackgroundLoaded);

            intersectionListener.unobserve(target);
            lazyElements = lazyElements.filter(lazyElement => lazyElement != target);

            // If all the elements that were detected at load time are all loaded
            // and we're not observing for changes, we're all done here.
            if (lazyElements.length === 0 && observeChanges === false) {
              intersectionListener.disconnect();
            }
          }
        }
      }, {
        rootMargin: `${threshold}px 0%`
      });

      for (const lazyElement of lazyElements) {
        intersectionListener.observe(lazyElement);
      }

      if (observeChanges) {
        new MutationObserver(() => {
          const newElements = document.querySelectorAll(lazySelector);

          for (const newElement of newElements) {
            if (lazyElements.includes(newElement) === false) {
              lazyElements.push(newElement);
              yallBindEvents(newElement, events);

              if (INTERSECTION_OBSERVER_SUPPORTED === true && CRAWLER === false) {
                intersectionListener.observe(newElement);
              }
            }
          }
        }).observe(document.querySelector(observeRootSelector), mutationObserverOptions);
      }
    } else if (CRAWLER) {
      for (const lazyElement of lazyElements) {
        yallLoad(lazyElement, lazyClass, lazyBackgroundClass, lazyBackgroundLoaded);
      }
    }
  }


  document.addEventListener('DOMContentLoaded', yall)
})()
