let rules = [];
let redirectUrl = "";

function updateRules() {
  chrome.storage.local.get(["blockList", "redirectUrl"], (data) => {
    rules = data.blockList || [];
    redirectUrl = data.redirectUrl;
    console.log("[DopemineBlock] Rules loaded:", rules, redirectUrl);
  });
}

chrome.storage.onChanged.addListener(updateRules);
updateRules();

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    // console.log("[DopemineBlock] Visited:", url);

    for (const rule of rules) {
      if (url.includes(rule)) {
        console.log(`[DopemineBlock] Matched url ${rule} -> ${url}`)
        return { redirectUrl }
      }

      // try {
      //   const regex = new RegExp(rule)
      //   if (regex.test(url)) {
      //     console.log(`[DopemineBlock] MATCHED: ${rule} → ${rule.redirect}`);
      //     return { redirectUrl };
      //   }
      // } catch (err) {
      //   console.warn(`[DopemineBlock] Invalid regex: ${rule.pattern}`, err);
      // }
    }

    // console.log("[DopemineBlock] No match for:", url);
    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

