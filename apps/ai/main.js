console.log("Unblockify loaded");

/* ===============================
   AI APP LOGIC
================================ */

if (document.getElementById("chatbox")) {
  const chatbox = document.getElementById("chatbox");
  const chatInput = document.getElementById("chatInput");
  const sendButton = document.getElementById("sendButton");

  const STORAGE_KEY = "unblockify_ai_history";
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  history.forEach(msg => addMessage(msg.text, msg.role === "user"));

  if (history.length === 0) {
    addMessage(
      "Hi! I’m Unblockify AI. I can answer questions, solve math, explain things, or help rewrite text.",
      false
    );
  }

  function addMessage(text, isUser) {
    const div = document.createElement("div");
    div.className =
      "chat-message " + (isUser ? "user-message" : "assistant-message");
    div.textContent = text;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function save(text, role) {
    history.push({ text, role });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    chatInput.value = "";
    addMessage(message, true);
    save(message, "user");

    const apiUrl = message.startsWith("/image")
      ? "https://backend.buildpicoapps.com/aero/run/image-generation-api?pk=YOUR_KEY"
      : "https://backend.buildpicoapps.com/aero/run/llm-api?pk=YOUR_KEY";

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message })
      });

      const data = await res.json();
      const reply =
        data.status === "success"
          ? data.text
          : "An error occurred.";

      addMessage(reply, false);
      save(reply, "assistant");
    } catch {
      const fallback =
        "Offline mode: I can answer basic questions, but advanced responses need hosting.";
      addMessage(fallback, false);
      save(fallback, "assistant");
    }
  }

  sendButton.onclick = sendMessage;
  chatInput.onkeydown = e => {
    if (e.key === "Enter") sendMessage();
  };
}
