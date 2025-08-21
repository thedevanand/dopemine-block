// Save button
const saveBtn = document.getElementById("saveRules");
const saveBtnText = document.getElementById("saveBtnText");

function getCurrentRulesFromDOM() {
  // Read all .rule-row inputs to get current rules
  const ruleRows = document.querySelectorAll('.rule-row');
  const rules = [];
  ruleRows.forEach(row => {
    const pattern = row.querySelector('.rule-pattern input').value.trim();
    const redirectUrl = row.querySelector('.rule-redirect input').value.trim();
    if (pattern || redirectUrl) {
      rules.push({ pattern, redirectUrl });
    }
  });
  return rules;
}

saveBtn.addEventListener('click', () => {
  const rules = getCurrentRulesFromDOM();
  saveRules(rules);
  // Show success state
  saveBtn.classList.add('success');
  saveBtnText.textContent = 'Saved!';
  setTimeout(() => {
    saveBtn.classList.remove('success');
    saveBtnText.textContent = 'Save';
  }, 1200);
});
// Storage keys
const RULES_KEY = "blockRules";
const DEFAULT_REDIRECT_KEY = "defaultRedirectUrl";

// DOM elements
const rulesList = document.getElementById("rulesList");
const rulesCount = document.getElementById("rulesCount");
const addRuleBtn = document.getElementById("addRule");
const defaultRedirectInput = document.getElementById("defaultRedirectUrl");

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get([RULES_KEY, DEFAULT_REDIRECT_KEY], (data) => {
    let rules = (data[RULES_KEY] || []).filter(r => r.pattern || r.redirectUrl);
    const defaultRedirect = data[DEFAULT_REDIRECT_KEY] || "";
    renderRules(rules);
    defaultRedirectInput.value = defaultRedirect;
  });
}

// Save rules to storage
function saveRules(rules) {
  chrome.storage.local.set({ [RULES_KEY]: rules });
}

// Save default redirect URL
function saveDefaultRedirect(url) {
  chrome.storage.local.set({ [DEFAULT_REDIRECT_KEY]: url });
}

// Render rules table
function renderRules(rules) {
  // Remove all-empty rules except the last one
  // let nonEmpty = rules.filter(r => r.pattern || r.redirectUrl);
  // let hasEmpty = rules.some(r => !r.pattern && !r.redirectUrl);
  // if (!hasEmpty) nonEmpty.push({ pattern: "", redirectUrl: "" });
  // rules = nonEmpty;

  rulesList.innerHTML = "";
  rules.forEach((rule, idx) => {
    const row = document.createElement("div");
    row.className = "rule-row";

    // Top: number and pattern input
    const top = document.createElement("div");
    top.className = "rule-row-top";
    const number = document.createElement("span");
    number.className = "rule-number";
    number.textContent = (idx + 1).toString();
    top.appendChild(number);
    const patternDiv = document.createElement("div");
    patternDiv.className = "rule-pattern";
    const patternInput = document.createElement("input");
    patternInput.type = "text";
    patternInput.value = rule.pattern;
    patternInput.placeholder = "Pattern";
    patternInput.addEventListener("input", (e) => {
      rules[idx].pattern = e.target.value;
    });
    patternDiv.appendChild(patternInput);
    top.appendChild(patternDiv);
    row.appendChild(top);

    // Bottom: redirect input and remove button
    const bottom = document.createElement("div");
    bottom.className = "rule-row-bottom";
    const redirectDiv = document.createElement("div");
    redirectDiv.className = "rule-redirect";
    const redirectInput = document.createElement("input");
    redirectInput.type = "text";
    redirectInput.value = rule.redirectUrl || "";
    redirectInput.placeholder = "Redirect URL";
    redirectInput.addEventListener("input", (e) => {
      rules[idx].redirectUrl = e.target.value;
    });

    redirectDiv.appendChild(redirectInput);
    bottom.appendChild(redirectDiv);
    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.innerHTML = `<svg width="16" height="16" fill="none" viewBox="0 0 16 16" style="vertical-align:middle;" aria-hidden="true"><path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 1 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06z" fill="currentColor"/></svg>`;
    removeBtn.addEventListener("click", () => {
      rules.splice(idx, 1);
      renderRules(rules.filter(r => r.pattern || r.redirectUrl));
      saveRules(rules.filter(r => r.pattern || r.redirectUrl));
    });
    bottom.appendChild(removeBtn);
    row.appendChild(bottom);
    rulesList.appendChild(row);
  });
  // Update count
  if (rulesCount) {
    const count = rules.length;
    console.log({ count })
    rulesCount.textContent = `${count} URL${count === 1 ? '' : 's'} added`;
  }
}

// Add new rule
addRuleBtn.addEventListener("click", () => {
  chrome.storage.local.get([RULES_KEY], (data) => {
    console.log(data, "data")
    let rules = data[RULES_KEY] || [];
    if (!rules.some(r => !r.pattern && !r.redirectUrl)) {
      rules.push({ pattern: "", redirectUrl: "" });
    }
    saveRules(rules);
    renderRules(rules);
  });
});

// Default redirect input
defaultRedirectInput.addEventListener("input", (e) => {
  saveDefaultRedirect(e.target.value);
});

// Initial load
loadSettings();
