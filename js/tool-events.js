/*
 * Usage events for the tool pages (loaded with defer from the tool pages only).
 *
 * Every event is pushed to window.dataLayer as:
 *   { event: 'tool_<name>', tool: '<slug>', ...params }
 * where <slug> is the page path without slashes (roas-calculator, customer-economics,
 * serp-preview, caffeine). Events are pushed regardless of consent: GTM consent mode decides
 * what is stored or sent. No personal data and no typed values (amounts, URLs, titles) are ever
 * included - only the name of an action and coarse flags.
 *
 * Events (create one GTM Custom Event trigger per name, or a regex trigger on ^tool_):
 *   tool_calculated   First time the user changes any input on the page, once per page view,
 *                     after a 800 ms pause in typing. Params: none.
 *   tool_shared       A share or copy-link action. Params: method (e.g. 'copy_link'). No tool has
 *                     such an action yet; call window.toolEvent('shared', {method: '...'}) when one
 *                     is added.
 *   tool_cta_click    Click on the "Work with me" link under a tool. Params: none.
 *   tool_crosslink    Click on a link to another tool carrying shared inputs. Params: to (slug of
 *                     the destination tool).
 *
 * Markup hooks: a link with data-tool-cta fires tool_cta_click; a link with data-tool-crosslink="<slug>"
 * fires tool_crosslink with to=<slug>.
 */
(function () {
  'use strict';

  var slug = (window.location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0]) || 'unknown';

  window.dataLayer = window.dataLayer || [];

  window.toolEvent = function (name, params) {
    var payload = { event: 'tool_' + name, tool: slug };
    if (params) {
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k) && k !== 'event' && k !== 'tool') {
          payload[k] = params[k];
        }
      }
    }
    window.dataLayer.push(payload);
  };

  // tool_calculated: once per page view, after the first input change settles.
  var calculated = false;
  var timer = null;
  function onInput(e) {
    if (calculated) return;
    var t = e.target;
    if (!t || !t.closest || !/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) || !t.closest('.page-content')) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (calculated) return;
      calculated = true;
      window.toolEvent('calculated');
    }, 800);
  }
  document.addEventListener('input', onInput, true);
  document.addEventListener('change', onInput, true);

  // Link events. Delegated so they cover links added later.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    if (a.hasAttribute('data-tool-cta')) {
      window.toolEvent('cta_click');
    } else if (a.hasAttribute('data-tool-crosslink')) {
      window.toolEvent('crosslink', { to: a.getAttribute('data-tool-crosslink') });
    }
  }, true);
})();
