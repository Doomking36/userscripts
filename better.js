// ==UserScript==
// @name         Stop Redirect with Multiple Redirect Handling
// @version      0.14
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

    function createIframe(url) {
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;

            iframe.onload = function() {
                resolve(iframe.contentWindow.location.href);
            };

            iframe.onerror = function() {
                reject(new Error('Error loading iframe'));
            };

            document.body.appendChild(iframe);
        });
    }

    async function setupEventListeners() {
        document.addEventListener('click', async function(event) {
            const link = event.target.closest('a');
            if (link && link.href) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                try {
                    const actualUrl = await createIframe(link.href);
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
