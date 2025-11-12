document.getElementById("testBtn").addEventListener("click", async () => {
  const backendUrl = "https://chromeextensionproject.onrender.com/ask"; // Replace with your backend URL

  const resBox = document.getElementById("result");
  resBox.innerText = "Testing...";
  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "What is 2+2?" })
    });
    const data = await res.json();
    resBox.innerText = "✅ " + (data.answer || "No answer");
  } catch (e) {
    resBox.innerText = "❌ Failed to connect to backend";
  }
});
