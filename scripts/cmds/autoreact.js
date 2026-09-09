module.exports = {
 config: {
 name: "autoreact",
 aliases: ["ar"],
 version: "6.2.2",
 author: "𝐌𝐚𝐑𝐮𝐅",
 role: 0,
 category: "system",
 description: "Auto react on/off with status"
 },

 onStart: async function ({ api, event, args }) {
 const { threadID, messageID } = event;
 global.__autoReactStatus??= {};
 if (global.__autoReactStatus[threadID] === undefined)
 global.__autoReactStatus[threadID] = false;

 const cmd = args[0]?.toLowerCase();

 if (cmd === "on") {
 global.__autoReactStatus[threadID] = true;
 return api.sendMessage("✅ 𝐀𝐮𝐭𝐨𝐑𝐞𝐚𝐜𝐭 𝐄𝐧𝐚𝐛𝐥𝐞𝐝", threadID, messageID);
 }
 else if (cmd === "off") {
 global.__autoReactStatus[threadID] = false;
 return api.sendMessage("❌ 𝐀𝐮𝐭𝐨𝐑𝐞𝐚𝐜𝐭 𝐃𝐢𝐬𝐚𝐛𝐥𝐞𝐝", threadID, messageID);
 }
 else {
 const status = global.__autoReactStatus[threadID]? "✅ 𝐎𝐍" : "❌ 𝐎𝐅𝐅";
 return api.sendMessage(`📊 𝐒𝐭𝐚𝐭𝐮𝐬: ${status}`, threadID, messageID);
 }
 },

 onChat: async function ({ api, event }) {
 const { messageID, senderID, threadID } = event;
 if (!messageID) return;
 if (senderID === api.getCurrentUserID()) return;

 global.__autoReactStatus??= {};
 if (global.__autoReactStatus[threadID] === undefined)
 global.__autoReactStatus[threadID] = false;

 if (!global.__autoReactStatus[threadID]) return;

 const reacts = [
 "❤️","🧡","💛","💚","💙","💜","🤍","🖤","🤎","🩷","🩵","🩶","💖","💗","💘","💝","💞","💕","💓","💌","💟",
 "💫","✨","🌟","⭐","💥","⚡","🔥","💯","🎉","🎊","🎈","🎁","🏆","👑","💎","💍",
 "🌸","🌺","🌻","🌷","🌹","🌼","💐","🍀","🌿","🌾","🌲","🌳","🌴","🌈","🌙","🌞",
 "🫶","🫰","👌","👍","👏","🙌","🤝","✌️","🤞","🤙","💪","💅","💋","👩‍❤️‍👨",
 "🍓","🍒","🍎","🍉","🍑","🍍","🥭","🥝","🍇","🍊","🍋","🍈","🍌","🍐","🍏","🥥",
 "🍩","🍰","🧁","🍪","🍫","🍭","🍯","🍬","🎂","🧋","☕","🥂","🍦","🍧","🍡","🍮",
 "🦋","🕊️","🪽","🐼","🐰","🐸","🐯","🐨","🐱","🐶","🦄","🐧","🐤","🐣","🐥","🐺",
 "📸","💡","✅","🎁","🎈","🌟","💫","✨","💥","⚡","🔥","💯","🏆","👑","💎","💍"
 ];

 const react = reacts[Math.floor(Math.random() * reacts.length)];
 api.setMessageReaction(react, messageID);
 }
};
