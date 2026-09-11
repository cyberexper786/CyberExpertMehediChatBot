.Cmd install Assalamualaykum.js module.exports = {
  config: {
    name: "assalamualaykum",
    version: "2.1.0",
    author: "MrTomXxX",
    role: 0,
    description: "Auto reply to Salam",
    category: "events",
    guide: {
      en: "{pn}"
    }
  },

  // Required by Goat Bot V2
  onStart: async () => {
    // Auto reply listener is handled by onChat
  },

  // Auto reply
  onChat: async ({ event, message }) => {
    try {
      if (!event.body) return;

      const text = String(event.body)
        .trim()
        .toLowerCase();

      const greetings = [
        "as-salamu alaykum",
        "ٱلسَّلَامُ عَلَيْكُمْ",
        "আস-সালামু আলাইকুম",
        "আসসালামু আলাইকুম",
        "assalamu alaikum",
        "salam",
        "assalamualaikum",
        "আসসালামুয়ালাইকুম",
        "সালাম"
      ];

      const matched = greetings.some(word =>
        text.startsWith(word.toLowerCase())
      );

      if (!matched) return;

      await message.send(
        "🌸 ওয়ালাইকুমুস-সালাম-!! 🖤"
      );

      // Reaction
      try {
        await message.reaction(
          "🥰",
          event.messageID
        );
      } catch (e) {}

    } catch (error) {
      console.error(
        "[ASSALAMUALAYKUM ERROR]",
        error.message
      );
    }
  }
};
