// ==UserScript==
// @name         Stop Redirect with Multiple Redirect Handling
// @version      0.13
// @description  Prevents redirects, handles multiple /out/ redirects, and opens links in new tabs w/o permission
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    async function getFinalUrl(url) {
        let response;
        let redirectCount = 0;
        const maxRedirects = 10;

        while (redirectCount < maxRedirects) {
            response = await fetch(url, {
                method: 'HEAD',
                redirect: 'manual'
            });

            if (response.status >= 300 && response.status < 400 && response.headers.get('Location')) {
                url = new URL(response.headers.get('Location'), url).href;
                redirectCount++;
            } else {
                break;
            }
        }

        return url;
    }

    function isSameHostname(href) {
        const linkUrl = new URL(href, window.location.origin);
        const currentUrl = new URL(window.location.href);
        return linkUrl.hostname === currentUrl.hostname;
    }

    function displayURL(url) {
        window.open(url, '_blank');
    }

    async function setupEventListeners() {
        document.addEventListener('click', async function(event) {
            const link = event.target.closest('a');
            if (link && link.href) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                const actualUrl = await getFinalUrl(link.href);
                if (isSameHostname(actualUrl)) {
                    console.log(actualUrl);
                } else {
                    displayURL(actualUrl);
                }
            }
        }, true);
    }

    setupEventListeners();
})();
