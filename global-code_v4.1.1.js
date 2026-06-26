import { restartWebflow } from 'https://cdn.jsdelivr.net/npm/@finsweet/ts-utils/+esm';

gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);

history.scrollRestoration = "manual";

const DEBUG = true;
const version = "4.1.1";
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

const articleBodyLinkWhitelist = ["aiuniverzitet.com"];


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

  if (has('[data-animate-button]')) initButtonHoverAnimation(nextPage);

  if (has('[data-elite-popup]')) initElitePopup(nextPage);
  if (has('[data-max-popup]')) initMaxPopup(nextPage);

  if (has('[data-marquee]')) initMarquees(nextPage);

  if (has('[data-format-date]')) formatDates(nextPage);

  if (has('[data-faq-item]')) initFAQ(nextPage);
  if (has('[data-faq-tabs]')) initFAQWraps(nextPage);

  if (has('[data-counter]')) initCounters(nextPage);

  if (has('[data-footer]')) setCopyrightYear(nextPage);

  if (has('[data-service-icon-box]')) initServiceIconBoxBlobAnimation(nextPage);

  if (has('[data-aiu-balkan-map]')) initAnimatedMap();
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

  //Restart Finsweet
  // if (window.FinsweetAttributes) {
  //   try {
  //     await window.FinsweetAttributes.modules.list.restart();
  //     // await window.FinsweetAttributes.modules.copyclip.restart();
  //     // await window.FinsweetAttributes.modules.socialshare.restart();
  //   }
  //   catch (e) {
  //     if (DEBUG) console.warn('Finsweet restart error:', e);
  //   }
  // }
  // if (DEBUG) console.log(window.FinsweetAttributes);

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


function initCounters(page) { // TODO fix, not working when tranisitioning
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

// TODO finish and optimize, section flashes into existance when transitioning from another page, and flashes on repeat
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
    }, 1.26);


  if (DEBUG) console.log("Wide hero animation initilized");
}

function initButtonHoverAnimation(page) {
  const buttons = page.querySelectorAll('[data-animate-button]');
  if (buttons.length === 0) return;

  buttons.forEach(button => {
    const buttonTextElements = button.querySelectorAll('[data-button-text]');
    if (buttonTextElements.length === 0) return;

    const tl = gsap.timeline({ paused: true });

    tl.fromTo(buttonTextElements, {
      yPercent: 0,
    }, {
      yPercent: -100,
      duration: 0.2,
      ease: "easeOut"
    });

    button.addEventListener("pointerenter", () => {
      tl.play();
    });

    button.addEventListener("pointerleave", () => {
      tl.reverse();
    });

  });

  if (DEBUG) console.log("Button animation initialized for: " + buttons.length);
}


