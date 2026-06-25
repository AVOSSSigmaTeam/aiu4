gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);

history.scrollRestoration = "manual";

const DEBUG = true;
const version = "4.0.67";
console.log("V" + version);


let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));
rmMQ.addListener?.(e => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create("default", "0.625, 0.05, 0, 1");
CustomEase.create("smooth", "M0,0 C0.38,0.005 0.215,1 1,1");
CustomEase.create("outQuad", "M0,0 C0.25,0.46 0.45,0.94 1,1");
CustomEase.create("outQuart", "M0,0 C0.165,0.84 0.44,1 1,1");
CustomEase.create("ease", "M0,0 C0.25,0.1 0.25,1 1,1");
CustomEase.create("easeOut", "M0,0 C0,0 0.58,1 1,1");
CustomEase.create("easeInOut", "M0,0 C0.42,0 0.58,1 1,1");
CustomEase.create("bounce", "M0,0 C0.03,0 0.08,0.02 0.12,0.08 C0.18,0.2 0.22,0.5 0.28,0.85 C0.32,1.05 0.38,1.12 0.45,1.08 C0.52,1.02 0.6,0.98 0.7,1 C0.8,1.02 0.9,1 1,1");
gsap.defaults({ ease: "default", duration: durationDefault });

const viewport = {
  tablet: "991px",
  mobileHorizontal: "767px",
  mobileVertical: "479px",
}



// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;

  // Runs once on first load
  // if (has('[data-something]')) initSomething();

  initPortalButtons();

  handleMobileNavLinkClicks();
  initNavTooltips();
  initNavigationMenuExpandAnimation();

  initFavicons();

}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;

  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();

  if (has('[data-elite-popup]')) initElitePopup(nextPage);
  if (has('[data-max-popup]')) initMaxPopup(nextPage);

  if (has('[data-marquee]')) initMarquees(nextPage);

  if (has('[data-format-date]')) formatDates(nextPage);

  if (has('[data-faq-item]')) initFAQ(nextPage);
  if (has('[data-faq-tabs]')) initFAQWraps(nextPage);

  if (has('[data-counter]')) initCounters(nextPage);

  if (has('[data-footer]')) setCopyrightYear(nextPage);

  if (has('[data-service-icon-box]')) initServiceIconBoxBlobAnimation(nextPage);
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  // Runs after enter animation completes
  // if (has('[data-something]')) initSomething();

  // Add scrolltrigger based animations below
  initPageBlurAnimation();

  if (has('[data-aiu-ascii-gallery]')) initImageAsciiReveal(nextPage);

  if (has('[data-animated-hero]')) initHeroAnimation(nextPage);

  if (has('[data-highlight-text]')) initHighlightText(nextPage);

  if (has('[data-horizontal-scroll-section]')) initHorizontalScrollingSectionAnimation(nextPage);

  if (has('[animate-fade-in]')) initFadeInAnimation(nextPage);
  if (has('[animate-fade-in-from-bottom]')) initFadeInFromBottomAnimation(nextPage);


  if (has('[data-wide-section-content]')) initWideHeroSectionAnimation(nextPage); //TEST

  if (hasLenis) {
    lenis.resize();
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
}



// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {

  const loaderContainer = document.querySelector('[data-loader-container]');
  const loader = document.querySelector('[data-loader]');

  const tl = gsap.timeline();

  tl.call(() => {
    resetPage(next);
  }, null, 0);

  tl.to(loader, {
    autoAlpha: 0,
    duration: 0.25,
    ease: "linear",
  }, 0.5)
  .to(loaderContainer, {
    autoAlpha: 0,
    duration: 0.25,
    ease: "linear",
  }, 0.75)
  .set(loaderContainer, {
    display: "none"
  }, 1);

  return tl;
}

function runPageLeaveAnimation(current, next) {

  const tl = gsap.timeline({
    onComplete: () => {
      current.remove();
    }
  })

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(current, { autoAlpha: 0 });
  }

  tl.to(current, {
    autoAlpha: 0,
    ease: "power1.in",
    duration: 0.5,
  }, 0);

  return tl;
}

function runPageEnterAnimation(next) {
  const tl = gsap.timeline();

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady")
    tl.call(resetPage, [next], "pageReady");
    return new Promise(resolve => tl.call(resolve, null, "pageReady"));
  }

  tl.add("startEnter", 0);

  tl.fromTo(next, {
    autoAlpha: 0,
  }, {
    autoAlpha: 1,
    ease: "power1.inOut",
    duration: 0.75,
  }, "startEnter");

  //   tl.fromTo(next.querySelector('h1'), {
  //     yPercent: 25,
  //     autoAlpha: 0,
  //   }, {
  //     yPercent: 0,
  //     autoAlpha: 1,
  //     ease: "expo.out",
  //     duration: 1,
  //   }, "< 0.3");

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return new Promise(resolve => {
    tl.call(resolve, null, "pageReady");
  });
}


// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter(data => {
  // Position new container on top
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
  });

  if (lenis && typeof lenis.stop === "function") {
    lenis.stop();
  }

  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {
  if (hasScrollTrigger) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
});

barba.hooks.enter(data => {
  initBarbaNavUpdate(data);
})

barba.hooks.afterEnter(data => {
  // Run page functions
  initAfterEnterFunctions(data.next.container);

  // Settle
  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

barba.init({
  debug: true, // Set to 'false' in production
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: "default",
      sync: true,

      // First load
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimation(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      }
    }
  ],
});



// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: {
    nav: "dark",
    transition: "light"
  },
  dark: {
    nav: "light",
    transition: "dark"
  }
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || "light";
  const config = themeConfig[pageTheme] || themeConfig.light;

  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector('[data-theme-transition]');
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition;
  }

  const nav = document.querySelector('[data-theme-nav]');
  if (nav) {
    nav.dataset.themeNav = config.nav;
  }
}

