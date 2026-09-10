browser.browserAction.onClicked.addListener(async (tab) => {
  /*if (!tab.url || !/^https:\/\/(www\.)?bridgebase\.com\//i.test(tab.url)) {
    return;
  }*/

  await browser.tabs.executeScript(tab.id, {
    file: "script.js"
  });
});