function initAnimatedMap(page = document) {
  var ys = "22.11,30.21,38.32,46.42,54.53,62.64,70.74,78.85,86.95,95.06,103.17,111.27,119.38,127.48,135.59,143.7,151.8,159.91,168.01,176.12,184.23,192.33,200.44,208.54,216.65,224.76,232.86,240.97,249.07,257.18,265.29,273.39,281.5,289.6,297.71,305.82,313.92,322.03,330.13,338.24,346.35,354.45,362.56,370.66,378.77,386.88,394.98,403.09,411.19,419.3,427.41,435.51,443.62,451.72,459.83,467.94,476.04,484.15,492.25,500.36,508.47,516.57,524.68,532.78,540.89,549,557.1,565.21,573.31,581.42,589.53,597.63,605.74,613.84,621.95,630.06,638.16".split(',').map(Number);
  var rows = "d,f;c,e,g,i;d,f,h,j,l,r,t;e,g,i,k,m,o,q,s,u,w;b,d,f,h,j,l,n,p,r,t,v,x;6,8,a,c,e,g,i,k,m,o,q,s,u,w,y;5,7,9,b,d,f,h,j,l,n,p,r,t,v,x,z;6,8,a,c,e,g,i,k,m,o,q,s,u,w,y;5,7,9,b,d,f,h,j,l,n,p,r,t,v,x,z;4,6,8,a,c,e,g,i,k,m,o,q,s,u,w,y,10;5,7,9,b,d,f,h,j,l,n,p,r,t,v,x,z,11;4,6,8,a,c,e,g,i,k,m,o,q,s,u,w,y,10;1,3,5,7,9,b,d,f,h,j,l,n,p,r,t,v,x,z,11;0,2,4,6,8,a,c,e,g,i,k,m,o,q,s,u,w,y,10,12;1,3,5,7,9,b,d,f,h,j,l,n,p,r,t,v,x,z,11,13;0,2,4,6,8,a,c,e,g,i,k,m,o,q,s,u,w,y,10,12;1,3,5,7,9,b,d,f,h,j,l,n,p,r,t,v,x;0,2,4,6,8,a,c,e,g,i,k,m,o,q,s,u;1,3,5,7,9,b,d,f,h,j,l,n,p,r,t;0,2,4,6,8,a,c,e,g,i,k,m,o,q;1,3,5,7,9,b,d,f,h,j,l,n,p,r;0,2,4,6,8,a,c,e,g,i,k,m,o,q,s;1,3,5,7,9,b,d,f,h,j,l,n,p,r,t,2p;4,6,8,a,c,e,g,i,k,m,o,q,s,u,w,2m,2o,2q;9,b,d,f,h,j,l,n,p,r,t,v,x,15,17,1v,1x,1z,21,23,2j,2l,2n,2p,2r,2t;8,a,c,e,g,i,k,m,o,q,s,u,w,y,10,14,16,18,1a,1c,1e,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u;7,9,b,d,f,h,j,l,n,p,r,t,v,x,z,11,13,15,17,19,1b,1d,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v;6,8,a,c,e,g,i,k,m,o,q,s,u,w,y,10,12,14,16,18,1a,1c,1e,1g,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w;7,9,b,d,f,h,j,l,n,p,r,t,v,x,z,11,13,15,17,19,1b,1d,1f,1h,1j,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x;6,8,c,e,g,i,k,m,o,q,s,u,w,y,10,12,14,16,18,1a,1c,1e,1g,1i,1k,1m,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y;h,j,l,n,p,r,t,v,x,z,11,13,15,17,19,1b,1d,1f,1h,1j,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x;g,i,k,m,o,q,s,u,w,y,10,12,14,16,18,1a,1c,1e,1g,1i,1k,1m,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y;h,j,l,n,p,r,t,v,x,z,11,13,15,17,19,1b,1d,1f,1h,1j,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x,2z,31,35,37;k,m,o,q,s,u,w,y,10,12,14,16,18,1a,1c,1e,1g,1i,1k,1m,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y,30,32,34,36;l,n,p,r,t,v,x,z,11,13,15,17,19,1b,1d,1f,1h,1j,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x,2z,31,33;e,g,i,k,m,o,q,s,u,w,y,10,12,14,16,18,1a,1c,1e,1g,1i,1k,1m,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y,30,32,34;9,d,f,h,j,l,n,p,r,t,v,x,z,11,13,15,17,19,1b,1d,1f,1h,1j,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x,2z,31,33;2,6,8,a,c,e,g,i,k,m,o,q,s,u,w,y,10,12,14,16,18,1a,1c,1e,1g,1i,1k,1m,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y,30,32,34;3,5,7,9,b,d,f,h,j,l,n,p,r,t,11,13,15,17,19,1b,1d,1f,1h,1j,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x,2z,31,33;4,6,8,a,c,e,g,i,k,m,o,q,s,10,12,14,16,18,1a,1c,1e,1g,1i,1k,1m,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y,30,32,34;1,3,5,7,9,b,d,f,h,j,l,n,p,r,t,11,17,19,1b,1d,1f,1h,1j,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x,2z,31,33;2,4,6,8,a,c,e,g,i,k,m,o,q,s,18,1a,1c,1e,1g,1i,1k,1m,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y,30,32;3,5,7,9,b,d,f,h,j,l,n,p,r,19,1b,1d,1f,1h,1j,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x,2z,31;2,4,6,8,a,c,e,g,i,k,m,o,q,s,1a,1c,1e,1g,1i,1k,1m,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y,30,32;5,7,f,h,j,l,n,p,r,t,1b,1d,1f,1h,1j,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x,2z,31;6,k,m,o,q,s,u,w,1c,1e,1g,1i,1k,1m,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y,30,32;j,l,n,p,r,t,v,x,z,1f,1h,1j,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x,2z,31,33;k,m,o,q,s,u,w,y,10,1k,1m,1o,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y;l,n,p,r,t,v,x,z,11,1l,1n,1p,1r,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v;m,o,q,s,u,w,y,10,12,1q,1s,1u,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w,2y;n,p,r,t,v,x,z,11,13,1t,1v,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x;o,q,s,u,w,y,10,12,14,1w,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o,2q,2s,2u,2w;p,r,t,v,x,z,11,13,15,17,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n,2p,2r,2t,2v,2x;s,u,w,y,10,12,14,16,18,1a,1c,1e,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k,2m,2o;t,v,x,z,11,13,15,17,19,1b,1d,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l;w,y,10,12,14,16,18,1a,1c,1e,1g,1y,20,22,24,26,28,2a,2c,2e,2g,2i,2k;13,15,17,19,1b,1d,1f,1h,1j,1l,1x,1z,21,23,25,27,29,2b,2d,2f,2h,2j,2l,2n;c,14,16,18,1a,1c,1e,1g,1i,1k,1m,1o,1y,20,22,24,26,28,2a,2c,2e,2i,2k,2m;9,b,d,f,17,19,1b,1d,1f,1h,1j,1l,1n,1p,1r,1z,21,23,25,27,29,2b,2d,2f;a,c,e,g,1a,1c,1e,1g,1i,1q,1s,20,22,24,26,28,2a,2c,2e,2g;9,b,d,f,1b,1d,1f,1h,1r,21,23,25,27,29,2b,2d,2f,2h;a,c,e,1c,1e,1g,24,26,28,2a,2c,2e,2g,2i;9,b,d,f,1d,1f,1h,1j,25,27,29,2b,2d,2f,2h;a,c,e,1e,1g,1i,1k,26,28,2a,2c,2e,2g,2i,2k;9,b,d,f,1h,1j,1l,27,29,2b,2d,2f,2h,2j,2l,2n;a,1g,1i,28,2a,2c,2e,2g,2i,2k,2m,2o;1f,1h,29,2b,2d,2f,2h,2j,2l,2n,2p;1e,1g,2a,2c,2e,2g,2i,2k;1b,1f,2b,2d,2f,2h,2j,2l;w,y,10,12,14,16,18,1a,1c,2c,2e,2g,2i;x,z,11,13,15,17,19,1b,2d,2f,2h,2j;y,10,12,14,16,18,1a,2e,2g,2i,2k;11,13,15,17,19,1b,2h,2j,2l;18,1a;1b;2q,2y,30,32,34;2r,2t,2v,2x,2z,31,33".split(';');
  var VIEW_W = 576;
  var VIEW_H = 661;
  var DOT_R = 1.31045;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function eachRange(row, cb) {
    if (!row) return;
    row.split(',').forEach(function (part) {
      var pair = part.split('-');
      var start = parseInt(pair[0], 36);
      var end = pair[1] ? parseInt(pair[1], 36) : start;
      for (var x = start; x <= end; x++) cb(x);
    });
  }

  function shader(gl, type, source) {
    var s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function program(gl, vertexSource, fragmentSource) {
    var vs = shader(gl, gl.VERTEX_SHADER, vertexSource);
    var fs = shader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vs || !fs) return null;

    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);

    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(p));
      return null;
    }

    return p;
  }

  function parseColor(value) {
    value = String(value || '').trim();
    if (!value || value.indexOf('var(') === 0) return null;

    if (value.charAt(0) === '#') {
      var hex = value.slice(1);
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.split('').map(function (char) { return char + char; }).join('');
      }
      if (hex.length === 6 || hex.length === 8) {
        var intValue = parseInt(hex, 16);
        if (!isNaN(intValue)) {
          return [
            ((intValue >> (hex.length === 8 ? 24 : 16)) & 255) / 255,
            ((intValue >> (hex.length === 8 ? 16 : 8)) & 255) / 255,
            ((intValue >> (hex.length === 8 ? 8 : 0)) & 255) / 255,
            hex.length === 8 ? (intValue & 255) / 255 : 1
          ];
        }
      }
    }

    var m = value.match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;

    var parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return [
      (parts[0] || 255) / 255,
      (parts[1] || 255) / 255,
      (parts[2] || 255) / 255,
      parts.length > 3 ? parts[3] : 1
    ];
  }

  function readColor(computed, props, fallback) {
    for (var i = 0; i < props.length; i++) {
      var color = parseColor(computed.getPropertyValue(props[i]));
      if (color) return color;
    }

    return parseColor(fallback) || [1, 1, 1, 1];
  }

  var vertexSource = `
attribute vec2 a_pos;
attribute float a_opacity;
attribute float a_kind;
attribute float a_delay;
attribute float a_speed;

uniform vec2 u_canvasSize;
uniform vec2 u_offset;
uniform float u_scale;
uniform float u_pointSize;
uniform float u_time;

varying float v_alpha;
varying float v_wave;
varying float v_star;

void main(){
  float xNorm = a_pos.x / 576.0;
  float yNorm = a_pos.y / 661.0;

  float phase = ((u_time / max(a_speed, 0.001)) + a_delay) * 6.28318530718;
  float micro = 0.5 + 0.5 * sin(phase);
  float wavePhase = fract(u_time * 0.28 - yNorm * 1.18 + xNorm * 0.14 + a_delay * 0.025);
  float wave = smoothstep(0.025, 0.16, wavePhase) * (1.0 - smoothstep(0.16, 0.34, wavePhase));
  float sparkle = 0.0;

  if(a_kind > 0.5){
    sparkle = pow(max(0.0, micro), 18.0);
  }

  float alpha = a_opacity * (1.08 + micro * 0.05) + wave * 0.25 + sparkle * 0.46;
  float size = u_pointSize;

  size *= 1.0 + wave * 0.18 + sparkle * 0.54;

  vec2 pixel = a_pos * u_scale + u_offset;
  vec2 clip = vec2(
    pixel.x / u_canvasSize.x * 2.0 - 1.0,
    1.0 - pixel.y / u_canvasSize.y * 2.0
  );

  v_alpha = alpha;
  v_wave = wave;
  v_star = sparkle * a_kind;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = max(1.0, size);
}
`;


  var fragmentSource = `
precision mediump float;

uniform vec4 u_color;
uniform vec4 u_glowColor;
uniform vec4 u_starColor;
varying float v_alpha;
varying float v_wave;
varying float v_star;

void main(){
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r = length(p);
  float body = 1.0 - smoothstep(0.42, 0.78, r);
  float core = 1.0 - smoothstep(0.02, 0.34, r);
  float halo = (1.0 - smoothstep(0.16, 1.0, r)) * (0.32 + v_wave * 0.38);
  float crossX = (1.0 - smoothstep(0.00, 0.075, abs(p.y))) * (1.0 - smoothstep(0.12, 0.95, abs(p.x)));
  float crossY = (1.0 - smoothstep(0.00, 0.075, abs(p.x))) * (1.0 - smoothstep(0.12, 0.95, abs(p.y)));
  float starlight = (crossX + crossY) * v_star * 0.22;
  float alpha = v_alpha * (body + core * 0.22 + halo) + starlight;

  if(alpha <= 0.004) discard;

  vec3 color = mix(u_color.rgb, u_glowColor.rgb, clamp(v_wave * 0.88, 0.0, 1.0));
  color = mix(color, u_starColor.rgb, clamp(v_star * 0.82 + core * 0.08, 0.0, 1.0));

  gl_FragColor = vec4(color, min(alpha, 1.0) * u_color.a);
}
`;


  ready(function () {
    document.querySelectorAll('[data-aiu-balkan-map]').forEach(function (host) {
      if (host.getAttribute('data-aiu-ready') === '1') return;
      host.setAttribute('data-aiu-ready', '1');

      var canvas = document.createElement('canvas');
      canvas.width = VIEW_W;
      canvas.height = VIEW_H;
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.aspectRatio = VIEW_W + ' / ' + VIEW_H;

      host.replaceChildren(canvas);

      var gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance'
      });

      if (!gl) return;

      var p = program(gl, vertexSource, fragmentSource);
      if (!p) return;

      var data = [];
      var index = 0;

      rows.forEach(function (row, rowIndex) {
        var cy = ys[rowIndex];

        eachRange(row, function (xIndex) {
          var cx = 18.72 + xIndex * 4.68;
          var seed = ((index * 9301 + 49297) % 233280) / 233280;
          var baseOpacity = 0.40 + seed * 0.18;
          var verticalProgress = cy / VIEW_H;
          var horizontalDrift = cx / VIEW_W;
          var kind = ((index + 11) % 17 === 0 || seed > 0.965) ? 1 : 0;
          var delay = seed * 5.7 + verticalProgress * 2.8 + horizontalDrift * 0.9;
          var speed = 4.4 + seed * 3.4;

          data.push(cx, cy, baseOpacity, kind, delay, speed);
          index++;
        });
      });

      var buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

      gl.useProgram(p);

      var stride = 6 * 4;

      function attr(name, size, offset) {
        var loc = gl.getAttribLocation(p, name);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
      }

      attr('a_pos', 2, 0);
      attr('a_opacity', 1, 2 * 4);
      attr('a_kind', 1, 3 * 4);
      attr('a_delay', 1, 4 * 4);
      attr('a_speed', 1, 5 * 4);

      var uCanvasSize = gl.getUniformLocation(p, 'u_canvasSize');
      var uOffset = gl.getUniformLocation(p, 'u_offset');
      var uScale = gl.getUniformLocation(p, 'u_scale');
      var uPointSize = gl.getUniformLocation(p, 'u_pointSize');
      var uTime = gl.getUniformLocation(p, 'u_time');
      var uColor = gl.getUniformLocation(p, 'u_color');
      var uGlowColor = gl.getUniformLocation(p, 'u_glowColor');
      var uStarColor = gl.getUniformLocation(p, 'u_starColor');

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var isVisible = true;
      var isRunning = false;

      function queueDraw() {
        if (isRunning) return;
        isRunning = true;
        requestAnimationFrame(draw);
      }

      function draw(now) {
        isRunning = false;
        if (!host.isConnected) return;

        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var rect = canvas.getBoundingClientRect();
        var width = Math.max(1, Math.round(rect.width * dpr));
        var height = Math.max(1, Math.round(rect.height * dpr));

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
        }

        var scale = Math.min(width / VIEW_W, height / VIEW_H);
        var offsetX = (width - VIEW_W * scale) * 0.5;
        var offsetY = (height - VIEW_H * scale) * 0.5;

        var computed = getComputedStyle(host);
        var color = readColor(computed, ['--aiu-map-dot-color', '--colors-brand--brand-4'], computed.color || '#5adfff');
        var glowColor = readColor(computed, ['--aiu-map-glow-color', '--colors-brand--brand-3'], '#00adef');
        var starColor = readColor(computed, ['--aiu-map-star-color', '--colors-interface--white'], '#ffffff');

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uCanvasSize, width, height);
        gl.uniform2f(uOffset, offsetX, offsetY);
        gl.uniform1f(uScale, scale);
        gl.uniform1f(uPointSize, DOT_R * 2 * scale);
        gl.uniform1f(uTime, now * 0.001);
        gl.uniform4f(uColor, color[0], color[1], color[2], color[3]);
        gl.uniform4f(uGlowColor, glowColor[0], glowColor[1], glowColor[2], glowColor[3]);
        gl.uniform4f(uStarColor, starColor[0], starColor[1], starColor[2], starColor[3]);

        gl.drawArrays(gl.POINTS, 0, data.length / 6);

        if (isVisible && !reduceMotion && document.visibilityState !== 'hidden') {
          queueDraw();
        }
      }

      if ('IntersectionObserver' in window) {
        isVisible = false;
        var observer = new IntersectionObserver(function (entries) {
          isVisible = entries[0] && entries[0].isIntersecting;
          if (isVisible) queueDraw();
        }, { rootMargin: '160px 0px' });
        observer.observe(host);
      }

      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'hidden' && isVisible) queueDraw();
      });

      queueDraw();
    });
  });
}

