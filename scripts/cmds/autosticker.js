module.exports = {
  config: {
    name: "autoreact",
    aliases: ["ar"],
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    role: 0,
    countDown: 0,
    description: "Automatically reacts to messages",
    category: "System",
    guide: "{prefix}autoreact"
  },

  onChat: async function ({ api, event }) {
    const { messageID, senderID, threadID } = event;

    if (!messageID || !threadID) return;

    // Don't react to bot's own messages
    let botID = null;

    try {
      botID = api.getCurrentUserID?.();
    } catch (e) {
      botID = null;
    }

    if (botID && String(senderID) === String(botID)) return;

    const reacts = [
      "💫", "🚀", "🎉", "🎊", "💡",
      "❤️", "🧡", "💛", "💚", "🩵",
      "💙", "💜", "🤎", "🖤", "🩶",
      "🤍", "🩷", "💖", "💗", "💓",
      "💞", "💕", "💝", "💌", "😎",
      "😁", "😂", "🤣", "🙄", "😶",
      "🥵", "🥶", "😥", "🤨", "🫶",
      "🫰", "👌", "👏", "🙌", "👍",
      "✌️", "🤞", "🤙", "💪", "🌹",
      "🌸", "🌺", "🌷", "🌻", "🌼",
      "💐", "🦋", "🌈", "🌙", "⭐",
      "🌟", "✨", "⚡", "🔥", "💥",
      "💯", "🏆", "👑", "💎", "💍",
      "🎁", "🎈", "🍓", "🍒", "🍎",
      "🍉", "🍑", "🍍", "🥭", "🥝",
      "🍩", "🍰", "🧁", "🍪", "🍫",
      "🍭", "☕", "🧋", "🍦", "🐼",
      "🐰", "🐯", "🐸"
    ];

    const react =
      reacts[Math.floor(Math.random() * reacts.length)];

    try {
      await api.setMessageReaction(
        react,
        messageID,
        threadID
      );
    } catch (error) {
      console.error(
        "[AutoReact Error]",
        error?.message || error
      );
    }
  },

  onStart: async function () {
    // Auto reaction works automatically through onChat
  }
};