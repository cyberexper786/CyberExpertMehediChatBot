const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "jummah",
    version: "2.0.0",
    author: "Islamick Cyber Chat",
    countDown: 5,
    role: 0,
    shortDescription: "জুম্মাহ মুবারক auto reply",
    longDescription: "জুম্মাহ মুবারক লিখলে ইসলামিক শুভেচ্ছা ও ভিডিও পাঠাবে।",
    category: "events",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, threadsData }) {
    const threadID = message.threadID;

    try {
      const current = await threadsData.get(threadID, "jummahEnabled");
      const enabled = current !== false;

      await threadsData.set(threadID, "jummahEnabled", !enabled);

      await message.reply(
        !enabled
          ? "🕌 জুম্মাহ মুবারক auto-reply চালু হয়েছে ✅"
          : "🕌 জুম্মাহ মুবারক auto-reply বন্ধ হয়েছে ❌"
      );
    } catch (error) {
      console.error("Jummah toggle error:", error);
      await message.reply("❌ সেটিং পরিবর্তন করা যায়নি।");
    }
  },

  onChat: async function ({ message, threadsData }) {
    const text = (message.body || "").trim().toLowerCase();

    if (!text.startsWith("জুম্মাহ মুবারক")) return;

    try {
      const enabled = await threadsData.get(
        message.threadID,
        "jummahEnabled"
      );

      if (enabled === false) return;

      const messages = [
        `•┄┅════❁🌺❁════┅┄•

🫶💜🪽
𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂 𝗔𝗹𝗮𝗶𝗸𝘂𝗺 ♡
𝗝𝘂𝗺𝗺𝗮𝗵 𝗠𝘂𝗯𝗮𝗿𝗮𝗸 ♡🩷🕌

•┄┅════❁🌺❁════┅┄•`,

        `•┄┅════❁🌺❁════┅┄•

🫶💜🪽
𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂 𝗔𝗹𝗮𝗶𝗸𝘂𝗺 ♡༢
𝗝𝘂𝗺𝗺𝗮𝗵 𝗠𝘂𝗯𝗮𝗿𝗮𝗸 ♡🩷🕌

╰•┄┅════❁🌺❁════┅┄•╯`
      ];

      const body =
        messages[Math.floor(Math.random() * messages.length)];

      const videoUrl = "https://i.imgur.com/g0dpYGm.mp4";

      const cacheDir = path.join(__dirname, "cache");
      const filePath = path.join(
        cacheDir,
        `jummah-${Date.now()}.mp4`
      );

      await fs.ensureDir(cacheDir);

      const response = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream",
        timeout: 30000,
        maxRedirects: 5
      });

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on("finish", resolve);
        writer.on("error", reject);
        response.data.on("error", reject);
      });

      await message.reply({
        body,
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(async () => {
        try {
          await fs.remove(filePath);
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      }, 5000);

    } catch (error) {
      console.error("Jummah auto-reply error:", error);

      await message.reply(
        `🕌 জুম্মাহ মুবারক 🌺

আল্লাহ আমাদের সবাইকে নেক হায়াত ও ঈমান দান করুন। 🤲`
      );
    }
  }
};
