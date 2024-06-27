// ==UserScript==
// @name         Strict Block Redirects and New Tabs
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Strictly block redirects and new tabs, allow user to decide, with a list of trusted domains
// @author       Your Name
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const trustedDomains = ['example.com', 'trustedsite.com'];

    function isTrustedDomain(url) {
        const link = document.createElement('a');
        link.href = url;
        return trustedDomains.includes(link.hostname);
    }

    function confirmRedirect(url) {
        if (!isTrustedDomain(url)) {
            return confirm(`The website is attempting to redirect to:\n\n${url}\n\nDo you want to proceed?`);
        }
        return true;
    }

    function interceptEvent(event) {
        const target = event.target;
        let url = '';

        if (target.tagName === 'A') {
            url = target.href;
        } else if (target.tagName === 'FORM') {
            url = target.action;
        }

        if (url && !isTrustedDomain(url)) {
            event.preventDefault();
            if (confirmRedirect(url)) {
                if (target.tagName === 'A') {
                    window.location.href = url;
                } else if (target.tagName === 'FORM') {
                    target.submit();
                }
            }
        }
    }

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (link) {
            interceptEvent(event);
        }
    }, true);

    document.addEventListener('submit', (event) => {
        if (event.target.tagName === 'FORM') {
            interceptEvent(event);
        }
    }, true);

    const originalWindowOpen = window.open;
    window.open = function(url, ...rest) {
        if (confirmRedirect(url)) {
            return originalWindowOpen.call(window, url, ...rest);
        }
        return null;
    };

    const originalLocationAssign = window.location.assign;
    window.location.assign = function(url) {
        if (confirmRedirect(url)) {
            originalLocationAssign.call(window.location, url);
        }
    };

    const originalLocationReplace = window.location.replace;
    window.location.replace = function(url) {
        if (confirmRedirect(url)) {
            originalLocationReplace.call(window.location, url);
        }
    };

    const originalSetHref = Object.getOwnPropertyDescriptor(window.location.__proto__, 'href').set;
    Object.defineProperty(window.location.__proto__, 'href', {
        set: function(url) {
            if (confirmRedirect(url)) {
                originalSetHref.call(window.location, url);
            }
        }
    });

    ['pushState', 'replaceState'].forEach(method => {
        const originalMethod = history[method];
        history[method] = function(state, title, url) {
            if (url && confirmRedirect(url)) {
                return originalMethod.apply(history, arguments);
            }
        };
    });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                Array.from(mutation.addedNodes).forEach((node) => {
                    if (node.nodeType === 1) {
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
                    }
                });
            }
            if (mutation.type === 'attributes' && (mutation.target.tagName === 'A' || mutation.target.tagName === 'FORM')) {
                mutation.target.addEventListener('click', interceptEvent, true);
                mutation.target.addEventListener('submit', interceptEvent, true);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'action'] });

    let lastUrl = location.href;
    setInterval(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            if (!confirmRedirect(currentUrl)) {
                history.back();
            }
            lastUrl = currentUrl;
        }
    }, 500);
})();
