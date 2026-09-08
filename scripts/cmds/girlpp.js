const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "girlpp",
    aliases: ["girl", "girlpic", "girl pp"],
    version: "2.0.0",
    author: "Islamick Chat (Modified by Shahadat SAHU)",
    role: 0,
    shortDescription: "Random Girl Profile Picture",
    longDescription: "Send a random girl profile picture.",
    category: "Random-IMG",
    guide: {
      en: "{pn}"
    },
    cooldowns: 2,
    dependencies: {
      axios: "",
      "fs-extra": ""
    }
  },

  onStart: async function ({ api, event }) {

    const links = [
      "https://i.imgur.com/WSCOFG8.jpeg",
      "https://i.imgur.com/TBB9lQF.jpeg",
      "https://i.imgur.com/xAKK0v1.jpeg",
      "https://i.imgur.com/hVZc6pD.jpeg",
      "https://i.imgur.com/UC5sawy.jpeg",
      "https://i.imgur.com/4oLnK83.jpeg",
      "https://i.imgur.com/MJXW6QU.jpeg",
      "https://i.imgur.com/xJqkUyS.jpeg",
      "https://i.imgur.com/KtocUvd.jpeg",
      "https://i.imgur.com/uxadtYj.jpeg",
      "https://i.imgur.com/9pA0nl7.jpeg",
      "https://i.imgur.com/FM3mvcF.jpeg",
      "https://i.imgur.com/d2Naj7J.jpeg",
      "https://i.imgur.com/ik2Ukg5.jpeg",
      "https://i.imgur.com/ca6IgSt.jpeg",
      "https://i.imgur.com/CyGbNKj.jpeg",
      "https://i.imgur.com/dwH7Zet.jpeg",
      "https://i.imgur.com/AUXifFn.jpeg",
      "https://i.imgur.com/VJxMevG.jpeg",
      "https://i.imgur.com/eU2TFdy.jpeg"
    ];

    const imgURL =
      links[Math.floor(Math.random() * links.length)];

    const cacheDir =
      path.join(__dirname, "cache");

    const imgPath =
      path.join(
        cacheDir,
        `girlpp_${Date.now()}.jpg`
      );

    try {

      // Cache folder তৈরি
      await fs.ensureDir(cacheDir);

      // Image download
      const response = await axios.get(
        imgURL,
        {
          responseType: "arraybuffer",
          timeout: 20000,
          maxRedirects: 5,
          headers: {
            "User-Agent":
              "Mozilla/5.0"
          }
        }
      );

      // Image save
      await fs.writeFile(
        imgPath,
        Buffer.from(response.data)
      );

      // Send image
      await api.sendMessage(
        {
          body:
            "🌸 𝙁𝘼𝘾𝙀𝘽𝙊𝙊𝙆 𝙂𝙄𝙍𝙇'𝙎 𝙋𝙍𝙊𝙁𝙄𝙇𝙀 𝙋𝙄𝘾 🧕",
          attachment:
            fs.createReadStream(imgPath)
        },
        event.threadID,
        async () => {

          // Delete temporary file
          try {
            await fs.remove(imgPath);
          } catch (e) {}

        },
        event.messageID
      );

    } catch (error) {

      console.error(
        "GIRLPP ERROR:",
        error
      );

      // Error হলেও temporary file delete
      try {
        await fs.remove(imgPath);
      } catch (e) {}

      return api.sendMessage(
        "❌ ছবি আনতে সমস্যা হয়েছে!\n\n" +
        "কিছুক্ষণ পর আবার চেষ্টা করুন।",
        event.threadID,
        event.messageID
      );
    }
  }
};
