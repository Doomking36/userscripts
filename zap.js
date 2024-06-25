//  ==UserScript==
//  @name  Zap Element
//  @version  0.1
//  @description  Delete element on page by 'zapping' it
//  @author  Doomking
//  @match  *://*/*
//  ==/UserScript==
document.addEventListener("keydown", ev => {
  if (ev.ctrlKey && ev.altKey && ev.key === 'z') {
    console.log('Removal mode activated. Click on an element to remove it.');
    document.addEventListener("click", clickEvent => {
      clickEvent.target?.remove?.();
      console.log('Element removed.');
    }, {once:true});
  }
});
