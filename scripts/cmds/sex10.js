const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sex10",
    version: "1.0.0",
    author: "Shaon Ahmed | Converted for GoatBot V2",
    countDown: 5,
    role: 1,
    shortDescription: {
      en: "Send random sex video",
      bn: "র‍্যান্ডম সেক্স ভিডিও পাঠায়"
    },
    description: {
      en: "Randomly sends a sex video from Google Drive",
      bn: "Google Drive থেকে র‍্যান্ডম সেক্স ভিডিও পাঠায়"
    },
    category: "media",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  onStart: async function ({ api, event, message }) {
    const videos = [
      "https://drive.google.com/uc?id=1DPE3Oo2QSzEVKbgE5CbnJGAX16IMcG2C",
      "https://drive.google.com/uc?id=1DJPcWco6WFnfLTwa28XZMdhcDEKzYukQ",
      "https://drive.google.com/uc?id=1DZ_1wRItCK8B9wT6TQ1NlH3-V4ul1x8q",
      "https://drive.google.com/uc?id=1DJZ0jnaRPS2Pq3D_b-xFjMWlfdxQW80a",
      "https://drive.google.com/uc?id=1EDdiUaFAFAX9Sy6qoizrcd6h3S6M-H1W",
      "https://drive.google.com/uc?id=1D9l-zGTB2ZCnhGYnOR1Y1GygnFO12KOx",
      "https://drive.google.com/uc?id=1Dkki3NB-bErOo41u6mMAesUNyzaK-xcV",
      "https://drive.google.com/uc?id=1DnMnX5Y4-PLDT5c9v8qko6TANFLmiBfj",
      "https://drive.google.com/uc?id=1DT_e5vknWWH2c0QB8rdHtLRHaI1voJKk",
      "https://drive.google.com/uc?id=1DTXWUsYbEqFB0pwdBndsJVbTDNRpYLRh",
      "https://drive.google.com/uc?id=1CdSQFpqdHGb-mLY7B11QE_mzSEsLk6ct",
      "https://drive.google.com/uc?id=1CiuNzx5ySZJcByVkhmYePfD4SGiPXANo",
      "https://drive.google.com/uc?id=1CnAIypeceTDi7bdubCMG76FI2DiMTZgC",
      "https://drive.google.com/uc?id=1DNoZ7XIKUnwJkXU7Ce4Dp2R3wdNgNiui",
      "https://drive.google.com/uc?id=1CalzQLKWvhKvQXp4T0T2GL3CEG97U4AS",
      "https://drive.google.com/uc?id=1CaVat1YKppKsEVF6E3bVEYZh08IJRt5U",
      "https://drive.google.com/uc?id=1DLB0qSrZlvmfYnM1COaMU83qDfwCCtmF",
      "https://drive.google.com/uc?id=1CiIemCjTcxcHG9R6bJrIKCZgNq34MaGj",
      "https://drive.google.com/uc?id=1Dhv1cEKsRxAGk1lYhxpZp-yR9DUx8zVY",
      "https://drive.google.com/uc?id=1Cj4cA5lxffQtpF9TBGhwaNosGwyUrNEW",
      "https://drive.google.com/uc?id=1CW_q--IAd_H9OrFvl3G5Qqa5vrZbTTCx",
      "https://drive.google.com/uc?id=1ELthYZYuPm76rO3qGfordD-5C9V7FdQF",
      "https://drive.google.com/uc?id=1ECpc89QFu-meH2AvfCLsQpi6awmQjUfx"
    ];

    const captions = [
      "Sex video // A P I  ᴍ ᴇ ʜ ᴇ ᴅ ɪ 🥵"
    ];

    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    const randomCaption = captions[Math.floor(Math.random() * captions.length)];

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const filePath = path.join(cacheDir, `sex10_${Date.now()}.mp4`);

    try {
      const loadingMsg = await message.reply("⏳ ভিডিও লোড হচ্ছে, একটু অপেক্ষা করুন...");

      const response = await axios({
        method: "GET",
        url: randomVideo,
        responseType: "stream",
        timeout: 60000
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      try {
        if (loadingMsg && loadingMsg.messageID) {
          await api.unsendMessage(loadingMsg.messageID);
        }
      } catch (e) {}

      await message.reply({
        body: `「 ${randomCaption} 」`,
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => {
        fs.unlink(filePath).catch(() => {});
      }, 15000);

    } catch (err) {
      console.error("sex10 command error:", err.message);
      await message.reply("❌ ভিডিও লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");

      if (await fs.pathExists(filePath)) {
        await fs.unlink(filePath).catch(() => {});
      }
    }
  }
};
