
let rules = [];
let defaultRedirectUrl = "";

function updateRules() {
  chrome.storage.local.get(["blockRules"], (data) => {
    rules = data.blockRules || [];
    defaultRedirectUrl = data.defaultRedirectUrl || "";
    console.log({ rules, defaultRedirectUrl })
    console.log("[DopemineBlock] Rules loaded:", rules, defaultRedirectUrl);
  });
}

function getRedirectUrl(url) {
  for (const rule of rules) {
    if (rule.pattern && url.includes(rule.pattern)) {
      const redirect = rule.redirectUrl || defaultRedirectUrl;
      if (redirect) {
        console.log(`[DopemineBlock] Matched url ${rule.pattern} -> ${url}, redirecting to ${redirect}`);
        return redirect;
      }
    }
  }
  return false;
}

chrome.storage.onChanged.addListener(updateRules);
updateRules();

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  console.log("[DopemineBlock] History state updated:", details);
  const redirect = getRedirectUrl(details.url);
  if (redirect) {
    chrome.tabs.update(details.tabId, { url: redirect });
  }
});


chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const redirect = getRedirectUrl(details.url);
    if (redirect) {
      return { redirectUrl: redirect };
    }
    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
