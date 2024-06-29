// ==UserScript==
// @name         Block Redirects and New Tabs with URL Confirmation
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Block websites from redirecting or opening new tabs with URL confirmation
// @author       Your Name
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

    // Block other possible methods to open new tabs with user confirmation and URL display
    const open = window.open;
    window.open = function(url) {
        const confirmationMessage = `This page is trying to open a new tab to the URL: ${url}. Do you want to allow it?`;
        const userChoice = confirm(confirmationMessage);
        if (!userChoice) {
            return null;
        } else {
            return open.apply(window, arguments);
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
})();
