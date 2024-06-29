// ==UserScript==
// @name         Block Redirects and New Tabs with URL Confirmation
// @namespace    http://tampermonkey.net/
// @version      1.2
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
        if (event.target.tagName === 'A' && event.target.target === '_blank') {
            event.preventDefault();
            const userChoice = confirmAction('This page is trying to open a new tab to the URL', event.target.href);
            if (userChoice) {
                window.open(event.target.href);
            }
        }
    }, true);

    // Block other possible methods to open new tabs with user confirmation and URL display
    const open = window.open;
    window.open = function(url) {
        const userChoice = confirmAction('This page is trying to open a new tab to the URL', url);
        if (userChoice) {
            return open.apply(window, arguments);
        } else {
            return null;
        }
    };

    // Monitor for the use of HTML <a> tags with target="_blank" set dynamically
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'A' && node.target === '_blank') {
                        node.addEventListener('click', function(event) {
                            event.preventDefault();
                            const userChoice = confirmAction('This page is trying to open a new tab to the URL', node.href);
                            if (userChoice) {
                                window.open(node.href);
                            }
                        });
                    }
                });
            } else if (mutation.type === 'attributes' && mutation.target.tagName === 'A' && mutation.target.target === '_blank') {
                mutation.target.addEventListener('click', function(event) {
                    event.preventDefault();
                    const userChoice = confirmAction('This page is trying to open a new tab to the URL', mutation.target.href);
                    if (userChoice) {
                        window.open(mutation.target.href);
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

    // Block form submissions that might cause redirects with user confirmation and URL display
    document.addEventListener('submit', function(event) {
        const formAction = event.target.action || document.location.href;
        const userChoice = confirmAction('This page is trying to submit a form to the URL', formAction);
        if (!userChoice) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);
})();
