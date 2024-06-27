// ==UserScript==
// @name         Block Redirects and New Tabs with Confirmation
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Blocks website redirects or new tabs and provides a confirmation dialog to accept or deny the action with the redirect URL displayed clearly and securely.
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

    const excludedDomains = [
        'www.google.com',
        'www.youtube.com',
        'www.github.com',
        'www.reddit.com'
    ];

    function isExcluded(url) {
        const link = document.createElement('a');
        link.href = url;
        return excludedDomains.includes(link.hostname);
    }

    function isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    function handleBeforeUnload(event) {
        if (isExcluded(window.location.href)) {
            return true;
        }
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

    function handleLinkClick(event) {
        if (event.target.tagName === 'A' && event.target.target === '_blank' && !isExcluded(event.target.href)) {
            event.preventDefault();
            if (isValidURL(event.target.href)) {
                const message = `Are you sure you want to open this link in a new tab?\n\nURL: ${event.target.href}`;
                const confirmed = confirm(message);
                if (confirmed) {
                    window.open(event.target.href, '_blank');
                }
            }
        }
    }

    function handleFormSubmit(event) {
        if (!isExcluded(event.target.action)) {
            event.preventDefault();
            if (isValidURL(event.target.action)) {
                const message = `Are you sure you want to submit this form?\n\nAction: ${event.target.action}`;
                const confirmed = confirm(message);
                if (confirmed) {
                    event.target.submit();
                }
            }
        }
    }

    function attachEventListeners() {
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('click', handleLinkClick, true);
        document.addEventListener('submit', handleFormSubmit, true);
    }

    attachEventListeners();
})();