function initLenis() {
  if (lenis) return; // already created
  if (!hasLenis) return;

  lenis = new Lenis({
    smooth: true,
    lerp: 0.08,
    wheelMultiplier: 1,
    infinite: false,
  });

  history.scrollRestoration = 'manual';

  if (hasScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  let disableScrollElements = document.querySelectorAll('[scrolldisable-element="disable"]');
  let enableScrollElements = document.querySelectorAll('[scrolldisable-element="enable"]');

  disableScrollElements.forEach(element => {
    element.addEventListener('click', () => {
      lenis.stop();
      // if (DEBUG) console.log("Lenis stopped due to click on", element);
    })
  });

  enableScrollElements.forEach(element => {
    element.addEventListener('click', () => {
      lenis.start();
      // if (DEBUG) console.log("Lenis started due to click on", element);
    })
  });

  // if (DEBUG) console.log("Lenis initialized");

}

function resetPage(container) {
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: "position,top,left,right" });

  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }
}

function debounceOnWidthChange(fn, ms) {
  let last = innerWidth,
    timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (innerWidth !== last) {
        last = innerWidth;
        fn.apply(this, args);
      }
    }, ms);
  };
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
  var currentNodes = document.querySelectorAll('nav [data-barba-update]');

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;

    // Aria-current sync
    var newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) {
      curr.setAttribute('aria-current', newStatus);
    } else {
      curr.removeAttribute('aria-current');
    }

    // Class list sync
    var newClassList = next.getAttribute('class') || '';
    curr.setAttribute('class', newClassList);
  });
}

Number.prototype.numberFormat = function (decimals, decimalSeparator, thousandsSeparator) {
  decimalSeparator = void 0 !== decimalSeparator ? decimalSeparator : ".", thousandsSeparator = void 0 !== thousandsSeparator ? thousandsSeparator : ",";
  var r = this.toFixed(decimals).split(".");
  return r[0] = r[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator), r.join(decimalSeparator)
};

function isMobileOrTablet() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  const mobileRegex = /android|iphone|ipod|blackberry|iemobile|opera mini/i;
  const tabletRegex = /ipad|tablet|kindle|playbook|silk/i;

  const isMobile = mobileRegex.test(ua);
  const isTablet = tabletRegex.test(ua);

  // Fallback: treat small screens as mobile/tablet
  // const isSmallScreen = window.matchMedia("(max-width: 991px)").matches;
  const isSmallScreen = window.matchMedia(`(max-width: ${viewport.tablet})`).matches;

  return isMobile || isTablet || isSmallScreen;
}


// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

function initHeroAnimation(page) {
  const section = page.querySelector('[data-animated-hero]');
  if (!section) return;
  const grid = page.querySelector('[data-hero-grid]');
  if (!grid) return;
  const content = page.querySelector('[data-hero-content]');
  if (!content) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  tl.to(grid, {
    opacity: 1,
    scale: 1.1,
    duration: 10,
    ease: 'linear',
  }, 0)
    .to(content, {
      scale: 0.75,
      duration: 4,
      ease: 'linear',
    }, 0)
    .to(content, {
      opacity: 0,
      duration: 3,
      ease: 'linear',
    }, 1);

  if (DEBUG) console.log("Hero animation initialized");
}

