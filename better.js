// ==UserScript==
// @name         Stop Redirect with Multiple Redirect Handling
// @version      0.13
// @description  Prevents redirects, handles multiple /out/ redirects, and opens links in new tabs w/o permission
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    function getFinalUrl(url, callback) {
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                const finalUrl = response.finalUrl || url;
                callback(finalUrl);
            },
            onerror: function() {
                callback(url);
            }
        });
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

                getFinalUrl(link.href, function(actualUrl) {
                    if (isSameHostname(actualUrl)) {
                        console.log(actualUrl);
                    } else {
                        displayURL(actualUrl);
                    }
                });
            }
        }, true);
    }

    setupEventListeners();
})();
