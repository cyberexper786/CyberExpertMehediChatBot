module.exports = {
  config: {
    name: "jummah",
    version: "4.0",
    author: "Islamick Cyber Chat",
    category: "events",
    role: 0,
    description: "Jummah Mubarak Auto Reply"
  },

  onStart: async ({ api, event, threadsData, message, args }) => {
    try {
      const threadID = event.threadID;
      const body = String(event.body || "").trim();
      const action = String(args[0] || "").toLowerCase();

      // =========================
      // JUMMAH ON
      // =========================
      if (action === "on") {
        const threadData = await threadsData.get(threadID);
        const data = threadData.data || {};

        data.jummah = true;

        await threadsData.set(threadID, {
          data: data
        });

        return message.send(
          "🕌🌸 JUMMAH MUBARAK 🌸🕌\n\n" +
          "✅ Jummah Auto Reply চালু হয়েছে!\n\n" +
          "এখন কেউ \"জুম্মাহ মুবারক\" লিখলে\n" +
          "Auto Reply যাবে। 🤲"
        );
      }

      // =========================
      // JUMMAH OFF
      // =========================
      if (action === "off") {
        const threadData = await threadsData.get(threadID);
        const data = threadData.data || {};

        data.jummah = false;

        await threadsData.set(threadID, {
          data: data
        });

        return message.send(
          "🕌🌸 JUMMAH MUBARAK 🌸🕌\n\n" +
          "❌ Jummah Auto Reply বন্ধ হয়েছে!"
        );
      }

      // =========================
      // STATUS
      // =========================
      if (action === "status") {
        const threadData = await threadsData.get(threadID);
        const data = threadData.data || {};

        return message.send(
          data.jummah === true
            ? "🕌 Jummah Auto Reply: ✅ ON"
            : "🕌 Jummah Auto Reply: ❌ OFF"
        );
      }

      // =========================
      // AUTO REPLY
      // =========================
      if (
        body !== "জুম্মাহ মুবারক" &&
        body !== "জুম্মা মুবারক"
      ) {
        return;
      }

      const threadData = await threadsData.get(threadID);
      const data = threadData.data || {};

      // OFF থাকলে reply করবে না
      if (data.jummah !== true) return;

      return message.send(
        "🕌🌸 𝗝𝗨𝗠𝗠𝗔𝗛 𝗠𝗨𝗕𝗔𝗥𝗔𝗞 🌸🕌\n\n" +
        "🤍 আসসালামু আলাইকুম 🤍\n\n" +
        "🤲 আল্লাহ আমাদের সকলের দোয়া কবুল করুন।\n" +
        "🕋 আল্লাহ আমাদের সবাইকে হেদায়েত দান করুন।\n" +
        "🌸 জুম্মাহর দিনটি বরকতময় হোক।"
      );

    } catch (error) {
      console.error("JUMMAH ERROR:", error);

      return message.send(
        "❌ Jummah command-এ সমস্যা হয়েছে!\n\n" +
        "⚠️ " + error.message
      );
    }
  }
};
