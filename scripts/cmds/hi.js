module.exports = {
  config: {
    name: "hi",
    version: "2.1.0",
    author: "Islamick Cyber Chat",
    role: 0,
    description: "Auto greeting reply",
    category: "events",
    guide: {
      en: "{pn} on | off | status"
    }
  },

  onStart: async ({ api, event, args, threadsData, message }) => {
    try {
      const threadID = event.threadID;
      const action = String(args[0] || "").toLowerCase();

      if (!threadID) {
        return message.send("❌ Thread ID পাওয়া যায়নি!");
      }

      const threadData = await threadsData.get(threadID);
      const data = threadData.data || {};

      if (action === "on") {
        data.hi = true;

        await threadsData.set(threadID, {
          data
        });

        return message.send(
          "👋 𝗚𝗥𝗘𝗘𝗧𝗜𝗡𝗚 𝗠𝗢𝗗𝗘\n\n" +
          "✅ Auto Greeting চালু হয়েছে!\n\n" +
          "এখন কেউ Hi / Hello / Hey লিখলে Bot reply করবে।"
        );
      }

      if (action === "off") {
        data.hi = false;

        await threadsData.set(threadID, {
          data
        });

        return message.send(
          "👋 𝗚𝗥𝗘𝗘𝗧𝗜𝗡𝗚 𝗠𝗢𝗗𝗘\n\n" +
          "❌ Auto Greeting বন্ধ হয়েছে।"
        );
      }

      if (action === "status") {
        return message.send(
          data.hi === false
            ? "👋 Greeting Mode: ❌ OFF"
            : "👋 Greeting Mode: ✅ ON"
        );
      }

      return message.send(
        "👋 𝗛𝗜 𝗠𝗢𝗗𝗘\n\n" +
        "➤ /hi on — চালু\n" +
        "➤ /hi off — বন্ধ\n" +
        "➤ /hi status — অবস্থা"
      );

    } catch (error) {
      console.error("[HI ERROR]", error);

      return message.send(
        "❌ Hi command-এ সমস্যা হয়েছে!\n\n" +
        "⚠️ " + error.message
      );
    }
  },

  onChat: async ({ api, event, message, threadsData, usersData }) => {
    try {
      const threadID = event.threadID;
      const senderID = event.senderID;

      if (!threadID || !event.body) return;

      if (
        global.GoatBot &&
        senderID == global.GoatBot.botID
      ) {
        return;
      }

      const text = String(event.body)
        .trim()
        .toLowerCase();

      const greetings = [
        "hi",
        "hello",
        "hey",
        "hii",
        "hiii",
        "hai",
        "helo",
        "hlo",
        "yo",
        "yow",
        "hoy",
        "uy",
        "hi po"
      ];

      if (!greetings.includes(text)) return;

      const threadData = await threadsData.get(threadID);
      const data = threadData.data || {};

      if (data.hi === false) return;

      let name = "Friend";

      try {
        name = await usersData.getName(senderID);
      } catch (e) {
        name = "Friend";
      }

      const replies = [
        `👋 Hi ${name}! Have a nice day 😊`,
        `🌸 Hello ${name}! How are you?`,
        `💗 Hey ${name}! Welcome 😊`,
        `✨ Hi ${name}! Hope you're doing well.`
      ];

      const reply =
        replies[Math.floor(Math.random() * replies.length)];

      await message.send(reply);

      try {
        await message.reaction("❤️", event.messageID);
      } catch (e) {}

    } catch (error) {
      console.error(
        "[HI ONCHAT ERROR]",
        error.message
      );
    }
  }
};
