/**
 * GDS Landing — GA4 표준 이벤트 (전 랜딩 · GO Hub 공통)
 *
 * 이벤트:
 *   cta_click       { location }
 *   kakao_consult   { source }
 *   service_select  { service, location }
 *
 * HTML:
 *   data-track="cta" data-location="hero"
 *   data-track="cta" data-location="hero" data-source="hero"
 *   data-track="kakao" data-source="hero"
 *   data-track="service" data-service="big_nevus"
 *
 * 실제 로드 경로 예:
 *   scripts/analytics.js  (랜딩)
 *   js/analytics.js       (GO)
 */
(function () {
  "use strict";

  var MEASUREMENT_ID = "G-MK0LN1YMXJ";
  var bound = false;

  // gtag 스텁이 아직 없으면 생성 (스크립트 로드 순서 대비)
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  console.log("[GDS Analytics] analytics.js loaded");
  console.log("[GDS Analytics] typeof gtag =", typeof window.gtag);
  console.log("[GDS Analytics] dataLayer length =", window.dataLayer.length);

  function sendEvent(eventName, params) {
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

    // DebugView 세션에서 커스텀 이벤트가 보이도록 강제
    if (
      /(?:\?|&)debug_mode=1(?:&|$)/.test(window.location.search) ||
      /(?:\?|&)ga_debug=1(?:&|$)/.test(window.location.search)
    ) {
      payload.debug_mode = true;
    }

    if (typeof window.gtag !== "function") {
      console.error("[GDS Analytics] STOPPED: gtag is not a function — cannot send", eventName, payload);
      return false;
    }

    window.gtag("event", eventName, payload);
    console.log("[GDS Analytics] gtag('event') OK:", eventName, payload);
    return true;
  }

  function trackCTA(location, source) {
    console.log("[GDS Analytics] trackCTA called");

    if (!location) {
      console.error("[GDS Analytics] STOPPED at trackCTA: No data-location found");
      return;
    }

    console.log("CTA CLICK");
    console.log("location: " + location);
    console.log("source: " + (source || "(none)"));

    sendEvent("cta_click", { location: String(location) });
  }

  function trackKakao(source) {
    console.log("[GDS Analytics] trackKakao called");

    if (!source) {
      console.error("[GDS Analytics] STOPPED at trackKakao: No data-source found");
      return;
    }

    console.log("KAKAO CLICK");
    console.log("source: " + source);

    sendEvent("kakao_consult", { source: String(source) });
  }

  /**
   * GO Hub — 진료 카드 선택
   * data-track="service" data-service="big_nevus"
   */
  function trackService(service, location) {
    console.log("[GDS Analytics] trackService called");

    if (!service) {
      console.error("[GDS Analytics] STOPPED at trackService: No data-service found");
      return;
    }

    var loc = location || "go_page";

    console.log("SERVICE SELECT");
    console.log("service : " + service);
    console.log("location : " + loc);

    sendEvent("service_select", {
      service: String(service),
      location: String(loc),
    });
  }

  function onTrackClick(el) {
    console.log("[GDS Analytics] onTrackClick called", el);

    var track = (el.getAttribute("data-track") || "").trim();
    var location = el.getAttribute("data-location");
    var source = el.getAttribute("data-source");
    var service = el.getAttribute("data-service");

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
      trackCTA(location, source);
      if (source) trackKakao(source);
      return;
    }

    if (track === "kakao") {
      if (location) trackCTA(location, source);
      trackKakao(source);
      return;
    }

    if (track === "service") {
      trackService(service, location);
      return;
    }

    console.error("[GDS Analytics] STOPPED: Unknown data-track value:", track);
  }

  function handleDocumentClick(event) {
    var target = event.target;
    if (!target || typeof target.closest !== "function") {
      // SVG/텍스트 노드 등
      if (target && target.parentElement) target = target.parentElement;
      else return;
    }

    var el = target.closest("[data-track]");
    if (!el) return;

    console.log("[GDS Analytics] click captured on [data-track]");
    onTrackClick(el);
  }

  function bindTracking() {
    if (bound) {
      console.log("[GDS Analytics] bindTracking skipped (already bound)");
      return;
    }
    bound = true;

    var els = document.querySelectorAll("[data-track]");
    console.log("[GDS Analytics] bindTracking: found " + els.length + " [data-track] elements");

    if (!els.length) {
      console.error("[GDS Analytics] STOPPED at bindTracking: No data-track found in DOM");
    } else {
      els.forEach(function (el, i) {
        console.log(
          "[GDS Analytics] #" + (i + 1),
          "track=" + el.getAttribute("data-track"),
          "location=" + el.getAttribute("data-location"),
          "source=" + el.getAttribute("data-source"),
          "service=" + el.getAttribute("data-service")
        );
      });
    }

    document.addEventListener("click", handleDocumentClick, true);
    console.log("[GDS Analytics] click listener registered (capture + delegation)");
  }

  if (document.readyState === "loading") {
    console.log("[GDS Analytics] waiting for DOMContentLoaded");
    document.addEventListener("DOMContentLoaded", bindTracking);
  } else {
    console.log("[GDS Analytics] DOM already ready, binding now");
    bindTracking();
  }

  window.GDSAnalytics = {
    trackCTA: trackCTA,
    trackKakao: trackKakao,
    trackService: trackService,
    /** DebugView 수동 테스트: 콘솔에서 GDSAnalytics.test() 실행 */
    test: function () {
      console.log("[GDS Analytics] manual test start");
      trackCTA("hero", "hero");
      trackKakao("hero");
      trackService("big_nevus", "go_page");
      console.log("[GDS Analytics] manual test done — DebugView에서 cta_click / kakao_consult / service_select 확인");
    },
  };
})();
