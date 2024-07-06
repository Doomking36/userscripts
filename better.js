// ==UserScript==
// @name         Stop Redirect with Multiple Redirect Handling
// @version      0.15
// @description  Prevents redirects, handles multiple /out/ redirects, and opens links in new tabs w/o permission
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function isSameHostname(href) {
        const linkUrl = new URL(href, window.location.origin);
        const currentUrl = new URL(window.location.href);
        return linkUrl.hostname === currentUrl.hostname;
    }

    function displayURL(url) {
        window.open(url, '_blank');
    }

    function handleClick(event) {
        const link = event.target.closest('a');
        if (link && link.href) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            if (isSameHostname(link.href)) {
                console.log(link.href);
            } else {
                displayURL(link.href);
            }
        }
    }

    function setupEventListeners() {
        document.addEventListener('click', handleClick, true);
    }

    setupEventListeners();
})();
