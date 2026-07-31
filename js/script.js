/**
 * GDS GO — js/analytics.js 배포 폴백 복사본 (동일 Event Schema)
 */
/**
 * GDS Landing — GA4 공통 Event Schema (전 랜딩 · GO Hub)
 *
 * 이벤트:
 *   page_view       { page_type, service }
 *   service_select  { service, location, page_type }
 *   cta_click       { page_type, service, location, source }
 *   kakao_consult   { page_type, service, location, source }
 *   phone_click     { page_type, service, location, channel }
 *
 * HTML (페이지):
 *   <body data-page-type="big_nevus" data-service="big_nevus">
 *   <body data-page-type="go" data-service="go">
 *
 * HTML (요소):
 *   data-track="service" data-service="big_nevus" data-location="go_page"
 *   data-track="cta"     data-location="hero" data-source="hero"
 *   data-track="kakao"   data-location="hero" data-source="hero"
 *   data-track="phone"   data-location="hero"
 *
 * body data-page-type / data-service 는 모든 이벤트에 자동 병합.
 * 요소의 data-service 가 있으면 요소 값이 우선.
 */
(function () {
  "use strict";

  if (window.GDSAnalytics) {
    console.log("[GDS Analytics] already loaded — skip duplicate");
    return;
  }

  var MEASUREMENT_ID = "G-MK0LN1YMXJ";
  var bound = false;
  var pageViewSent = false;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  console.log("[GDS Analytics] analytics.js loaded");

  function attr(el, name) {
    if (!el || !el.getAttribute) return "";
    return (el.getAttribute(name) || "").trim();
  }

  function getPageContext() {
    var body = document.body;
    return {
      page_type: attr(body, "data-page-type") || "unknown",
      service: attr(body, "data-service") || "",
    };
  }

  function buildParams(extra, el) {
    var ctx = getPageContext();
    var params = {
      page_type: ctx.page_type,
    };
    var service = attr(el, "data-service") || ctx.service;
    var key;

    if (service) params.service = service;

    if (extra) {
      for (key in extra) {
        if (
          Object.prototype.hasOwnProperty.call(extra, key) &&
          extra[key] != null &&
          String(extra[key]).trim() !== ""
        ) {
          params[key] = extra[key];
        }
      }
    }

    return params;
  }

  function sendEvent(eventName, params, callback) {
    var payload = {
      send_to: MEASUREMENT_ID,
      transport_type: "beacon",
    };
    var key;

    for (key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key) && params[key] != null) {
        payload[key] = params[key];
      }
    }

    if (
      /(?:\?|&)debug_mode=1(?:&|$)/.test(window.location.search) ||
      /(?:\?|&)ga_debug=1(?:&|$)/.test(window.location.search)
    ) {
      payload.debug_mode = true;
    }

    if (typeof callback === "function") {
      payload.event_callback = callback;
      payload.event_timeout = 2000;
    }

    if (typeof window.gtag !== "function") {
      console.error("[GDS Analytics] STOPPED: gtag is not a function — cannot send", eventName, payload);
      if (typeof callback === "function") callback();
      return false;
    }

    window.gtag("event", eventName, payload);
    console.log("[GDS Analytics] gtag('event') OK:", eventName, payload);
    return true;
  }

  function trackPageView() {
    if (pageViewSent) return;
    pageViewSent = true;

    var params = buildParams(null, null);

    console.log("PAGE VIEW");
    console.log("page_type : " + params.page_type);
    if (params.service) console.log("service : " + params.service);

    sendEvent("page_view", params);
  }

  function trackCTA(location, source, el) {
    if (!location) {
      console.error("[GDS Analytics] STOPPED at trackCTA: No data-location found");
      return;
    }

    var params = buildParams(
      {
        location: String(location),
        source: source ? String(source) : "",
      },
      el
    );

    console.log("CTA CLICK");
    console.log("page_type : " + params.page_type);
    console.log("service : " + (params.service || "(none)"));
    console.log("location : " + params.location);
    console.log("source : " + (params.source || "(none)"));

    sendEvent("cta_click", params);
  }

  function trackKakao(location, source, el) {
    if (!source && !location) {
      console.error("[GDS Analytics] STOPPED at trackKakao: No data-source / data-location found");
      return;
    }

    var params = buildParams(
      {
        location: location ? String(location) : "",
        source: source ? String(source) : location ? String(location) : "",
      },
      el
    );

    console.log("KAKAO CONSULT");
    console.log("page_type : " + params.page_type);
    console.log("service : " + (params.service || "(none)"));
    console.log("location : " + (params.location || "(none)"));
    console.log("source : " + (params.source || "(none)"));

    sendEvent("kakao_consult", params);
  }

  function trackPhone(location, el) {
    if (!location) {
      console.error("[GDS Analytics] STOPPED at trackPhone: No data-location found");
      return;
    }

    var params = buildParams(
      {
        location: String(location),
        channel: "phone",
      },
      el
    );

    console.log("PHONE CLICK");
    console.log("page_type : " + params.page_type);
    console.log("service : " + (params.service || "(none)"));
    console.log("location : " + params.location);
    console.log("channel : phone");

    sendEvent("phone_click", params);
  }

  function trackService(service, location, el, callback) {
    if (!service) {
      console.error("[GDS Analytics] STOPPED at trackService: No data-service found");
      if (typeof callback === "function") callback();
      return;
    }

    var loc = location || "go_page";
    var params = buildParams(
      {
        service: String(service),
        location: String(loc),
      },
      el
    );

    console.log("SERVICE SELECT");
    console.log("service : " + params.service);
    console.log("location : " + params.location);
    console.log("page_type : " + params.page_type);

    sendEvent("service_select", params, callback);
  }

  function shouldDeferNavigation(el) {
    if (!el || el.tagName !== "A") return false;
    var href = el.getAttribute("href");
    if (!href || href === "#" || href.indexOf("javascript:") === 0) return false;
    var target = (el.getAttribute("target") || "").toLowerCase();
    if (target && target !== "_self") return false;
    return true;
  }

  function onTrackClick(el, event) {
    var track = attr(el, "data-track");
    var location = attr(el, "data-location");
    var source = attr(el, "data-source");
    var service = attr(el, "data-service");

    console.log(
      "[GDS Analytics] attrs → track:",
      track,
      "| location:",
      location,
      "| source:",
      source,
      "| service:",
      service
    );

    if (!track) {
      console.error("[GDS Analytics] STOPPED: No data-track found");
      return;
    }

    if (track === "cta") {
      trackCTA(location, source, el);
      if (source) trackKakao(location, source, el);
      return;
    }

    if (track === "kakao") {
      if (location) trackCTA(location, source, el);
      trackKakao(location, source, el);
      return;
    }

    if (track === "phone") {
      trackPhone(location, el);
      return;
    }

    if (track === "service") {
      if (event && shouldDeferNavigation(el)) {
        event.preventDefault();
        var url = el.href;
        var done = false;
        var go = function () {
          if (done) return;
          done = true;
          window.location.assign(url);
        };
        trackService(service, location, el, go);
        setTimeout(go, 400);
        return;
      }
      trackService(service, location, el);
      return;
    }

    console.error("[GDS Analytics] STOPPED: Unknown data-track value:", track);
  }

  function handleDocumentClick(event) {
    var target = event.target;
    if (!target || typeof target.closest !== "function") {
      if (target && target.parentElement) target = target.parentElement;
      else return;
    }

    var el = target.closest("[data-track]");
    if (!el) return;

    console.log("[GDS Analytics] click captured on [data-track]");
    onTrackClick(el, event);
  }

  function bindTracking() {
    if (bound) {
      console.log("[GDS Analytics] bindTracking skipped (already bound)");
      return;
    }
    bound = true;

    var ctx = getPageContext();
    console.log(
      "[GDS Analytics] page context → page_type:",
      ctx.page_type,
      "| service:",
      ctx.service || "(none)"
    );

    trackPageView();

    var els = document.querySelectorAll("[data-track]");
    console.log("[GDS Analytics] bindTracking: found " + els.length + " [data-track] elements");

    if (!els.length) {
      console.error("[GDS Analytics] STOPPED at bindTracking: No data-track found in DOM");
    } else {
      els.forEach(function (el, i) {
        console.log(
          "[GDS Analytics] #" + (i + 1),
          "track=" + attr(el, "data-track"),
          "location=" + attr(el, "data-location"),
          "source=" + attr(el, "data-source"),
          "service=" + attr(el, "data-service")
        );
      });
    }

    document.addEventListener("click", handleDocumentClick, true);
    console.log("[GDS Analytics] click listener registered (capture + delegation)");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindTracking);
  } else {
    bindTracking();
  }

  window.GDSAnalytics = {
    trackPageView: trackPageView,
    trackCTA: trackCTA,
    trackKakao: trackKakao,
    trackPhone: trackPhone,
    trackService: trackService,
    getPageContext: getPageContext,
    test: function () {
      console.log("[GDS Analytics] manual test start");
      trackPageView();
      trackService("big_nevus", "go_page", null);
      trackCTA("hero", "hero", null);
      trackKakao("hero", "hero", null);
      trackPhone("hero", null);
      console.log("[GDS Analytics] manual test done");
    },
  };
})();