function initHighlightText(page) {
  const splitHeadingTargets = page.querySelectorAll("[data-highlight-text]");

  splitHeadingTargets.forEach((heading) => {
    const scrollStart = heading.getAttribute("data-highlight-scroll-start") || "top 90%";
    const scrollEnd = heading.getAttribute("data-highlight-scroll-end") || "center 40%";
    const fadedValue = parseFloat(heading.getAttribute("data-highlight-fade")) || 0.2;
    const staggerValue = parseFloat(heading.getAttribute("data-highlight-stagger")) || 0.1;

    new SplitText(heading, {
      type: "words, chars",
      autoSplit: true,
      onSplit(self) {
        const ctx = gsap.context(() => {
          gsap.set(self.chars, {
            autoAlpha: fadedValue
          });

          gsap.timeline({
            scrollTrigger: {
              trigger: heading,
              start: scrollStart,
              end: scrollEnd,
              scrub: true,
              invalidateOnRefresh: true
            }
          })
            .to(self.chars, {
              autoAlpha: 1,
              stagger: staggerValue,
              ease: "none"
            });
        });

        return ctx;
      }
    });
  });

  ScrollTrigger.refresh();
}
//TODO check if works, and make sure it runs correctly with the page transition.
function initPortalButtons() {
  "use strict";

  var config = {
    rootDomain: "aiuniverzitet.com",
    portalOrigin: "https://portal.aiuniverzitet.com",
    cookieName: "partner_ref",
    attributionDays: 30,
    queryParameters: ["p"],
    portalLinkSelector: "a[href]",
    sessionStatusPath: "/session/status"
  };

  function normalizePartnerCode(value) {
    if (typeof value !== "string") return null;

    var code = value.trim().toUpperCase();
    return /^[A-Z0-9]{3,20}$/.test(code) ? code : null;
  }

  function partnerCodeFromUrl() {
    var params = new URLSearchParams(window.location.search);

    for (var i = 0; i < config.queryParameters.length; i += 1) {
      var code = normalizePartnerCode(params.get(config.queryParameters[i]));
      if (code) return code;
    }

    return null;
  }

  function readCookie(name) {
    var prefix = name + "=";
    var cookies = document.cookie ? document.cookie.split("; ") : [];

    for (var i = 0; i < cookies.length; i += 1) {
      if (cookies[i].indexOf(prefix) === 0) {
        return decodeURIComponent(cookies[i].slice(prefix.length));
      }
    }

    return null;
  }

  function writeCookie(name, value) {
    var maxAge = config.attributionDays * 24 * 60 * 60;
    var rootDomain = config.rootDomain.replace(/^\./, "");
    var cookie = [
      name + "=" + encodeURIComponent(value),
      "Max-Age=" + maxAge,
      "Path=/",
      "Domain=." + rootDomain,
      "SameSite=Lax"
    ];

    if (window.location.protocol === "https:") {
      cookie.push("Secure");
    }

    document.cookie = cookie.join("; ");
  }

  function decoratePortalLinks(partnerCode) {
    var portalOrigin = config.portalOrigin.replace(/\/$/, "");
    var links = document.querySelectorAll(config.portalLinkSelector);

    for (var i = 0; i < links.length; i += 1) {
      var link = links[i];
      var href = link.getAttribute("href");

      if (!href) continue;

      try {
        var isMarkedPortalLink = link.hasAttribute("data-portal-link");
        var baseUrl = isMarkedPortalLink ? portalOrigin + "/" : window.location.href;
        var url = new URL(href, baseUrl);
        var isPortalLink = url.origin === portalOrigin || isMarkedPortalLink;

        if (!isPortalLink) continue;

        if (!normalizePartnerCode(url.searchParams.get("p"))) {
          url.searchParams.set("p", partnerCode);
          link.setAttribute("href", url.toString());
        }
      } catch (error) {
        continue;
      }
    }
  }

  function installPortalVisibilityStyle() {
    var style = document.createElement("style");
    style.textContent = [
      'html:not([data-portal-session]) [data-portal-show]',
      '{display:none!important}',
      'html[data-portal-session="authenticated"] [data-portal-show="guest"]',
      '{display:none!important}',
      'html[data-portal-session="guest"] [data-portal-show="authenticated"]',
      '{display:none!important}'
    ].join("");

    document.head.appendChild(style);
  }

  function setPortalSessionState(isAuthenticated, urls) {
    document.documentElement.setAttribute(
      "data-portal-session",
      isAuthenticated ? "authenticated" : "guest"
    );

    if (!urls) return;

    var linkTargets = {
      portal: urls.portal,
      dashboard: urls.dashboard,
      login: urls.login,
      register: urls.register
    };

    Object.keys(linkTargets).forEach(function (key) {
      if (!linkTargets[key]) return;

      var links = document.querySelectorAll('[data-portal-href="' + key + '"]');

      for (var i = 0; i < links.length; i += 1) {
        links[i].setAttribute("href", linkTargets[key]);
      }
    });
  }

  function checkPortalSession() {
    if (!window.fetch) {
      setPortalSessionState(false);
      return;
    }

    fetch(config.portalOrigin.replace(/\/$/, "") + config.sessionStatusPath, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store"
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Portal session check failed");
        return response.json();
      })
      .then(function (data) {
        setPortalSessionState(data && data.authenticated === true, data.urls || {});
      })
      .catch(function () {
        setPortalSessionState(false);
      });
  }

  var incomingCode = partnerCodeFromUrl();
  var existingCode = normalizePartnerCode(readCookie(config.cookieName));

  if (incomingCode && (!existingCode || existingCode === incomingCode)) {
    writeCookie(config.cookieName, incomingCode);
    existingCode = incomingCode;
  }

  installPortalVisibilityStyle();

  function run() {
    if (existingCode) {
      decoratePortalLinks(existingCode);
    }

    checkPortalSession();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}

function initFavicons() {
  const regularIcon =
    'https://cdn.prod.website-files.com/6a38f83dcf1a859b76048858/6a3a8b2bbd78d9f870878553_AI%20Univerzitet%20Favicon.png';

  const notificationIcon =
    'https://cdn.prod.website-files.com/6a38f83dcf1a859b76048858/6a3a8b407d6dd7ec65dd2965_AI%20Univerzitet%20Favicon%20Notification.png';

  const faviconSelectors = [
    'link[rel="icon"][media="(prefers-color-scheme: light)"]',
    'link[rel="icon"][media="(prefers-color-scheme: dark)"]',
  ];

  let inactivityTimer;

  function setFavicons(href) {
    faviconSelectors.forEach(function (selector) {
      const icon = document.querySelector(selector);

      if (icon) {
        icon.href = href;
      }
    });
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);

    setFavicons(regularIcon);

    inactivityTimer = setTimeout(function () {
      setFavicons(notificationIcon);
    }, 10000);
  }

  document.addEventListener('mousemove', resetInactivityTimer);
  document.addEventListener('keypress', resetInactivityTimer);

  resetInactivityTimer();
}

function initMarquees(page) {
  const marqees = page.querySelectorAll('[data-marquee]');
  if (marqees.length === 0) return;

  marqees.forEach(marqee => {
    const groups = marqee.querySelectorAll('[data-marquee-group]');
    if (groups.length === 0) return;

    gsap.to(groups, {
      xPercent: 100,
      duration: 25,
      ease: "linear",
      repeat: -1,
    });
  });

  if (DEBUG) console.log("Marquees initialized: " + marqees.length);
}

// nav
function handleMobileNavLinkClicks(page) {
  page = page || document;

  const menuOpenIcon = page.querySelector('[data-menu-open-icon]');
  const menuCloseIcon = page.querySelector('[data-menu-close-icon]');
  const mobileNavMenu = page.querySelector('[data-mobile-nav-menu]');
  let MobileNavMenuLinks = mobileNavMenu.querySelectorAll('a');
  let brandLink = page.querySelector('[data-nav-brand-link]');

  const allMobileNavMenuLinks = [...MobileNavMenuLinks, brandLink];

  allMobileNavMenuLinks.forEach((link) => {

    link.addEventListener('click', () => {
      menuCloseIcon.style.display = "none";
      menuOpenIcon.style.display = "flex";
    })

  });

}

