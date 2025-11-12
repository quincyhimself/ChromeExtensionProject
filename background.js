chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "answerForMe",
    title: "AnswerForMe",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "answerForMe" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getAnswer,
      args: [info.selectionText]
    });
  }
});

async function getAnswer(selectedText) {
  const backendUrl = "https://chromeextensionproject.onrender.com/ask"; // Your Render URL

  // Create main container
  const box = document.createElement("div");
  box.style.cssText = `
    position: fixed;
    bottom: 25px;
    right: 25px;
    width: 320px;
    max-height: 200px;
    background: linear-gradient(145deg, #0f1115, #1c1e23);
    color: #f0f0f5;
    border-radius: 15px;
    padding: 15px 20px 20px 20px;
    font-family: 'Segoe UI', Tahoma, sans-serif;
    font-size: 14px;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2), 0 0 40px rgba(0, 255, 255, 0.1) inset;
    z-index: 999999;
    overflow-wrap: break-word;
    word-break: break-word;
  `;

  // Add result text
  const resultDiv = document.createElement("div");
  resultDiv.innerText = "Thinking...";
  resultDiv.style.cssText = `
    padding-right: 30px; 
  `;
  box.appendChild(resultDiv);

  // Add copy button top-right
  const copyBtn = document.createElement("button");
  copyBtn.innerHTML = "📋"; // Clipboard icon
  copyBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: #0ff;
    color: #000;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    cursor: pointer;
    font-size: 16px;
    box-shadow: 0 0 8px #0ff;
    transition: all 0.2s ease-in-out;
  `;
  copyBtn.addEventListener("mouseenter", () => {
    copyBtn.style.transform = "scale(1.2)";
    copyBtn.style.boxShadow = "0 0 12px #0ff, 0 0 20px #0ff inset";
  });
  copyBtn.addEventListener("mouseleave", () => {
    copyBtn.style.transform = "scale(1)";
    copyBtn.style.boxShadow = "0 0 8px #0ff";
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(resultDiv.innerText).then(() => {
      copyBtn.innerText = "✔";
      setTimeout(() => (copyBtn.innerHTML = "📋"), 1000);
    });
  });

  box.appendChild(copyBtn);
  document.body.appendChild(box);

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: selectedText })
    });

    const data = await response.json();
    resultDiv.innerText = data.answer || "No answer found.";
  } catch (error) {
    resultDiv.innerText = "Error connecting to backend.";
  }

  // Auto-remove after 12 seconds
  setTimeout(() => box.remove(), 12000);
}
