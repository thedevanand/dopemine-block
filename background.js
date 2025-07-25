let rules = [];

function updateRules() {
  chrome.storage.local.get(["rules"], (data) => {
    rules = data.rules || [];
  });
}

chrome.storage.onChanged.addListener(updateRules);
updateRules();

function matchGlob(url, glob) {
  const regex = new RegExp("^" + glob
    .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
    .replace(/\*/g, '.*') + "$");
  return regex.test(url);
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    for (const rule of rules) {
      if (matchGlob(details.url, rule.pattern)) {
        return { redirectUrl: rule.redirect };
      }
    }
    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