function initNavigationMenuExpandAnimation(page) {
  page = page || document;

  const nav = page.querySelector('[data-navigation]');
  const dropdownList = page.querySelector('[data-dropdown-list]');
  const background = page.querySelector('[data-nav-background]');
  const dropLink = page.querySelector('[data-dropdown-link]');
  const dropHelper = page.querySelector('[data-animate-drop]');

  if (!nav || !dropdownList || !background || !dropLink || !dropHelper) return;

  const navExapandTimeline = gsap.timeline();

  navExapandTimeline
    .fromTo(nav, {
      width: "58rem"
    }, {
      width: "112.5rem",
      duration: 0.6,
      ease: "power1.inOut"
    }, 0)
    .fromTo(nav, {
      height: "2.8125rem",
    }, {
      height: "27.1875rem",
      duration: 0.6,
      ease: "power1.inOut"
    }, 0)
    .fromTo(background, {
      opacity: 0
    }, {
      opacity: 1,
      duration: 0.5,
      ease: "power1.out"
    }, 0)
    .fromTo(dropdownList, {
      opacity: 0
    }, {
      opacity: 1,
      duration: 0.45,
      ease: "power1.inOut"
    }, 0.4);

  navExapandTimeline.pause();

  dropLink.addEventListener("mouseenter", () => {
    navExapandTimeline.play();
  });

  dropHelper.addEventListener("mouseleave", () => {
    navExapandTimeline.reverse();
  });

}

function initNavTooltips() {
  const nav = document.querySelector('[data-navigation]');
  if (!nav) return;

  const tooltipElements = nav.querySelectorAll('[data-css-tooltip-hover]');
  let timeoutId = null;

  window.addEventListener('resize', () => {
    if (isMobileOrTablet()) {
      nav.style.overflow = 'visible';
    } else {
      nav.style.overflow = 'clip';
    }
  });

  tooltipElements.forEach((element) => {
    element.addEventListener('mouseenter', () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      nav.style.overflow = 'visible';
    });

    element.addEventListener('mouseleave', () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        nav.style.overflow = 'clip';
        timeoutId = null;
      }, 400);
    });
  });
}


//faq
function initFAQ(page) {
  const faqItems = page.querySelectorAll('[data-faq-item]');
  if (faqItems.length === 0) {
    // if (DEBUG) console.log("No FAQ items found");
    return;
  }
  // if (DEBUG) console.log(faqItems);

  faqItems.forEach(item => {
    const question = item.querySelector('[data-faq-question]');
    const answer = item.querySelector('[data-faq-answer]');

    if (!question || !answer) return;

    const faqIconWrap = item.querySelector('[data-faq-icon-wrap]');
    const faqIcon = item.querySelector('[data-faq-icon]');
    const faqIconBar = faqIcon?.querySelector('[data-faq-icon-bar]');

    const faqAnimationDuration = 0.25;

    const tl = gsap.timeline({
      paused: true
    });

    tl.to(answer, {
      height: "auto",
      duration: faqAnimationDuration,
      ease: "power1.inOut"
    }, 0)
      .to(faqIconBar, {
        rotationZ: 0,
        duration: faqAnimationDuration,
        ease: "power1.inOut"
      }, 0)
      .to(faqIcon, {
        rotationZ: 180,
        duration: faqAnimationDuration,
        ease: "power1.inOut"
      }, 0);

    const closeTimeline = gsap.timeline({ paused: true });

    closeTimeline.to(answer, {
      height: "0px",
      duration: faqAnimationDuration,
      ease: "power1.inOut"
    }, 0)
      .to(faqIconWrap, {
        // backgroundColor: "blue",
        duration: faqAnimationDuration,
        ease: "power1.inOut"
      }, 0)
      .to(faqIconBar, {
        rotationZ: 90,
        duration: faqAnimationDuration,
        ease: "power1.inOut"
      }, 0)
      .to(faqIcon, {
        rotationZ: -180,
        duration: faqAnimationDuration,
        ease: "power1.inOut"
      }, 0);

    // Set initial state
    closeTimeline.restart();

    question.addEventListener("click", () => {

      let isOpen = item.getAttribute("data-faq-open") === "true";

      if (isOpen) {

        tl.reverse();

        item.setAttribute("data-faq-open", "false");

        // if (DEBUG) console.log("FAQ item closed:", question.textContent.trim(), item.getAttribute("data-faq-open"));

      } else {

        tl.restart();

        item.setAttribute("data-faq-open", "true");

        // if (DEBUG) console.log("FAQ item opened:", question.textContent.trim(), item.getAttribute("data-faq-open"));

      }
    });
  });

  // if (DEBUG) console.log("FAQ initialized");

}
function initFAQWraps(page) {
  const blocks = page.querySelectorAll('[data-faq-block]');
  if (blocks.length === 0) return;

  const wraps = page.querySelectorAll('[data-faq-wrap]');
  if (wraps.length === 0) return;

  wraps.forEach((wrap) => {
    const value = wrap.getAttribute('data-faq-wrap');

    const targetBlock = page.querySelector(
      `[data-faq-block="${value}"]`
    );

    if (targetBlock) {
      targetBlock.appendChild(wrap);
    }
  });
}


function initCounters(page) {
  const targets = page.querySelectorAll('[data-counter]');
  if (targets.length === 0) return;
  const counterTrigger = page.querySelector('[data-counter-trigger]');

  targets.forEach((target) => {
    const targetNumber = target.getAttribute("data-counter");
    const animationDuration = parseInt(target.getAttribute("data-animation-duration")) || 2;
    // if (DEBUG) console.log(target, targetNumber);
    var e = {
      var: 0
    };
    gsap.to(e, animationDuration, {
      var: targetNumber,
      onUpdate: function () {
        let t = e.var.numberFormat(0);
        target.innerHTML = t
      },
      ease: Linear.easeNone,
      scrollTrigger: {
        trigger: counterTrigger,
        start: "top 50%",
        // end: "bottom top",
        // markers: DEBUG,
      }
    })
  });
}

