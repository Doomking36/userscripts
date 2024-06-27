// ==UserScript==
// @name         Strict Block Redirects and New Tabs
// @namespace    http://tampermonkey.net/
// @version      1.8
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
        return true;
    }

    function interceptEvent(event) {
        const url = event.target.href || event.target.action;
        if (url && !isTrustedDomain(url)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            if (confirmRedirect(url)) {
                window.location.href = url;
            }
        }
    }

    // Listen for click events on links
    document.addEventListener('click', function(event) {
        const link = event.target.closest('a');
        if (link) {
            interceptEvent(event);
        }
    }, true);

    // Listen for form submissions
    document.addEventListener('submit', function(event) {
        if (event.target.tagName === 'FORM') {
            interceptEvent(event);
        }
    }, true);

    // Intercept window.open
    const originalWindowOpen = window.open;
    window.open = function(url, ...rest) {
        if (confirmRedirect(url)) {
            return originalWindowOpen.call(window, url, ...rest);
        }
        return null;
    };

    // Intercept location change methods
    const originalLocationAssign = window.location.assign;
    window.location.assign = function(url) {
        if (confirmRedirect(url)) {
            return originalLocationAssign.call(window.location, url);
        }
    };

    const originalLocationReplace = window.location.replace;
    window.location.replace = function(url) {
        if (confirmRedirect(url)) {
            return originalLocationReplace.call(window.location, url);
        }
    };

    // Monitor changes to the href attribute of the window location
    const originalSetHref = Object.getOwnPropertyDescriptor(window.location.__proto__, 'href').set;
    Object.defineProperty(window.location.__proto__, 'href', {
        set: function(url) {
            if (confirmRedirect(url)) {
                originalSetHref.call(window.location, url);
            }
        }
    });

    // Intercept history pushState and replaceState
    ['pushState', 'replaceState'].forEach(method => {
        const originalMethod = history[method];
        history[method] = function(state, title, url) {
            if (url && confirmRedirect(url)) {
                return originalMethod.apply(history, arguments);
            }
        };
    });

    // MutationObserver to monitor dynamic changes
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
            if (mutation.type === 'attributes' && (mutation.target.tagName === 'A' || mutation.target.tagName === 'FORM')) {
                mutation.target.addEventListener('click', interceptEvent, true);
                mutation.target.addEventListener('submit', interceptEvent, true);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

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
