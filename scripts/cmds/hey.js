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
    const messageBody =
`🌸 Assalamualaikum 🌸
🌺 Thanks you so much for using my bot your group ❤️‍🩹
😻 I will you are members enjoy!🤗

☢️ To view any command 📌
/Help
/Bot
/Info`;

    const images = [
      "https://i.imgur.com/22jvZAY.jpeg",
      "https://i.imgur.com/RRfliha.jpeg",
      "https://i.imgur.com/22jvZAY.jpeg",
      "https://i.imgur.com/CJSfSzw.jpeg"
    ];

    const imageUrl = images[Math.floor(Math.random() * images.length)];

    try {
      const stream = await global.utils.getStreamFromURL(imageUrl);

      api.sendMessage(
        {
          body: messageBody,
          attachment: stream
        },
        event.threadID,
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ ছবি লোড করা যায়নি।", event.threadID, event.messageID);
    }
  }
};