function initPageBlurAnimation() {
  const topBlur = document.querySelector('[data-blur-top]');
  const bottomBlur = document.querySelector('[data-blur-bottom]');

  if (!topBlur || !bottomBlur) return;

  const state = {
    heroProgress: 0,
    footerProgress: 0,
  };

  function renderBlur() {
    const maxBlur = 3;

    const topValue = maxBlur * state.heroProgress;
    const bottomValue = maxBlur * state.heroProgress * (1 - state.footerProgress);

    gsap.set(topBlur, {
      "--blur-top": `${topValue}rem`,
    });

    gsap.set(bottomBlur, {
      "--blur-bottom": `${bottomValue}rem`,
    });
  }

  gsap.set(topBlur, {
    "--blur-top": "0rem",
  });

  gsap.set(bottomBlur, {
    "--blur-bottom": "0rem",
  });

  const animatedHeroSection = document.querySelector('[data-animated-hero]');

  if (animatedHeroSection) {
    ScrollTrigger.create({
      trigger: animatedHeroSection,
      start: "10% top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        state.heroProgress = self.progress;
        renderBlur();
      },
    });
  } else {
    state.heroProgress = 1;
    renderBlur();
  }

  const footer = document.querySelector('[data-footer]');

  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        state.footerProgress = self.progress;
        renderBlur();
      },
    });
  }

  if (DEBUG) console.log("page blur initialized");
}

function setCopyrightYear(page) {
  const yearElement = page.querySelector("[data-copyright-year]");
  if (!yearElement) return;
  const currentYear = new Date().getFullYear();
  yearElement.textContent = currentYear;
  if (DEBUG) console.log("Copyright year set to", currentYear);
}

