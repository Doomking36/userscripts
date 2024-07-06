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
        let lastUrl = url;

        while (redirectCount < maxRedirects) {
            try {
                response = await fetch(lastUrl, {
                    method: 'GET',
                    redirect: 'manual'
                });

                if (response.status >= 300 && response.status < 400 && response.headers.get('Location')) {
                    lastUrl = new URL(response.headers.get('Location'), lastUrl).href;
                    redirectCount++;
                } else {
                    break;
                }
            } catch (error) {
                console.error('Error fetching URL:', error);
                break;
            }
        }

        return lastUrl;
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

                try {
                    const actualUrl = await getFinalUrl(link.href);
                    if (isSameHostname(actualUrl)) {
                        console.log(actualUrl);
                    } else {
                        displayURL(actualUrl);
                    }
                } catch (error) {
                    console.error('Error processing URL:', error);
                }
            }
        }, true);
    }

    setupEventListeners();
})();
