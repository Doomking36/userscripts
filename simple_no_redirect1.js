// ==UserScript==
// @name         Block Redirects and New Tabs with URL Confirmation
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Block websites from redirecting or opening new tabs with URL confirmation and stricter control
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Block beforeunload events with user confirmation and URL display
    window.addEventListener('beforeunload', function(event) {
        const confirmationMessage = 'This page is trying to redirect. Do you want to allow it?';
        const userChoice = confirm(confirmationMessage);
        if (!userChoice) {
            event.preventDefault();
            event.returnValue = '';
            return false;
        }
    });

    // Block click events that attempt to open new tabs with user confirmation and URL display
    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'A' && event.target.target === '_blank') {
            const confirmationMessage = `This page is trying to open a new tab to the URL: ${event.target.href}. Do you want to allow it?`;
            const userChoice = confirm(confirmationMessage);
            if (!userChoice) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }, true);

    // Strictly block other possible methods to open new tabs with user confirmation and URL display
    const open = window.open;
    window.open = function(url, name, specs) {
        const confirmationMessage = `This page is trying to open a new tab to the URL: ${url}. Do you want to allow it?`;
        const userChoice = confirm(confirmationMessage);
        if (!userChoice) {
            return null;
        } else {
            return open.call(window, url, name, specs);
        }
    };

    // Block form submissions that might cause redirects with user confirmation and URL display
    document.addEventListener('submit', function(event) {
        const formAction = event.target.action || document.location.href;
        const confirmationMessage = `This page is trying to submit a form to the URL: ${formAction}. Do you want to allow it?`;
        const userChoice = confirm(confirmationMessage);
        if (!userChoice) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);

    // Use MutationObserver to prevent the creation of new iframes or popups
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === 'IFRAME' || node.tagName === 'FORM') {
                        const confirmationMessage = `This page is trying to add an element that may open a new tab or redirect. Do you want to allow it?`;
                        const userChoice = confirm(confirmationMessage);
                        if (!userChoice) {
                            node.remove();
                        }
                    }
                });
            }
        });
    });

    observer.observe(document, { childList: true, subtree: true });

})();
