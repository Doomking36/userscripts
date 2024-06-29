// ==UserScript==
// @name         Block Redirects and New Tabs with URL Confirmation
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Block websites from redirecting or opening new tabs with URL confirmation
// @author       Your Name
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to show confirmation dialog
    function confirmAction(message, url) {
        const confirmationMessage = `${message}: ${url}. Do you want to allow it?`;
        return confirm(confirmationMessage);
    }

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
        const target = event.target.closest('a[target="_blank"], area[target="_blank"]');
        if (target) {
            event.preventDefault();
            const userChoice = confirmAction('This page is trying to open a new tab to the URL', target.href);
            if (userChoice) {
                window.open(target.href, '_blank');
            }
        }
    }, true);

    // Block other possible methods to open new tabs with user confirmation and URL display
    const originalOpen = window.open;
    window.open = function(url, name, specs) {
        const userChoice = confirmAction('This page is trying to open a new tab to the URL', url);
        if (userChoice) {
            return originalOpen.apply(window, arguments);
        }
        return null;
    };

    // Block form submissions that might cause redirects with user confirmation and URL display
    document.addEventListener('submit', function(event) {
        const formAction = event.target.action || document.location.href;
        const userChoice = confirmAction('This page is trying to submit a form to the URL', formAction);
        if (!userChoice) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);

    // Monitor for dynamically added or modified elements that might open new tabs
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'A' && node.target === '_blank') {
                        node.addEventListener('click', function(event) {
                            event.preventDefault();
                            const userChoice = confirmAction('This page is trying to open a new tab to the URL', node.href);
                            if (userChoice) {
                                window.open(node.href, '_blank');
                            }
                        });
                    }
                });
            } else if (mutation.type === 'attributes' && mutation.target.tagName === 'A' && mutation.target.target === '_blank') {
                mutation.target.addEventListener('click', function(event) {
                    event.preventDefault();
                    const userChoice = confirmAction('This page is trying to open a new tab to the URL', mutation.target.href);
                    if (userChoice) {
                        window.open(mutation.target.href, '_blank');
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        attributes: true,
        subtree: true,
        attributeFilter: ['target']
    });

})();