/**
 * Adds nofollow attribute to links in article bodies.
 * @param {Document|HTMLElement} page - The page or container to process.
 * @param {Array<string>} whitelistedDomains - Domains to exclude from nofollow (e.g. example.com). Subdomains are automatically included (e.g. sub.example.com). Case-insensitive.
 */
function setArticleBodyLinksToNofollow(
  page,
  whitelistedDomains = []
) {
  const normalizedWhitelist = whitelistedDomains.map((domain) =>
    domain.toLowerCase()
  );

  const isWhitelisted = (hostname) => {
    const normalizedHostname = hostname.toLowerCase();

    return normalizedWhitelist.some(
      (domain) =>
        normalizedHostname === domain ||
        normalizedHostname.endsWith(`.${domain}`)
    );
  };

  const articleBodies = page.querySelectorAll('[data-article-body]');

  articleBodies.forEach((body) => {
    const links = body.querySelectorAll('a[href]');

    links.forEach((link) => {
      try {
        const url = new URL(link.href, window.location.origin);

        if (!isWhitelisted(url.hostname)) {
          link.setAttribute('rel', 'nofollow');
        }
      } catch {
        // Ignore invalid URLs
      }
    });
  });
}


// TODO init coming-soon / legal page blob animation

// TODO init CMS filters (have on NUTRI)

// TODO init button hover animation

// TODO init blob animations

// TODO glitter map not working on transition

// WF
// TODO check map, not visible on iOS