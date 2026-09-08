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

    const imageUrl = images[Math.floor(Math.random() * images.length)];

    try {
      // এটাই এখন ১০০% কাজ করবে (পিক + পুরো টেক্সট একসাথে)
      await api.sendPhoto(event.threadID, imageUrl, {
        caption: messageBody,
        parse_mode: "HTML"  // তোমার টেক্সট সুন্দর দেখাবে
      });
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ ছবি লোড করা যায়নি।", event.threadID, event.messageID);
    }
  }
};
