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

    async function getActualUrl(href) {
        try {
            const response = await fetch(href, { redirect: 'manual' });
            const actualUrl = response.url;
            return actualUrl;
        } catch (error) {
            console.error('Error fetching URL:', error);
            return href;
        }
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
        document.addEventListener('click', async function(event) {
            const link = event.target.closest('a');
            if (link && link.href) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                const actualUrl = await getActualUrl(link.href);
                if (isSameHostname(actualUrl)) {
                    console.log(actualUrl);
                } else {
                    displayURL(actualUrl);
                }
                addFinalUrlLink(link, actualUrl);
            }
        }, true);
    }

    setupEventListeners();
})();
