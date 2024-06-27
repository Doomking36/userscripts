// ==UserScript==
// @name         Block Redirects and New Tabs with Confirmation
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Blocks website redirects or new tabs and provides a confirmation dialog to accept or deny the action with the redirect URL displayed clearly.
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

    // Handle beforeunload event to block page unloads
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

    // Handle link clicks to block opening in new tabs
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

    // Handle form submissions to block form submits
    function handleFormSubmit(event) {
        event.preventDefault();
        const message = `Are you sure you want to submit this form?\n\n${event.target.action}`;
        const confirmed = confirm(message);
        if (confirmed) {
            event.target.submit();
        }
    }

    // Attach event listeners to existing elements
    function attachEventListeners() {
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('click', handleLinkClick, true);
        document.addEventListener('submit', handleFormSubmit, true);
    }

    // Initial setup
    attachEventListeners();
})();
