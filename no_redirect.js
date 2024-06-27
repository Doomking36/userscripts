// ==UserScript==
// @name         Block Redirects and New Tabs with Confirmation
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Provides a confirmation dialog for untrusted domains when links are clicked or forms are submitted, except for trusted domains/websites.
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const trustedDomains = [
        'www.google.com',
        'www.youtube.com',
        'www.github.com',
        'www.reddit.com'
    ];

    function isTrusted(url) {
        try {
            const link = new URL(url);
            return trustedDomains.includes(link.hostname);
        } catch {
            return false;
        }
    }

    function handleLinkClick(event) {
        const anchor = event.target.closest('a');
        if (anchor && anchor.href && !isTrusted(anchor.href)) {
            event.preventDefault();
            const message = `Are you sure you want to open this link?\n\nURL: ${anchor.href}`;
            const confirmed = confirm(message);
            if (confirmed) {
                if (anchor.target === '_blank') {
                    window.open(anchor.href, '_blank');
                } else {
                    window.location.href = anchor.href;
                }
            }
        }
    }

    function handleFormSubmit(event) {
        if (event.target.action && !isTrusted(event.target.action)) {
            event.preventDefault();
            const message = `Are you sure you want to submit this form?\n\nAction: ${event.target.action}`;
            const confirmed = confirm(message);
            if (confirmed) {
                event.target.submit();
            }
        }
    }

    function handleBeforeUnload(event) {
        if (!isTrusted(window.location.href)) {
            event.preventDefault();
            event.returnValue = '';
            const message = 'Are you sure you want to leave this page?';
            const confirmed = confirm(message);
            if (confirmed) {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            }
        }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick, true);
    document.addEventListener('submit', handleFormSubmit, true);
})();
