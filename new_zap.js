// ==UserScript==
// @name Zap Element
// @version 0.2
// @description Delete element on page by 'zapping' it
// @author Doomking
// @match *://*/*
// ==/UserScript==

let removalMode = false;

document.addEventListener("keydown", ev => {
  if (ev.ctrlKey && ev.altKey && ev.key === 'z') {
    removalMode = !removalMode;
    if (removalMode) {
      console.log('Removal mode activated. Click on an element to remove it.');
      document.body.style.cursor = 'crosshair';
      document.addEventListener("click", removeElement, { once: true });
    } else {
      console.log('Removal mode deactivated.');
      document.body.style.cursor = 'default';
    }
  }
});

function removeElement(clickEvent) {
  if (removalMode) {
    clickEvent.target?.remove?.();
    console.log('Element removed.');
    document.body.style.cursor = 'default';
    removalMode = false;
  }
}
