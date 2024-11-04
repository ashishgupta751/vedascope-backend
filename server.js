// Import required modules
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory store to track users by email or phone number
const userRequests = new Map();

// Define the route to handle chat messages
app.post('/api/chat', async (req, res) => {
    const { name, email, phone, birthDetails, analysisChoice } = req.body;

    // Check if this user has already made a request
    if (userRequests.has(email) || userRequests.has(phone)) {
        return res.json({
            message: `Hello ${name}, it looks like you've already requested an analysis. To explore other services, please visit our services page and choose a new option. Thank you for using VedascopeAI!`
        });
    }

    // Store this user’s request to prevent duplicate analysis
    userRequests.set(email, { name, phone });
    userRequests.set(phone, { name, email });

    // Define prompts for each analysis type
    const prompts = {
        'Nakshatra Analysis': `Provide a 200-250 word detailed Nakshatra Analysis for an individual. This should cover personality traits, relationships, and mental outlook based on Vedic astrology.`,
        'Dasha Analysis': `Provide a 200-250 word comprehensive Dasha Analysis, covering major planetary periods (Mahadasha) and sub-periods (Antardasha), explaining impacts on health, career, and relationships.`,
        'Navamsa Chart Analysis': `Provide a 200-250 word Navamsa Chart Analysis for an individual, discussing insights on marriage, partnerships, and personal destiny based on Vedic astrology principles.`,
        'Relationship Compatibility (Kundli Matching)': `Provide a 200-250 word relationship compatibility analysis based on Kundli matching in Vedic astrology, highlighting compatibility factors and potential challenges.`,
        'Career and Financial Guidance': `Provide a 200-250 word career and financial guidance analysis based on Vedic astrology, discussing strengths, career paths, and financial outlook.`,
        'Personalized Birth Chart Analysis (Janam Kundli)': `Provide a 200-250 word personalized birth chart analysis, covering key life aspects such as health, career, relationships, and strengths based on Vedic astrology.`
    };

    // Determine the appropriate prompt based on user's choice
    const prompt = prompts[analysisChoice] || 'Provide a 200-250 word general Vedic astrology reading.';

    // Send request to external service for analysis generation
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a Vedic astrology expert providing insights based on ancient Vedic principles.' },
                    { role: 'user', content: prompt }
                ],
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Get and send the bot's response, limiting to 200–250 words
        const botMessage = response.data.choices[0].message.content;
        const limitedBotMessage = botMessage.split(" ").slice(0, 250).join(" ");
        res.json({ message: limitedBotMessage });
    } catch (error) {
        console.error('Technical challenge encountered:', error.response?.data || error.message);

        // Send a user-friendly error message to the client
        res.json({
            message: "We're currently experiencing technical challenges and couldn't complete your request. Please try again later. This session will now end. Thank you for using VedascopeAI!"
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
