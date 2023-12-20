const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const port = process.env.PORT || 3000;

// Root route handler
app.get("/", (req, res) => {
  res.send("Welcome to the running status scraper API!");
});

// Train status route handler
app.get("/:trainNumber/:date", async (req, res) => {
  const { trainNumber, date } = req.params;
  const url = `https://runningstatus.in/status/${trainNumber}-on-${date}`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const trainData = [];

    // Selecting all rows inside the tbody
    $("tbody tr").each((index, element) => {
      const stationData = {
        stationCode: $("td:nth-child(1) abbr", element).attr("title"),
        stationName: $("td:nth-child(1) abbr", element).text().trim(),
        speed: $("td:nth-child(1) small", element).text().trim(),
        arrival: {
          ideal: $("td:nth-child(2) span", element).text().trim(),
          actual: $("td:nth-child(2) span", element).text().trim(),
          delay: $("td:nth-child(2) small", element).text().trim(),
        },
        departure: {
          ideal: $("td:nth-child(3) span", element).text().trim(),
          actual: $("td:nth-child(3) span", element).text().trim(),
          delay: $("td:nth-child(3) small", element).text().trim(),
        },
        currentStation: $(element).hasClass("table-success"), // true if it's the live station
      };

      trainData.push(stationData);
    });

    const result = {
      key: `${trainNumber}_${date}`,
      value: trainData,
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
