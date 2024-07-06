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

    function getFinalUrl(href, callback) {
        GM_xmlhttpRequest({
            method: "GET",
            url: href,
            followRedirects: true,
            onload: function(response) {
                callback(response.finalUrl);
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

    function addFinalUrlLink(node, finalUrl) {
        const link = document.createElement('a');
        link.href = finalUrl;
        link.textContent = "Final URL";
        link.target = "_blank";
        link.style.color = 'red';
        node.parentElement.appendChild(link);
    }

    async function setupEventListeners() {
        document.addEventListener('click', function(event) {
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
                    addFinalUrlLink(link, actualUrl);
                });
            }
        }, true);
    }

    setupEventListeners();
})();