function initImageAsciiReveal(page) {
  "use strict";

  var DEFAULTS = {
    chars: "........:::=+xX#0369",
    fontSize: 14,
    aspectWidth: 4,
    aspectHeight: 5,
    columns: 75,
    imageStaggerMs: 50,
    cellAppearMs: .5,
    scrambleCount: 5,
    scrambleSpeedMs: 35,
    revealDelayMs: 0,
    foreground: "#c8d3d6",
    background: "#000000",
    maxDpr: 2,
  };

  var initialized = false;

  function toNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function parseAspect(value, fallbackWidth, fallbackHeight) {
    if (!value) return { width: fallbackWidth, height: fallbackHeight };
    var parts = String(value).split("/");
    if (parts.length !== 2) return { width: fallbackWidth, height: fallbackHeight };
    var width = toNumber(parts[0].trim(), fallbackWidth);
    var height = toNumber(parts[1].trim(), fallbackHeight);
    return { width: width, height: height };
  }

  function getConfig(gallery, img) {
    var data = Object.assign({}, gallery.dataset, img.dataset);
    var backgroundColor = gallery.getAttribute("data-background-color");
    var aspect = parseAspect(
      data.asciiAspect,
      DEFAULTS.aspectWidth,
      DEFAULTS.aspectHeight,
    );

    return {
      chars: data.asciiChars || DEFAULTS.chars,
      fontSize: toNumber(data.asciiFontSize, DEFAULTS.fontSize),
      aspectWidth: aspect.width,
      aspectHeight: aspect.height,
      columns: Math.max(8, Math.round(toNumber(data.asciiColumns, DEFAULTS.columns))),
      imageStaggerMs: toNumber(data.asciiStagger, DEFAULTS.imageStaggerMs),
      cellAppearMs: toNumber(data.asciiCellAppear, DEFAULTS.cellAppearMs),
      scrambleCount: Math.max(0, Math.round(toNumber(data.asciiScrambleCount, DEFAULTS.scrambleCount))),
      scrambleSpeedMs: toNumber(data.asciiScrambleSpeed, DEFAULTS.scrambleSpeedMs),
      revealDelayMs: toNumber(data.asciiRevealDelay, DEFAULTS.revealDelayMs),
      foreground: data.asciiForeground || DEFAULTS.foreground,
      background: backgroundColor && backgroundColor.trim() ? backgroundColor : DEFAULTS.background,
      maxDpr: toNumber(data.asciiMaxDpr, DEFAULTS.maxDpr),
      source: data.asciiSrc || "",
    };
  }

  function getMetrics(config, target) {
    var measureCanvas = document.createElement("canvas");
    var measureCtx = measureCanvas.getContext("2d");

    measureCtx.font = config.fontSize + "px monospace";

    var charWidth = Math.ceil(measureCtx.measureText("M").width);
    var charHeight = config.fontSize;

    var columns = config.columns;
    var rows;

    if (target && target.width && target.height) {
      columns = Math.max(8, Math.round(target.width / charWidth));
      rows = Math.max(8, Math.round(target.height / charHeight));
    } else {
      rows = Math.round(
        columns *
        (config.aspectHeight / config.aspectWidth) *
        (charWidth / charHeight)
      );
    }

    return {
      charWidth: charWidth,
      charHeight: charHeight,
      columns: columns,
      rows: Math.max(8, rows),
    };
  }

  function applyImageAspect(config, source) {
    var width = source.naturalWidth || source.width;
    var height = source.naturalHeight || source.height;

    if (!width || !height) return config;

    return Object.assign({}, config, {
      aspectWidth: width,
      aspectHeight: height,
    });
  }

  function whenImageReady(img) {
    if (img.complete && img.naturalWidth) return Promise.resolve();

    return new Promise(function (resolve, reject) {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", reject, { once: true });
    });
  }

  function loadCanvasImage(img, config) {
    return whenImageReady(img).then(function () {
      var src = config.source || img.currentSrc || img.src;

      return new Promise(function (resolve, reject) {
        var source = new Image();
        source.crossOrigin = "anonymous";
        source.decoding = "async";
        source.onload = function () {
          resolve(source);
        };
        source.onerror = function () {
          reject(new Error("ASCII image could not be loaded with CORS: " + src));
        };
        source.src = src;
      }).catch(function () {
        return img;
      });
    });
  }

  function imageToAsciiGrid(source, config, metrics) {
    var imageAspect = source.naturalWidth / source.naturalHeight;
    var itemAspect = config.aspectWidth / config.aspectHeight;
    var cropX = 0;
    var cropY = 0;
    var cropW = source.naturalWidth;
    var cropH = source.naturalHeight;

    if (imageAspect > itemAspect) {
      cropW = source.naturalHeight * itemAspect;
      cropX = (source.naturalWidth - cropW) / 2;
    } else {
      cropH = source.naturalWidth / itemAspect;
      cropY = (source.naturalHeight - cropH) / 2;
    }

    var samplingCanvas = document.createElement("canvas");
    samplingCanvas.width = metrics.columns;
    samplingCanvas.height = metrics.rows;

    var samplingCtx = samplingCanvas.getContext("2d");
    samplingCtx.drawImage(
      source,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      metrics.columns,
      metrics.rows,
    );

    var data = samplingCtx.getImageData(0, 0, metrics.columns, metrics.rows).data;
    var asciiGrid = [];
    var brightnessGrid = [];

    for (var row = 0; row < metrics.rows; row++) {
      var asciiRow = [];
      var brightnessRow = [];

      for (var col = 0; col < metrics.columns; col++) {
        var pixelIndex = (row * metrics.columns + col) * 4;
        var brightness =
          (data[pixelIndex] * 0.299 +
            data[pixelIndex + 1] * 0.587 +
            data[pixelIndex + 2] * 0.114) /
          255;
        var charIndex = Math.min(
          config.chars.length - 1,
          Math.floor((1 - brightness) * config.chars.length),
        );

        asciiRow.push(config.chars[charIndex]);
        brightnessRow.push(charIndex);
      }

      asciiGrid.push(asciiRow);
      brightnessGrid.push(brightnessRow);
    }

    return {
      asciiGrid: asciiGrid,
      brightnessGrid: brightnessGrid,
    };
  }

  function prepareCanvas(canvas, config, metrics) {
    var dpr = Math.min(window.devicePixelRatio || 1, config.maxDpr);
    canvas.width = metrics.columns * metrics.charWidth * dpr;
    canvas.height = metrics.rows * metrics.charHeight * dpr;

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = config.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return dpr;
  }

  function drawCharacter(ctx, config, metrics, col, row, char) {
    ctx.fillStyle = config.background;
    ctx.fillRect(
      col * metrics.charWidth,
      row * metrics.charHeight,
      metrics.charWidth,
      metrics.charHeight,
    );
    ctx.fillStyle = config.foreground;
    ctx.fillText(char, col * metrics.charWidth, row * metrics.charHeight);
  }

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  function animateCells(canvas, item, asciiGrid, brightnessGrid, config, metrics, index) {
    var denseCharIndex = config.chars.lastIndexOf(".");
    var denseChars = config.chars.slice(denseCharIndex + 1).split("");
    if (!denseChars.length) denseChars = config.chars.split("");

    var dpr = prepareCanvas(canvas, config, metrics);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = metrics.charHeight + "px monospace";
    ctx.textBaseline = "top";

    var totalCells = metrics.columns * metrics.rows;
    var scrambleState = new Array(totalCells).fill(null);
    var settledCount = 0;
    var didReveal = false;
    var staggerDelay = index * config.imageStaggerMs;
    var cellOrder = shuffleArray(
      Array.from({ length: totalCells }, function (_, i) {
        return i;
      }),
    );

    function scheduleReveal() {
      if (didReveal) return;
      didReveal = true;
      setTimeout(function () {
        item.classList.add("is-revealed");
      }, config.revealDelayMs);
    }

    cellOrder.forEach(function (cellIndex, i) {
      setTimeout(function () {
        var row = Math.floor(cellIndex / metrics.columns);
        var col = cellIndex % metrics.columns;
        var isDark = brightnessGrid[row][col] > denseCharIndex;

        if (!isDark) {
          drawCharacter(ctx, config, metrics, col, row, asciiGrid[row][col]);
          scrambleState[cellIndex] = 0;
          settledCount++;
          if (settledCount === totalCells) scheduleReveal();
          return;
        }

        drawCharacter(
          ctx,
          config,
          metrics,
          col,
          row,
          denseChars[Math.floor(Math.random() * denseChars.length)],
        );
        scrambleState[cellIndex] = config.scrambleCount;
      }, staggerDelay + i * config.cellAppearMs);
    });

    var scrambleTicker = setInterval(function () {
      var stillScrambling = false;

      for (var cellIndex = 0; cellIndex < totalCells; cellIndex++) {
        var remaining = scrambleState[cellIndex];
        if (remaining === null || remaining === 0) continue;

        stillScrambling = true;
        var row = Math.floor(cellIndex / metrics.columns);
        var col = cellIndex % metrics.columns;

        if (remaining === 1) {
          drawCharacter(ctx, config, metrics, col, row, asciiGrid[row][col]);
          scrambleState[cellIndex] = 0;
          settledCount++;
          if (settledCount === totalCells) scheduleReveal();
        } else {
          drawCharacter(
            ctx,
            config,
            metrics,
            col,
            row,
            denseChars[Math.floor(Math.random() * denseChars.length)],
          );
          scrambleState[cellIndex] = remaining - 1;
        }
      }

      if (!stillScrambling && settledCount === totalCells) {
        clearInterval(scrambleTicker);
      }
    }, config.scrambleSpeedMs);
  }

  function revealFallback(item, canvas) {
    item.classList.add("is-failed");
    if (canvas) canvas.remove();
  }

  function initImage(gallery, img, index) {
    if (img.dataset.asciiInitialized === "true") return;
    img.dataset.asciiInitialized = "true";

    var item =
      img.closest("[data-aiu-ascii-item]") ||
      // img.closest(".aiu-ascii-item") ||
      img.parentElement;

    if (!item) {
      // if (DEBUG) console.log("no images");
      return;
    }

    item.classList.add("aiu-ascii-item");
    // img.classList.add("aiu-ascii-img");

    var config = getConfig(gallery, img);
    var canvas = document.createElement("canvas");
    canvas.className = "aiu-ascii-canvas";
    canvas.setAttribute("aria-hidden", "true");
    item.appendChild(canvas);

    var shouldReduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldReduceMotion) {
      revealFallback(item, canvas);
      return;
    }

    loadCanvasImage(img, config)
      .then(function (source) {
        config = applyImageAspect(config, source);
        var rect = item.getBoundingClientRect();
        var metrics = getMetrics(config, rect);
        var grids = imageToAsciiGrid(source, config, metrics);
        animateCells(
          canvas,
          item,
          grids.asciiGrid,
          grids.brightnessGrid,
          config,
          metrics,
          index,
        );
      })
      .catch(function () {
        revealFallback(item, canvas);
      });
  }

  function initGallery(gallery) {
    var images = Array.from(
      //   gallery.querySelectorAll("img[data-aiu-ascii], img.ascii-reveal"),
      gallery.querySelectorAll("img[data-aiu-ascii]"),
    );
    if (!images.length) { return; }
    // else { console.log(images) }

    function start() {
      images.forEach(function (img, index) {
        initImage(gallery, img, index);
      });
    }

    if (!("IntersectionObserver" in window)) {
      start();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          start();
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(gallery);
  }

  function initAsciiReveal() {
    var galleries = Array.from(
      //   page.querySelectorAll("[data-aiu-ascii-gallery], .aiu-ascii-gallery"),
      page.querySelectorAll("[data-aiu-ascii-gallery]"),
    );

    galleries.forEach(initGallery);
  }

  window.AIUAsciiReveal = {
    init: initAsciiReveal,
  };

  function boot() {
    if (initialized) return;
    initialized = true;
    initAsciiReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.Webflow = window.Webflow || [];
  window.Webflow.push(function () {
    initialized = false;
    boot();
  });
}

// popups
function initElitePopup(page) {
  const popupTriggers = page.querySelectorAll('[data-show-popup-elite]');
  if (popupTriggers.length === 0) return;

  function removeTriggers() {
    popupTriggers.forEach(trigger => {
      trigger.remove();
    });
  }

  const popup = page.querySelector('[data-elite-popup]');
  if (!popup) {
    removeTriggers();
    return;
  }

  const background = popup.querySelector('[data-popup-background]');
  if (!background) return;

  const player = page.querySelector('[data-popup-video="elite"]');
  if (!player) {
    removeTriggers();
    return;
  }

  const openPopup = () => {

    const tl = gsap.timeline();

    tl.set(popup, {
      top: "0vh",
      height: "100vh",
    });

    tl.to(popup, {
      backdropFilter: 'blur(24px)',
      autoAlpha: 1,
      duration: 0.4,
      ease: 'power2.out',
      // onComplete: () => {
      //   player.play();
      // },
    });
  };

  const closePopup = () => {
    player.pause();

    const tl = gsap.timeline();

    tl.to(popup, {
      backdropFilter: 'blur(0px)',
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power2.inOut',
    }, 0);

    tl.set(popup, {
      top: "100vh",
      height: "0vh",
    }, 0.4);
  };

  popupTriggers.forEach(trigger => {
    trigger.addEventListener('click', openPopup);
  });

  background.addEventListener('click', closePopup);

}
function initMaxPopup(page) {
  const popupTriggers = page.querySelectorAll('[data-show-popup-max]');
  if (popupTriggers.length === 0) return;

  function removeTriggers() {
    popupTriggers.forEach(trigger => {
      trigger.remove();
    });
  }

  const popup = page.querySelector('[data-max-popup]');
  if (!popup) {
    removeTriggers();
    return;
  }

  const background = popup.querySelector('[data-popup-background]');
  if (!background) return;

  const player = page.querySelector('[data-popup-video="max"]');
  if (!player) {
    removeTriggers();
    return;
  }

  const openPopup = () => {

    const tl = gsap.timeline();

    tl.set(popup, {
      top: "0vh",
      height: "100vh",
    });

    tl.to(popup, {
      backdropFilter: 'blur(24px)',
      autoAlpha: 1,
      duration: 0.4,
      ease: 'power2.out',
      // onComplete: () => {
      //   player.play();
      // },
    });
  };

  const closePopup = () => {
    player.pause();

    const tl = gsap.timeline();

    tl.to(popup, {
      backdropFilter: 'blur(0px)',
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power2.inOut',
    }, 0);

    tl.set(popup, {
      top: "100vh",
      height: "0vh",
    }, 0.4);
  };

  popupTriggers.forEach(trigger => {
    trigger.addEventListener('click', openPopup);
  });

  background.addEventListener('click', closePopup);

}


//animations
function initServiceIconBoxBlobAnimation(page) { 
  const serviceIconBoxes = page.querySelectorAll('[data-service-icon-box]');
  if (serviceIconBoxes.length === 0) return;

  serviceIconBoxes.forEach(box => {
    const grid = box.querySelector('[data-service-item-grid]');
    const blobA = box.querySelector('[data-service-item-blob-a]');
    const blobB = box.querySelector('[data-service-item-blob-b]');

    const hover = gsap.timeline({ paused: true });

    hover.to(blobA, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      ease: "linear",
    }, 0)
    .to(grid, {
      opacity: .6,
      duration: 0.2,
      ease: "linear",
    }, 0)
    .to(box, {
      backgroundColor: "var(--colors-brand--brand-1)",
      duration: 0.2,
      ease: "linear",
    }, 0)
    .to(blobB, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      ease: "linear",
    }, 0.2);


    box.addEventListener("pointerenter", () => {
      hover.play();
    });

    box.addEventListener("pointerleave", () => {
      hover.reverse();
    });

  });

  // if (DEBUG) console.log("Service item animation initilized");
}


