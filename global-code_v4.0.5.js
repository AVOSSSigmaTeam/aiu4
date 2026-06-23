gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);

history.scrollRestoration = "manual";

const DEBUG = false;
const version = "4.0.4"

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
gsap.defaults({ ease: "default", duration: durationDefault });



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

}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;

  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();

  if (has('[data-footer]')) setCopyrightYear(nextPage);
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  // Runs after enter animation completes
  // if (has('[data-something]')) initSomething();

  // Add scrolltrigger based animations below
  initPageBlurAnimation();

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
  const tl = gsap.timeline();

  tl.call(() => {
    resetPage(next);
  }, null, 0);

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

        if (DEBUG) console.log("V" + version);

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
  const isSmallScreen = window.matchMedia("(max-width: 991px)").matches;

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

  const tl = gsap.timeline();

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

// TODO fix, just doesnt work
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
// TODO cahnge links when images are added
function initFavicons() {
  const regularIcon =
    'https://cdn.prod.website-files.com/6a2bd64ef620571116d167ab/6a2fefbcc5b19a5e2d0bd9f4_AI%20Univerzitet%20Favicon.png';

  const notificationIcon =
    'https://cdn.prod.website-files.com/6a2bd64ef620571116d167ab/6a2ff040d468e66a00257604_AI%20Univerzitet%20Favicon%20Notification.png';

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
  const faqItems = page.querySelectorAll("[data-faq-item]");
  if (faqItems.length === 0) {
    // if (DEBUG) console.log("No FAQ items found");
    return;
  }
  // if (DEBUG) console.log(faqItems);

  faqItems.forEach(item => {
    const question = item.querySelector("[data-faq-question]");
    const answer = item.querySelector("[data-faq-answer]");

    if (!question || !answer) return;

    const faqIconWrap = item.querySelector("[data-faq-icon-wrap]");
    const faqIcon = item.querySelector("[data-faq-icon]");
    const faqIconBar = faqIcon?.querySelector("[data-faq-icon-bar]");

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

// TODO fix just doesnt work
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
//TODO check if this owrks propperly with cross fade page transition
// function initPageBlurAnimation(page) { 
//   const topBlur = page.querySelector('[data-blur-top]');
//   const bottomBlur = page.querySelector('[data-blur-bottom]');

//   if (!topBlur || !bottomBlur) return;

//   const state = {
//     heroProgress: 0,
//     footerProgress: 0,
//   };

//   function renderBlur() {
//     const maxBlur = 3;

//     const topValue = maxBlur * state.heroProgress;
//     const bottomValue = maxBlur * state.heroProgress * (1 - state.footerProgress);

//     gsap.set(topBlur, {
//       "--blur-top": `${topValue}rem`,
//     });

//     gsap.set(bottomBlur, {
//       "--blur-bottom": `${bottomValue}rem`,
//     });
//   }

//   gsap.set(topBlur, {
//     "--blur-top": "0rem",
//   });

//   gsap.set(bottomBlur, {
//     "--blur-bottom": "0rem",
//   });

//   const animatedHeroSection = page.querySelector('[data-animated-hero]');

//   if (animatedHeroSection) {
//     ScrollTrigger.create({
//       trigger: animatedHeroSection,
//       start: "10% top",
//       end: "bottom bottom",
//       scrub: true,
//       onUpdate: (self) => {
//         state.heroProgress = self.progress;
//         renderBlur();
//       },
//     });
//   } else {
//     state.heroProgress = 1;
//     renderBlur();
//   }

//   const footer = page.querySelector('[data-footer]');

//   if (footer) {
//     ScrollTrigger.create({
//       trigger: footer,
//       start: "top bottom",
//       end: "bottom bottom",
//       scrub: true,
//       onUpdate: (self) => {
//         state.footerProgress = self.progress;
//         renderBlur();
//       },
//     });
//   }

//   // if (DEBUG) console.log("page blur initialized");
// }

function setCopyrightYear(page) {
  const yearElement = page.querySelector("[data-copyright-year]");
  if (!yearElement) return;
  const currentYear = new Date().getFullYear();
  yearElement.textContent = currentYear;
  if (DEBUG) console.log("Copyright year set to", currentYear);
}

// popups
// TODO init popups


//animations
// TODO init SP service item blob animation

// TODO init coming-soon / legal page blob animation

// TODO add date formating function (have on NUTRI)