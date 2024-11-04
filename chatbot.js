document.getElementById('sendButton').addEventListener('click', async () => {
    const userMessage = document.getElementById('userInput').value;
    addMessageToChatbox('User', userMessage);

    // Call the OpenAI API
    const response = await callOpenAI(userMessage);
    addMessageToChatbox('Bot', response);

    document.getElementById('userInput').value = ''; // Clear input field
});

async function callOpenAI(userMessage) {
    const apiKey = ' Bearer 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
';  // Replace with your OpenAI API key
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Specify model; use 'gpt-4' if available and needed
                messages: [{ role: 'user', content: userMessage }]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, I am having trouble processing your request.';
    }
}

function addMessageToChatbox(sender, message) {
    const chatbox = document.getElementById('chatbox');
    const newMessage = document.createElement('p');
    newMessage.textContent = `${sender}: ${message}`;
    chatbox.appendChild(newMessage);
    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
}
