const axios = require("axios");

module.exports = {
  config: {
    name: "hey",
    version: "1.0.0",
    author: "EryXenX",
    role: 0,
    shortDescription: "Send bot welcome message with photo",
    category: "Information",
    guide: {
      en: "hey"
    }
  },

  onStart: async function ({ api, event }) {
    const messageBody = `🌸 Assalamualaikum 🌸  
🌺 Thanks you so much for using my bot your group ❤️‍🩹  
😻 I will you are members enjoy!🤗  

☢️ To view any command 📌  
/Help  
/Bot  
/Info  

𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫➢𝐌𝐞𝐡𝐞𝐝𝐢 𝐇𝐚𝐬𝐬𝐚𝐧`;

    const images = [
      "https://i.ibb.co/FLCycPj1/da513d91194f.jpg",
      "https://i.ibb.co/Q35y3MTt/bd2649afc444.jpg",
      "https://i.ibb.co/spypZP9y/e9cb9a41729d.jpg",
      "https://i.ibb.co/tpFxC9w3/45026ba43022.jpg"
    ];

    // ছবিগুলোর ক্রম random করে দেওয়া হচ্ছে, যাতে একটা fail করলে পরেরটা try করা যায়
    const shuffled = [...images].sort(() => Math.random() - 0.5);

    async function getImageStream(url) {
      const res = await axios.get(url, {
        responseType: "stream",
        timeout: 10000 // ১০ সেকেন্ডের বেশি অপেক্ষা করবে না
      });
      return res.data;
    }

    let sent = false;

    for (const url of shuffled) {
      try {
        const stream = await getImageStream(url);
        await api.sendMessage(
          {
            body: messageBody,
            attachment: stream
          },
          event.threadID,
          event.messageID
        );
        sent = true;
        break; // সফল হলে লুপ থেকে বেরিয়ে যাও
      } catch (err) {
        console.error(`❌ Image failed: ${url}`, err.message);
        continue; // এই ছবিটা fail করলে পরেরটা try করবে
      }
    }

    // সবগুলো ছবি fail করলে, অন্তত টেক্সট মেসেজটা পাঠাও
    if (!sent) {
      api.sendMessage(messageBody, event.threadID, event.messageID);
    }
  }
};
