module.exports = {
  config: {
    name: "virtual",
    version: "2.1.0",
    author: "Maisha Project Official",
    countDown: 2,
    role: 0,

    shortDescription: {
      en: "AI Chat Assistant"
    },

    longDescription: {
      en: "Ask questions and get AI answers"
    },

    category: "ai",

    guide: {
      en: "{pn} <your question>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const axios = require("axios");

    const { threadID, messageID } = event;

    // =========================
    // CHECK QUESTION
    // =========================

    if (!args || args.length === 0) {
      return api.sendMessage(
        "🤖 | আপনার প্রশ্নটি লিখুন।\n\n" +
        "📌 Example:\n" +
        "virtual hello\n" +
        "virtual তুমি কেমন আছো?\n" +
        "virtual বাংলাদেশের রাজধানী কী?",
        threadID,
        messageID
      );
    }

    const question = args.join(" ").trim();

    try {
      // =========================
      // AI REQUEST
      // =========================

      await api.sendMessage(
        "🤖 | AI চিন্তা করছে... একটু অপেক্ষা করুন।",
        threadID,
        messageID
      );

      const response = await axios.post(
        "https://vireonix.ai/v1/chat/completions",
        {
          model: "auto",

          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant. " +
                "Answer clearly and naturally. " +
                "If the user asks in Bangla, answer in Bangla. " +
                "If the user asks in English, answer in English."
            },
            {
              role: "user",
              content: question
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json"
          },

          timeout: 60000
        }
      );

      // =========================
      // GET AI ANSWER
      // =========================

      const data = response.data;

      const answer =
        data?.choices?.[0]?.message?.content;

      if (!answer || !String(answer).trim()) {
        return api.sendMessage(
          "❌ | AI কোনো উত্তর দেয়নি।",
          threadID,
          messageID
        );
      }

      // =========================
      // SEND ANSWER
      // =========================

      return api.sendMessage(
        "🤖 | 𝐕𝐈𝐑𝐓𝐔𝐀𝐋 𝐀𝐈\n\n" +
        String(answer).trim(),
        threadID,
        messageID
      );

    } catch (error) {

      console.error(
        "VIRTUAL AI ERROR:",
        error.response?.data ||
        error.message ||
        error
      );

      return api.sendMessage(
        "❌ | AI-এর সাথে সংযোগ করা যাচ্ছে না।\n\n" +
        "🔄 কিছুক্ষণ পরে আবার চেষ্টা করুন।",
        threadID,
        messageID
      );
    }
  }
};
