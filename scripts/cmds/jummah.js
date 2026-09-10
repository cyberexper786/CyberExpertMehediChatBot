const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "jummah",
    version: "3.0.0",
    author: "Islamick Cyber Chat",
    role: 0,
    countDown: 5,
    shortDescription: "Jummah Mubarak Auto Reply",
    longDescription: "জুম্মাহ মুবারক লিখলে ইসলামিক শুভেচ্ছা পাঠাবে।",
    category: "events",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, threadsData }) {
    try {
      const threadID = message.threadID;

      // বর্তমান thread-এর data নাও
      const threadData = await threadsData.get(threadID);

      const currentStatus =
        threadData?.data?.jummahEnabled !== false;

      const newStatus = !currentStatus;

      // data object আপডেট
      const newData = {
        ...(threadData?.data || {}),
        jummahEnabled: newStatus
      };

      await threadsData.set(threadID, {
        data: newData
      });

      if (newStatus) {
        return message.reply(
          "🕌 জুম্মাহ মুবারক Auto-Reply\n\n" +
          "✅ চালু হয়েছে!"
        );
      }

      return message.reply(
        "🕌 জুম্মাহ মুবারক Auto-Reply\n\n" +
        "❌ বন্ধ হয়েছে!"
      );

    } catch (error) {
      console.error("JUMMAH TOGGLE ERROR:", error);

      return message.reply(
        "❌ সেটিং পরিবর্তন করা যায়নি।\n" +
        "কনসোলে JUMMAH TOGGLE ERROR দেখুন।"
      );
    }
  },

  onChat: async function ({ message, threadsData }) {
    try {
      const text = String(message.body || "").trim();

      // এই কথাটি না হলে কিছু করবে না
      if (!text.startsWith("জুম্মাহ মুবারক")) {
        return;
      }

      const threadID = message.threadID;

      // Thread data check
      const threadData = await threadsData.get(threadID);

      const enabled =
        threadData?.data?.jummahEnabled !== false;

      // OFF থাকলে reply করবে না
      if (!enabled) {
        return;
      }

      const messages = [
        `╭•┄┅═══❁🌺❁═══┅┄•╮

🫶💜🪽
𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂 𝗔𝗹𝗮𝗶𝗸𝘂𝗺 ♡
𝗝𝘂𝗺𝗺𝗮𝗵 𝗠𝘂𝗯𝗮𝗿𝗮𝗸 ♡🩷🕌

╰•┄┅═══❁🌺❁═══┅┄•╯`,

        `╭•┄┅═══❁🌸❁═══┅┄•╮

🕌✨ জুম্মাহ মুবারক ✨🕌

আসসালামু আলাইকুম 🩷
আল্লাহ আমাদের সকলের
দোয়া কবুল করুন। 🤲

╰•┄┅═══❁🌸❁═══┅┄•╯`
      ];

      const body =
        messages[Math.floor(Math.random() * messages.length)];

      /*
       * ভিডিও URL
       * URL কাজ না করলে নিচের catch থেকে
       * শুধু সুন্দর text reply যাবে।
       */
      const videoUrl =
        "https://i.imgur.com/g0dpYGm.mp4";

      const cacheDir =
        path.join(__dirname, "cache");

      await fs.ensureDir(cacheDir);

      const filePath = path.join(
        cacheDir,
        `jummah_${Date.now()}.mp4`
      );

      try {
        const response = await axios.get(videoUrl, {
          responseType: "stream",
          timeout: 30000,
          maxRedirects: 5
        });

        await new Promise((resolve, reject) => {
          const writer =
            fs.createWriteStream(filePath);

          response.data.pipe(writer);

          writer.on("finish", resolve);
          writer.on("error", reject);

          response.data.on("error", reject);
        });

        await message.reply({
          body,
          attachment:
            fs.createReadStream(filePath)
        });

        // কিছুক্ষণ পর cache file delete
        setTimeout(async () => {
          try {
            await fs.remove(filePath);
          } catch (err) {
            console.error(
              "JUMMAH CLEANUP ERROR:",
              err
            );
          }
        }, 10000);

      } catch (videoError) {
        console.error(
          "JUMMAH VIDEO ERROR:",
          videoError.message
        );

        // ভিডিও না এলে text reply
        await message.reply(body);
      }

    } catch (error) {
      console.error(
        "JUMMAH CHAT ERROR:",
        error
      );
    }
  }
};
