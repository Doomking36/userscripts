// ==UserScript==
// @name         Strict Block Redirects and New Tabs
// @namespace    http://tampermonkey.net/
// @version      1.4
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

    function interceptEvent(event) {
        const url = event.target.href || event.target.action;
        if (url && !isTrustedDomain(url)) {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (confirm(`The website is attempting to redirect or open a new tab to:\n\n${url}\n\nDo you want to proceed?`)) {
                window.location.href = url;
            }
        }
    }

    function handleLocationChange(url) {
        if (!isTrustedDomain(url)) {
            if (!confirm(`The website is attempting to redirect to:\n\n${url}\n\nDo you want to proceed?`)) {
                window.stop();
                throw new Error(`Blocked redirect to: ${url}`);
            }
        }
    }

    // Listen for click events on links
    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'A') {
            interceptEvent(event);
        }
    }, true);

    // Listen for form submissions
    document.addEventListener('submit', function(event) {
        if (event.target.tagName === 'FORM') {
            interceptEvent(event);
        }
    }, true);

    // Intercept window open
    const originalWindowOpen = window.open;
    window.open = function(url, ...rest) {
        if (!isTrustedDomain(url)) {
            if (confirm(`The website is attempting to open a new tab to:\n\n${url}\n\nDo you want to proceed?`)) {
                return originalWindowOpen.call(window, url, ...rest);
            } else {
                return null;
            }
        }
        return originalWindowOpen.call(window, url, ...rest);
    };

    // Intercept location change methods
    const originalLocationAssign = window.location.assign;
    window.location.assign = function(url) {
        if (!isTrustedDomain(url)) {
            if (confirm(`The website is attempting to redirect to:\n\n${url}\n\nDo you want to proceed?`)) {
                return originalLocationAssign.call(window.location, url);
            }
        } else {
            return originalLocationAssign.call(window.location, url);
        }
    };

    const originalLocationReplace = window.location.replace;
    window.location.replace = function(url) {
        if (!isTrustedDomain(url)) {
            if (confirm(`The website is attempting to redirect to:\n\n${url}\n\nDo you want to proceed?`)) {
                return originalLocationReplace.call(window.location, url);
            }
        } else {
            return originalLocationReplace.call(window.location, url);
        }
    };

    // Monitor changes to the href attribute of the window location
    const originalSetHref = Object.getOwnPropertyDescriptor(window.location.__proto__, 'href').set;
    Object.defineProperty(window.location.__proto__, 'href', {
        set: function(url) {
            if (!isTrustedDomain(url)) {
                if (confirm(`The website is attempting to redirect to:\n\n${url}\n\nDo you want to proceed?`)) {
                    originalSetHref.call(window.location, url);
                }
            } else {
                originalSetHref.call(window.location, url);
            }
        }
    });

    // Monitor changes to the location through other properties
    ['assign', 'replace'].forEach(function(method) {
        const originalMethod = window.location[method];
        window.location[method] = function(url) {
            if (!isTrustedDomain(url)) {
                if (confirm(`The website is attempting to redirect to:\n\n${url}\n\nDo you want to proceed?`)) {
                    return originalMethod.call(window.location, url);
                }
            } else {
                return originalMethod.call(window.location, url);
            }
        };
    });

    // Continuously monitor location changes
    setInterval(() => {
        const currentHref = window.location.href;
        handleLocationChange(currentHref);
    }, 100);

    // Additional event listeners for other potential redirects
    ['beforeunload', 'unload', 'popstate', 'hashchange'].forEach((eventType) => {
        window.addEventListener(eventType, (event) => {
            handleLocationChange(window.location.href);
        }, true);
    });

    // MutationObserver to monitor dynamic changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                Array.from(mutation.addedNodes).forEach((node) => {
                    if (node.tagName === 'A' || node.tagName === 'FORM') {
                        interceptEvent({ target: node });
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for URL changes through pushState and replaceState
    ['pushState', 'replaceState'].forEach((method) => {
        const originalMethod = history[method];
        history[method] = function(state, title, url) {
            if (url && !isTrustedDomain(url)) {
                if (confirm(`The website is attempting to redirect to:\n\n${url}\n\nDo you want to proceed?`)) {
                    return originalMethod.apply(history, arguments);
                }
            } else {
                return originalMethod.apply(history, arguments);
            }
        };
    });

})();