function formatDates(page) {
  let dateElements = page.querySelectorAll('[data-format-date]');
  if (dateElements.length === 0) return;

  dateElements.forEach(dateElement => {
    let date = new Date(dateElement.getAttribute('data-format-date'));
    let monthText = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
    dateElement.textContent = date.getDate() + ". " + monthText[date.getMonth()] + " " + date.getFullYear();
  });

  // if (DEBUG) console.log("Blog post dates initialized");
}


function initHorizontalScrollingSectionAnimation(page) {
  const sections = page.querySelectorAll('[data-horizontal-scroll-section]');
  if (sections.length === 0) return;

  const mm = gsap.matchMedia();

  mm.add(`(min-width: ${viewport.tablet})`, () => {
    sections.forEach(section => {
      const row = section.querySelector('[data-scrolling-row]');
      if (!row) return;

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 25%",
          end: "bottom bottom-=35%",
          scrub: true,
        },
      }).fromTo(row, {
        xPercent: 0,
      }, {
        xPercent: -50,
        ease: "linear",
      });
    });
  });

  return mm;
}

function initFadeInAnimation(page) {
  const targets = page.querySelectorAll('[animate-fade-in]');
  if (targets.length === 0) return;

  targets.forEach(target => {
    gsap.set(target, {
      autoAlpha: 0,
    });

    gsap.to(target, {
      autoAlpha: 1,
      duration: 1,
      delay: 0.5,
      scrollTrigger: {
        trigger: target,
        start: "top bottom",
        once: true,
      },
    });
  });
  // if (DEBUG) console.log("Fade in animation initialized");
}

