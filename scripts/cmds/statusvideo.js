module.exports = {
  config: {
    name: "statusvideo",
    aliases: ["sadvideo", "status", "sv"],
    version: "1.0.0",
    author: "Converted",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Random sad/status video"
    },
    longDescription: {
      en: "Sends a random sad or status video"
    },
    category: "media",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");

    const links = [
      "https://drive.google.com/uc?id=1cGtGK-zE7BLAzFy5kkYRUm-YLJYdai1O",
      "https://drive.google.com/uc?id=1cgvZJuB9NW3ena0Wr8dESbpk-6dlsFj6",
      "https://drive.google.com/uc?id=1cTxtHQa6xk97CYMbwH7e7zmaT8ZeR_gJ",
      "https://drive.google.com/uc?id=1cP0tiKH_ylRc_PuitO3RJMEJlAADENLg",
      "https://drive.google.com/uc?id=1cL0PGF1W8ul-yGL4N6NdkcWUn25TwhGa",
      "https://drive.google.com/uc?id=1cXoUCmbUlUsAgGlmRM9B3JURm9BSphsY",
      "https://drive.google.com/uc?id=1cDdW3_yJqVKycRNIntMmlspGYq3iwT6M",
      "https://drive.google.com/uc?id=1cCFKlxCRKtvyfIJnFdlR4UiXUs-Kzx79",
      "https://drive.google.com/uc?id=1cDQI2DQYvYaP1rJx6XxD9dIuFcJVqFOr",
      "https://drive.google.com/uc?id=1csR4qF02jero5oj_aHU5WRiDOf8UJL80",
      "https://drive.google.com/uc?id=1cdnqY-zJdlaJ8he0x3HDWaYlLlhEoLla",
      "https://drive.google.com/uc?id=1cjrX8DNFVe5Ny1due6nHjTrlv_hAZkqy",
      "https://drive.google.com/uc?id=1dFOeSHeMjObMugJ5w6k6qnx3kj5MZ05R",
      "https://drive.google.com/uc?id=1dOHNSOWLO_r4FXZbi80q1X8zSEoI8QwB",
      "https://drive.google.com/uc?id=1d396VqbIbfAzN6DOdcaGuKVmQvEEBvjZ",
      "https://drive.google.com/uc?id=1clorx5lULo2hMTg5ge39HNAhg9TdRZag",
      "https://drive.google.com/uc?id=1cqrnjCh8DBYx11HqophcrAOIopwr0kQe",
      "https://drive.google.com/uc?id=1d9NQw50iUZEbt6ruRf7rXoVOUuWnNjh0",
      "https://drive.google.com/uc?id=1dBCdqD-_jGkrPY4G_CgFLHsBqE02P1p0",
      "https://drive.google.com/uc?id=1czRLXfahFvv8k_xJ79hUDfoOCO66OKXS",
      "https://drive.google.com/uc?id=1dP2PMac3jp_Vp9wxFTcvNu-8QvhR9ws9",
      "https://drive.google.com/uc?id=1d5TeaasQcyHwRu-399ZOp9kAEaC661FS",
      "https://drive.google.com/uc?id=1dNySgo8J7XdlLq-ApQVq4UoC2OjfgfS_"
    ];

    const link = links[Math.floor(Math.random() * links.length)];
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, "statusvideo.mp4");

    try {
      await fs.ensureDir(cacheDir);

      const response = await axios({
        url: link,
        method: "GET",
        responseType: "stream",
        timeout: 60000,
        maxRedirects: 5,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await api.sendMessage(
        {
          body: "🎬 Status / Sad Video",
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {}
        }
      );
    } catch (err) {
      console.error("statusvideo error:", err.message || err);
      return api.sendMessage(
        "❌ ভিডিও লোড করতে সমস্যা হয়েছে, একটু পর আবার চেষ্টা করুন।",
        event.threadID,
        event.messageID
      );
    }
  }
};
