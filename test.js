// ==UserScript==
// @name         Strict Block Redirects and New Tabs
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Strictly block redirects and new tabs, allow user to decide, with a list of trusted domains
// @author       Your Name
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const trustedDomains = ['example.com', 'trustedsite.com'];

    // Function to check if a domain is trusted
    function isTrustedDomain(url) {
        const link = document.createElement('a');
        link.href = url;
        return trustedDomains.includes(link.hostname);
    }

    function confirmRedirect(url) {
        if (!isTrustedDomain(url)) {
            if (!confirm(`The website is attempting to redirect to:\n\n${url}\n\nDo you want to proceed?`)) {
                window.stop();
                throw new Error(`Blocked redirect to: ${url}`);
            }
        }
    }

    function interceptEvent(event) {
        const url = event.target.href || event.target.action;
        if (url && !isTrustedDomain(url)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            confirmRedirect(url);
        }
    }

    // Intercept click and submit events
    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'A' || event.target.closest('a')) {
            interceptEvent(event);
        }
    }, true);

    document.addEventListener('submit', function(event) {
        if (event.target.tagName === 'FORM' || event.target.closest('form')) {
            interceptEvent(event);
        }
    }, true);

    // Intercept window.open
    const originalWindowOpen = window.open;
    window.open = function(url, ...rest) {
        confirmRedirect(url);
        return originalWindowOpen.call(window, url, ...rest);
    };

    // Intercept location change methods
    const originalLocationAssign = window.location.assign;
    window.location.assign = function(url) {
        confirmRedirect(url);
        return originalLocationAssign.call(window.location, url);
    };

    const originalLocationReplace = window.location.replace;
    window.location.replace = function(url) {
        confirmRedirect(url);
        return originalLocationReplace.call(window.location, url);
    };

    // Monitor changes to location.href
    const originalSetHref = Object.getOwnPropertyDescriptor(window.location.__proto__, 'href').set;
    Object.defineProperty(window.location.__proto__, 'href', {
        set: function(url) {
            confirmRedirect(url);
            originalSetHref.call(window.location, url);
        }
    });

    // Intercept history pushState and replaceState
    ['pushState', 'replaceState'].forEach(method => {
        const originalMethod = history[method];
        history[method] = function(state, title, url) {
            if (url) confirmRedirect(url);
            return originalMethod.apply(history, arguments);
        };
    });

    // Monitor changes in the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                Array.from(mutation.addedNodes).forEach((node) => {
                    if (node.tagName === 'A' || node.tagName === 'FORM') {
                        node.addEventListener('click', interceptEvent, true);
                        node.addEventListener('submit', interceptEvent, true);
                    }
                    if (node.querySelectorAll) {
                        const links = node.querySelectorAll('a');
                        links.forEach(link => link.addEventListener('click', interceptEvent, true));
                        const forms = node.querySelectorAll('form');
                        forms.forEach(form => form.addEventListener('submit', interceptEvent, true));
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Monitor location changes frequently
    let lastUrl = location.href;
    setInterval(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            confirmRedirect(currentUrl);
            lastUrl = currentUrl;
        }
    }, 100);
})();
