document.getElementById("save").onclick = () => {
  const blockList = document.getElementById("blockList").value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const redirectUrl = document.getElementById("redirectUrl").value.trim();

  chrome.storage.local.set({ blockList, redirectUrl }, () => {
    alert("Saved!");
  });
};

window.onload = () => {
  chrome.storage.local.get(["blockList", "redirectUrl"], (data) => {
    document.getElementById("blockList").value = (data.blockList || []).join("\n");
    document.getElementById("redirectUrl").value = data.redirectUrl || "";
  });
};
