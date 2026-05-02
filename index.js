import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/check", async (req, res) => {
  const { url, keyword } = req.body;

  if (!url || !keyword) {
    return res.status(400).json({ found: false, error: "Missing url or keyword" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Normal visible text
    const bodyText = $("body").text() || "";

    // 2. SPA / React / Inertia hidden state
    const appData = $("#app").attr("data-page") || "";

    let jsonText = "";
    try {
      if (appData) {
        const parsed = JSON.parse(appData);
        jsonText = JSON.stringify(parsed);
      }
    } catch (err) {
      jsonText = "";
    }

    // 3. Combine everything
    const fullText = (bodyText + " " + jsonText)
      .toLowerCase()
      .replace(/\s+/g, " ");

    const cleanKeyword = keyword.toLowerCase().replace(/\s+/g, " ");

    const found = fullText.includes(cleanKeyword);

    return res.json({
      found,
      debug: {
        bodyLength: bodyText.length,
        jsonLength: jsonText.length,
      },
    });
  } catch (e) {
    return res.status(500).json({
      found: false,
      error: e.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
