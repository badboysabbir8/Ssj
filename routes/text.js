const express = require('express');
const axios = require('axios');
const router = express.Router();
const { ephoto } = require('nayan-server');
const config = require('./config.json'); // Import the config file

// API endpoint
router.get('/ephoto', async (req, res) => {
    const { text, num } = req.query; // Get query parameters from the URL

    // Get the URLs from the config file
    const urls = config.ephotoUrls;

    // Validate inputs
    if (!text || !num || !urls[num]) {
        return res.status(400).json({ error: 'Text and valid num are required' });
    }

    // Get the URL based on the provided num
    const url = urls[num];

    try {
        const data = await ephoto(url, [text]);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

module.exports = router;
