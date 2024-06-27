// ==UserScript==
// @name         Block Redirects and New Tabs with Confirmation
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Blocks website redirects or new tabs and provides a confirmation popup box to accept or deny the action.
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

    // CSS for the dark theme confirmation popup
    const popupCSS = `
        #confirmationPopup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background-color: #333;
            color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            max-width: 90%;
            max-height: 80%;
            overflow-y: auto;
            font-family: Arial, sans-serif;
        }
        #popupMessage {
            margin-bottom: 20px;
            word-wrap: break-word;
        }
        #popupButtons {
            text-align: center;
        }
        #popupButtons button {
            background-color: #555;
            color: #fff;
            border: none;
            padding: 10px 20px;
            margin: 5px;
            cursor: pointer;
            border-radius: 5px;
            font-size: 14px;
        }
        #popupButtons button:hover {
            background-color: #777;
        }
    `;

    // Function to inject CSS into the document
    function injectCSS(css) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    // Function to create the confirmation popup
    function createPopup(message, callback) {
        // Create popup elements
        const popup = document.createElement('div');
        popup.id = 'confirmationPopup';

        const popupMessage = document.createElement('div');
        popupMessage.id = 'popupMessage';
        popupMessage.textContent = message;

        const popupButtons = document.createElement('div');
        popupButtons.id = 'popupButtons';

        const yesButton = document.createElement('button');
        yesButton.textContent = 'Yes';
        yesButton.onclick = () => {
            callback(true);
            document.body.removeChild(popup);
        };

        const noButton = document.createElement('button');
        noButton.textContent = 'No';
        noButton.onclick = () => {
            callback(false);
            document.body.removeChild(popup);
        };

        // Append elements to popup
        popupButtons.appendChild(yesButton);
        popupButtons.appendChild(noButton);
        popup.appendChild(popupMessage);
        popup.appendChild(popupButtons);

        // Append popup to body
        document.body.appendChild(popup);
    }

    // Function to block redirect or new tab
    function blockAction(event, message) {
        event.preventDefault();
        event.stopPropagation();
        createPopup(message, (confirmed) => {
            if (confirmed) {
                if (event.type === 'beforeunload') {
                    window.location.href = event.target.href || event.target.action;
                } else if (event.target.tagName === 'A') {
                    window.open(event.target.href, '_blank');
                }
            }
        });
    }

    // Add event listeners to block redirects and new tabs
    window.addEventListener('beforeunload', (event) => {
        blockAction(event, 'Are you sure you want to leave this page?');
    });

    document.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' && event.target.target === '_blank') {
            blockAction(event, `Are you sure you want to open this link in a new tab?\n\n${event.target.href}`);
        }
    });

    // Inject the CSS for the popup
    injectCSS(popupCSS);
})();