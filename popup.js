const chatDiv = document.getElementById("chat");
const input = document.getElementById("userInput");

input.addEventListener("keypress", async (e) => {
    if (e.key === "Enter" && input.value.trim()) {
        const userText = input.value;
        appendMessage("user", userText);
        input.value = "";

        const { apiKey, apiUrl } = await loadSettings();
        if (!apiKey || !apiUrl) {
            alert("Please set your API key and endpoint.");
            return;
        }

        const requestPayload = {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: userText }
            ]
        };

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestPayload)
            });

            const data = await res.json();
            const botReply = data.choices?.[0]?.message?.content || "No response";
            appendMessage("bot", botReply);
        } catch (err) {
            console.error(err);
            appendMessage("bot", "⚠️ Failed to fetch response.");
        }
    }
});

function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = sender === "user"
        ? "text-right text-sm text-black dark:text-white"
        : "text-left text-blue-700 dark:text-blue-300";
    msg.textContent = text;
    chatDiv.appendChild(msg);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["apiKey", "apiUrl"], resolve);
    });
}

document.getElementById("settingsBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
});