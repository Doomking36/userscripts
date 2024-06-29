// ==UserScript==
// @name         Interactive Redirect and New Tab Blocker with URL Display
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Allows user to accept or deny website's attempts to redirect or open new tabs, displaying the target URL
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Add styles for the prompt
    GM_addStyle(`
        #redirectPrompt {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            padding: 10px;
            z-index: 9999;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            max-width: 400px;
            font-family: Arial, sans-serif;
        }
        #redirectPrompt p {
            margin: 0 0 10px 0;
            word-break: break-all;
        }
        #redirectPrompt .url {
            font-weight: bold;
            color: #0066cc;
        }
        #redirectPrompt button {
            margin: 0 5px;
            padding: 5px 10px;
            cursor: pointer;
        }
    `);

    // Function to create and show the prompt
    function showPrompt(action, url) {
        const prompt = document.createElement('div');
        prompt.id = 'redirectPrompt';
        prompt.innerHTML = `
            <p>The website is attempting to ${action} to:</p>
            <p class="url">${url}</p>
            <button id="acceptRedirect">Accept</button>
            <button id="denyRedirect">Deny</button>
        `;
        document.body.appendChild(prompt);

        return new Promise((resolve) => {
            document.getElementById('acceptRedirect').onclick = () => {
                document.body.removeChild(prompt);
                resolve(true);
            };
            document.getElementById('denyRedirect').onclick = () => {
                document.body.removeChild(prompt);
                resolve(false);
            };
        });
    }

    // Handle beforeunload event
    window.addEventListener('beforeunload', async function(event) {
        event.preventDefault();
        const allow = await showPrompt('redirect', window.location.href);
        if (!allow) {
            event.returnValue = '';
        }
    });

    // Handle click events on links
    document.addEventListener('click', async function(event) {
        const target = event.target.closest('a');
        if (target && (target.target === '_blank' || target.getAttribute('rel') === 'noopener')) {
            event.preventDefault();
            const allow = await showPrompt('open a new tab', target.href);
            if (allow) {
                window.open(target.href, '_blank');
            }
        }
    }, true);

    // Override window.open
    const originalOpen = window.open;
    window.open = async function(url, target, features) {
        const allow = await showPrompt('open a new window', url || 'about:blank');
        if (allow) {
            return originalOpen.call(this, url, target, features);
        }
        return null;
    };

    console.log('Interactive redirect and new tab blocker with URL display is active');
})();
