// ==UserScript==
// @name         Block Redirects and New Tabs with Confirmation
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Blocks website redirects or new tabs and provides a confirmation dialog to accept or deny the action.
// @author       Your Name
// @match        *://*/*
// @exclude      *://www.google.com/*
// @exclude      *://www.youtube.com/*
// @exclude      *://www.github.com/*
// @exclude      *://www.reddit.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to handle beforeunload event
    function handleBeforeUnload(event) {
        event.preventDefault();
        event.returnValue = '';
        const message = 'Are you sure you want to leave this page?';
        const confirmed = confirm(message);
        if (confirmed) {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            return true;
        } else {
            return false;
        }
    }

    // Function to handle link clicks
    function handleLinkClick(event) {
        if (event.target.tagName === 'A' && event.target.target === '_blank') {
            event.preventDefault();
            const message = `Are you sure you want to open this link in a new tab?\n\n${event.target.href}`;
            const confirmed = confirm(message);
            if (confirmed) {
                window.open(event.target.href, '_blank');
            }
        }
    }

    // Add event listeners to block redirects and new tabs
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick);
})();
