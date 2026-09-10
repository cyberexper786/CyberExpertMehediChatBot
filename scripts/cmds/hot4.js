const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "hot4",
    version: "1.0.0",
    author: "Shaon Ahmed | Converted for GoatBot V2",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send random hot video",
      bn: "র‍্যান্ডম হট ভিডিও পাঠায়"
    },
    description: {
      en: "Randomly sends a hot video from Google Drive",
      bn: "Google Drive থেকে র‍্যান্ডম হট ভিডিও পাঠায়"
    },
    category: "media",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  onStart: async function ({ api, event, message }) {
    const videos = [
      "https://drive.google.com/uc?id=1B2vnFGHdQWyhZMKek1iy3vDKHSLm0hoZ",
      "https://drive.google.com/uc?id=1AqnBw1xtDcN-NKGTn4mrSPPJEzrWwKAB",
      "https://drive.google.com/uc?id=1BIzH5utey3KZfVSFtpoF7pPNlC0Hmqz2",
      "https://drive.google.com/uc?id=1BK-zniOVPpaaPizp3iGIGBGc8VB_1e1w",
      "https://drive.google.com/uc?id=1Amghm835ttRLycgKnoI5LirnIau0q4HK",
      "https://drive.google.com/uc?id=1C0nDamLCeGkndM5K895gMKUO-qynJ7Iy",
      "https://drive.google.com/uc?id=1ByRqaXlCeM8rMeOF0APPYFNsLJ6btZNS",
      "https://drive.google.com/uc?id=1Br-DuJtFyE6NCM_9olOqmHiHjx7WjU3b",
      "https://drive.google.com/uc?id=1BnmPrkLiEeSQEyJOPcq72v1yDuaerf6Q",
      "https://drive.google.com/uc?id=1Ak864Tka5KDnfCx3EQEQ4lrRJGjqxjC2",
      "https://drive.google.com/uc?id=1BkFWFA9HZ1T_JqKnmk7lWnN8sUThJg2z",
      "https://drive.google.com/uc?id=1AnMUg4iQmr4n4O1TQIl_JpRtziTsUsEI",
      "https://drive.google.com/uc?id=1Bf45E1IEFuM0TI426ZWDYPUr4c19Mh4R",
      "https://drive.google.com/uc?id=1BL0LU2_E0JFdGSSe_cjdlIqvPYP4BbiB",
      "https://drive.google.com/uc?id=1BdAxyovoOu9d2so_8rmy3bpTmHJgLAcJ",
      "https://drive.google.com/uc?id=1BtugvkWioSHEDqZsmztjt4AALHG8xX0t",
      "https://drive.google.com/uc?id=1BSX18J5fvwLWwtE45vpabGMyjl4JJYK1",
      "https://drive.google.com/uc?id=1C2_RSR5qtdKlsGvXjxdV8RYS6VmqPUDc",
      "https://drive.google.com/uc?id=1Bfv-FmU5IT2Rv6fDt7hKM0mExqJynAIk",
      "https://drive.google.com/uc?id=1Btqzy8h6G4ml82bbn9XR8D6Wj9EDh3pR",
      "https://drive.google.com/uc?id=1BSMsu7X-QnQSjhRqKwLXsc6MQ8sh380F",
      "https://drive.google.com/uc?id=1At4L-smH78ERPMnxb7hfTKsoMTks-O3S"
    ];

    const captions = [
      "হট ভিডিও 🥵 ☞ A P I - ᴍ ᴇ ʜ ᴇ ᴅ ɪ 😎"
    ];

    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    const randomCaption = captions[Math.floor(Math.random() * captions.length)];

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const filePath = path.join(cacheDir, `hot_${Date.now()}.mp4`);

    try {
      // Loading message (optional)
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

      // Unsend loading message if possible
      try {
        if (loadingMsg && loadingMsg.messageID) {
          await api.unsendMessage(loadingMsg.messageID);
        }
      } catch (e) {}

      await message.reply({
        body: `「 ${randomCaption} 」`,
        attachment: fs.createReadStream(filePath)
      });

      // Clean up after sending
      setTimeout(() => {
        fs.unlink(filePath).catch(() => {});
      }, 15000);

    } catch (err) {
      console.error("Hot command error:", err.message);
      await message.reply("❌ ভিডিও লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      
      // Clean up on error
      if (await fs.pathExists(filePath)) {
        await fs.unlink(filePath).catch(() => {});
      }
    }
  }
};
