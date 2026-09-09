module.exports = {
  config: {
    name: "autoreact",
    aliases: ["ar"],
    version: "7.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    role: 0,
    countDown: 0,
    category: "system",
    description: "Automatically react to every message"
  },

  onChat: async function ({ api, event }) {
    const { messageID, senderID } = event;

    if (!messageID) return;

    // Don't react to bot's own messages
    if (senderID === api.getCurrentUserID()) return;

    const reacts = [
      "💫", "🚀", "🎉", "📸", "🎊", "💡",
      "❤️", "🧡", "💛", "💚", "🩵", "💙",
      "💜", "🤎", "🖤", "🩶", "🤍", "🩷",
      "💘", "💖", "😁", "😎", "🤨", "🫶",
      "👌", "👏", "🙌", "👍", "✌️", "🤞",
      "🤙", "💪", "💐", "🌹", "🐰", "🌺",
      "🌷", "🌸", "🌻", "🌼", "☔", "🌈",
      "⚡", "✨", "🌟", "💥", "🔥", "💯",
      "🏆", "👑", "💎", "💍", "🎁", "🎈",
      "🍀", "🍓", "🍒", "🍎", "🍉", "🍑",
      "🍍", "🥭", "🥝", "🍩", "🍰", "🧁",
      "🍪", "🍫", "🍭", "☕", "🧋", "🍦",
      "🐼", "🐯", "🐸", "🦋", "🌙", "⭐"
    ];

    const react =
      reacts[Math.floor(Math.random() * reacts.length)];

    try {
      await api.setMessageReaction(react, messageID);
    } catch (error) {
      console.error(
        "[AutoReact]",
        error?.message || error
      );
    }
  },

  onStart: async function () {}
};