function initFadeInFromBottomAnimation(page) {
  const targets = page.querySelectorAll('[animate-fade-in-from-bottom]');
  if (targets.length === 0) return;

  targets.forEach(target => {

    gsap.set(target, {
      y: "1.5rem",
      autoAlpha: 0,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: target,
        start: "top bottom",
      },
    });

    tl.to(target, {
      y: "0rem",
      autoAlpha: 1,
      duration: 0.7,
    }, 0.2);

  });
  // if (DEBUG) console.log("Fade in from bottom animation initialized");
}
// TODO finish and optimize
function initWideHeroSectionAnimation(page) {
  const content = page.querySelector('[data-wide-section-content]');
  const container = page.querySelector('[data-wide-section-main-container]');
  if (!content || !container) return;

  const blobA = page.querySelector('[data-wide-section-blob-a]');
  const blobB = page.querySelector('[data-wide-section-blob-b]');
  const blobC = page.querySelector('[data-wide-section-blob-c]');
  if (!blobA || !blobB || !blobC) return;

  gsap.to(content, {
    opacity: 1,
    duration: 1,
    ease: "outQuart",
  }, 1.26);
  gsap.to(container, {
    opacity: 1,
    y: '0%',
    duration: 0.2,
    ease: "easeOut",
  }, 1.76)


  const tl = gsap.timeline({ repeat: -1, });

  tl.to(blobA, {
    x: "500px",
    y: "271px",
    duration: 8,
    ease: "ease",
  }, 1.26)
  .to(blobA, {
    opacity: 1,
    duration: 3,
    ease: "easeOut",
  }, 1.26)

  .to(blobB, {
    x: "202px",
    y: "279px",
    duration: 8,
    ease: "linear",
  }, 1.26)
  .to(blobB, {
    opacity: 1,
    duration: 2,
    ease: "easeOut",
  }, 1.26)

  .to(blobC, {
    x: "-30vw",
    y: "-13vh",
    duration: 5,
    ease: "linear",
  }, 1.26)
  .to(blobC, {
    scale: 1,
    duration: 8,
    ease: "easeInOut",
  }, 1.26)
  .to(blobC, {
    skewX: '15deg',
    duration: 2,
    ease: "easeOut",
  }, 1.26)
  .to(blobC, {
    rotationZ: '0deg',
    duration: 2,
    ease: "easeOut",
  }, 1.26)

  .to(blobA, {
    scale: 1,
    duration: 8,
    ease: "easeInOut",
  }, 1.46)

  .to(blobB, {
    scale: 1,
    duration: 8,
    ease: "easeInOut",
  }, 1.46)

  .to(blobC, {
    opacity: 1,
    duration: 2.5,
    ease: "easeOut",
  }, 1.46)


  .to(blobA, {
    x: "-271px",
    y: "256px",
    duration: 12,
    ease: "easeInOut",
  }, 9.46)
  .to(blobA, {
    opacity: .93,
    duration: 8,
    ease: "bounce",
  }, 9.46)

  .to(blobB, {
    x: "-340px",
    y: "424px",
    duration: 12,
    ease: "linear",
  }, 9.46)
  .to(blobB, {
    opacity: .91,
    duration: 9,
    ease: "linear",
  }, 9.46)
  .to(blobB, {
    rotationX: '15deg',
    duration: 12,
    ease: "bounce",
  }, 9.46)

  .to(blobC, {
    x: "16vw",
    duration: 12,
    ease: "easeInOut",
  }, 9.46)
  .to(blobC, {
    opacity: .81,
    duration: 10,
    ease: "easeInOut",
  }, 9.46)
  .to(blobC, {
    scale: .9,
    duration: 8,
    ease: "easeInOut",
  }, 9.46);


  if (DEBUG) console.log("Wide hero animation initilized");
}






// TODO init coming-soon / legal page blob animation

// TODO init CMS filters (have on NUTRI)

// TODO init button hover animation

// TODO init blob animations

// WF
// TODO check map, not visible on iOS