let sessionId = localStorage.getItem('sessionId') || null;

document.getElementById('send-button').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value;
  const chatHistory = document.getElementById('chat-history');
  document.getElementById('session-display').textContent = sessionId || 'New Session';

  if (!sessionId) {
    sessionId = 'new';  // Server will generate one
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userInput, sessionId })
    });
    const data = await response.json();

    sessionId = data.sessionId;  // Update session ID
    localStorage.setItem('sessionId', sessionId);

    chatHistory.innerHTML += `<p>User: ${userInput}</p>`;
    chatHistory.innerHTML += `<p>Bot: ${data.response}</p>`;
    if (data.escalation) {
      chatHistory.innerHTML += `<p><strong>Escalating to agent...</strong></p>`;
    }
    chatHistory.scrollTop = chatHistory.scrollHeight;
  } catch (error) {
    console.error('Error:', error);
  }

  document.getElementById('user-input').value = '';  // Clear input
});