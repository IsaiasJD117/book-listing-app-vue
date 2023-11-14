const express = require('express');
const cors = require('cors');
const https = require('https');
require('dotenv').config();
const app = express();

app.use(cors());

app.get('/search', (req, res) => {
    console.log("Received query params:", req.query);
    try {
        const { search, page = 1 } = req.query;
        if (!search) {
            res.status(400).send('Search query is required');
            return;
        }
        const apiKey = process.env.GOODREADS_API_KEY;
        if (!apiKey) {
            res.status(500).send('Server error: API key not configured');
            return;
        }

        const goodreadsUrl = new URL(`https://www.goodreads.com/search/index.xml`);
        goodreadsUrl.searchParams.append('key', apiKey);
        goodreadsUrl.searchParams.append('q', search);
        goodreadsUrl.searchParams.append('page', page);
        goodreadsUrl.searchParams.append('search[field]', 'title');

        https.get(goodreadsUrl, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => {
                data += chunk;
            });
            apiRes.on('end', () => {
                // Use regular expressions to parse XML data
                try {
                    const regex = /<work>[\s\S]*?<best_book type="Book">[\s\S]*?<id type="integer">(\d+)<\/id>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<image_url>(.*?)<\/image_url>/g;
                    let match;
                    const books = [];

                    while ((match = regex.exec(data)) !== null) {
                        books.push({
                            id: match[1],
                            title: match[2],
                            author: match[3],
                            imageUrl: match[4]
                        });
                    }

                    // You would also need to parse total pages and total results in a similar way

                    res.json({
                        data: books,
                        // currentPage and other data should be extracted similarly
                    });
                } catch (parseError) {
                    console.error('Error parsing XML:', parseError);
                    res.status(500).send('Error parsing XML');
                }
            });
        }).on('error', (err) => {
            console.error('Error occurred:', err.message);
            res.status(500).send('Error occurred while fetching data from Goodreads');
        });

    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
