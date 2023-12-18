const cheerio = require("cheerio");
const axios = require("axios");

async function scrapeTrainData(trainNumber, date) {
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

    console.log(JSON.stringify(trainData, null, 2));
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

// Example usage
scrapeTrainData(12980, "20231218");
