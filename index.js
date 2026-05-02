import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/check", async (req, res) => {
  const { url, keyword } = req.body;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const text = $("body").text().toLowerCase();
    const found = text.includes(keyword.toLowerCase());

    res.json({ found });
  } catch (e) {
    res.json({ found: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
