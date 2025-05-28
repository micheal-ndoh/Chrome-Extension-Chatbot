const chatDiv = document.getElementById('chat')
const input = document.getElementById('userInput')

input.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter' && input.value.trim()) {
    const userText = input.value
    appendMessage('user', userText)
    input.value = ''

    const { apiKey, apiUrl } = await loadSettings()
    if (!apiKey || !apiUrl) {
      alert('Please set your API key and endpoint.')
      return
    }

    const requestPayload = {
      model: 'deepseek-r1-distill-llama-70b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: userText },
      ],
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      const data = await res.json()
      const botReply = data.choices?.[0]?.message?.content || 'No response'
      appendMessage('bot', botReply)
    } catch (err) {
      console.error(err)
      appendMessage('bot', '⚠️ Failed to fetch response.')
    }
  }
})

function appendMessage(sender, text, save = true) {
  const msg = document.createElement('div')
  msg.className =
    sender === 'user'
      ? 'text-right text-sm text-black dark:text-white'
      : 'text-left text-blue-700 dark:text-blue-300'
  msg.textContent = text
  chatDiv.appendChild(msg)
  chatDiv.scrollTop = chatDiv.scrollHeight
  if (save) saveChatHistory()
}

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKey', 'apiUrl'], resolve)
  })
}

const apiKeyInput = document.getElementById('apiKey')
const apiUrlInput = document.getElementById('apiUrl')
const saveBtn = document.getElementById('saveBtn')

// Load saved values
chrome.storage.local.get(['apiKey', 'apiUrl'], ({ apiKey, apiUrl }) => {
  if (apiKey) apiKeyInput.value = apiKey
  if (apiUrl) apiUrlInput.value = apiUrl
})

saveBtn.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim()
  const apiUrl = apiUrlInput.value.trim()
  chrome.storage.local.set({ apiKey, apiUrl }, () => {
    alert('Saved!')
    document.getElementById('settingsPanel').classList.add('hidden')
    document.getElementById('chatPanel').classList.remove('hidden')
  })
})

// Load chat history on startup
function loadChatHistory() {
  chrome.storage.local.get(['chatHistory'], ({ chatHistory }) => {
    if (Array.isArray(chatHistory)) {
      chatDiv.innerHTML = ''
      chatHistory.forEach(({ sender, text }) => appendMessage(sender, text, false))
    }
  })
}

// Save chat history
function saveChatHistory() {
  const messages = []
  chatDiv.querySelectorAll('div').forEach((div) => {
    messages.push({
      sender: div.classList.contains('text-right') ? 'user' : 'bot',
      text: div.textContent,
    })
  })
  chrome.storage.local.set({ chatHistory: messages })
}

// Call loadChatHistory when popup loads
document.addEventListener('DOMContentLoaded', loadChatHistory)

// Panel toggle logic
const openSettingsBtn = document.getElementById('openSettings')
const backToChatBtn = document.getElementById('backToChat')
const chatPanel = document.getElementById('chatPanel')
const settingsPanel = document.getElementById('settingsPanel')

if (openSettingsBtn && settingsPanel && chatPanel) {
  openSettingsBtn.addEventListener('click', () => {
    chatPanel.classList.add('hidden')
    settingsPanel.classList.remove('hidden')
  })
}

if (backToChatBtn && settingsPanel && chatPanel) {
  backToChatBtn.addEventListener('click', () => {
    settingsPanel.classList.add('hidden')
    chatPanel.classList.remove('hidden')
  })
}

document.getElementById('summarizeBtn').addEventListener('click', async () => {
  appendMessage('user', 'Summarize the current page')
  // Get page text from content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'extract_page_text' },
      async (response) => {
        if (!response || !response.text) {
          appendMessage('bot', '⚠️ Could not extract page text.')
          return
        }
        const pageText = response.text
        const { apiKey, apiUrl } = await loadSettings()
        if (!apiKey || !apiUrl) {
          alert('Please set your API key and endpoint.')
          return
        }
        const requestPayload = {
          model: 'deepseek-r1-distill-llama-70b',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant. Summarize the following webpage content for the user.',
            },
            { role: 'user', content: pageText },
          ],
        }
        try {
          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
          })
          const data = await res.json()
          const botReply = data.choices?.[0]?.message?.content || 'No response'
          appendMessage('bot', botReply)
        } catch (err) {
          console.error(err)
          appendMessage('bot', '⚠️ Failed to fetch summary.')
        }
      }
    )
  })
})

document.getElementById('clearChatsBtn').addEventListener('click', () => {
  if (confirm('Clear all chat history?')) {
    chrome.storage.local.remove('chatHistory', () => {
      chatDiv.innerHTML = ''
    })
  }
})