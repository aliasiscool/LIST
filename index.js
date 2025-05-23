const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// ✅ Serve static HTML files from /clients
app.use('/clients', express.static(path.join(__dirname, 'clients')));

app.post('/upload', async (req, res) => {
  try {
    const { name, image_urls_combined, image_url } = req.body;

    if (!name || (!image_urls_combined && !image_url)) {
      return res.status(400).json({ error: 'Missing name or image data' });
    }

    // ✅ Determine source: single or multiple
    const rawUrls = image_urls_combined || image_url;
    const imageUrls = rawUrls
      .split(',')
      .map(url => url.trim().replace(/^{|}$/g, ''));

    const safeFilename = name.replace(/\s+/g, '');
    const clientDir = path.join(__dirname, 'clients');

    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true });
    }

    const clientFile = path.join(clientDir, `${safeFilename}.html`);

    // ✅ Generate HTML page
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Photos for Listing ${name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
    <style>
      body {
        background-color: #FAFAFA;
        font-family: 'Poppins', sans-serif;
        color: #222;
        padding: 20px;
        text-align: center;
      }
      img {
        max-width: 90%;
        margin: 15px 0;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.08);
        border: 1px solid #eee;
      }
      div {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    </style>
  </head>
  <body>
    <h1>Photos for Listing ${name}</h1>
    ${imageUrls.map(url => `
      <div>
        <img src="${url}" alt="No Photos Submitted">
      </div>
    `).join('\n')}
  </body>
</html>`;

    fs.writeFileSync(clientFile, html);

    const publicUrl = `https://${req.hostname}/clients/${safeFilename}.html`;
    res.json({ success: true, url: publicUrl });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server live at port ${PORT}`);
});





