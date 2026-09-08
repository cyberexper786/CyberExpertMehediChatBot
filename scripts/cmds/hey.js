module.exports = {
  config: {
    name: "hey",
    version: "1.0.0",
    author: "EryXenX",
    role: 0,
    countDown: 5,
    shortDescription: "Send bot welcome message with photo",
    longDescription: "Send bot welcome message with photo",
    category: "Information",
    guide: {
      en: "{pn}"
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

    const shuffled = [...images].sort(() => Math.random() - 0.5);

    let sent = false;

    for (const url of shuffled) {
      try {
        const stream = await global.utils.getStreamFromURL(url);
        await api.sendMessage(
          {
            body: messageBody,
            attachment: stream
          },
          event.threadID,
          event.messageID
        );
        sent = true;
        break;
      } catch (err) {
        console.error(`❌ Image failed: ${url}`, err.message);
        continue;
      }
    }

    if (!sent) {
      api.sendMessage(messageBody, event.threadID, event.messageID);
    }
  }
};
