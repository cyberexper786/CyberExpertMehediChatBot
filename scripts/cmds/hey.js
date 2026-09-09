module.exports = {
	config: {
		name: "hey",
		version: "1.0",
		author: "EryXenX",
		countDown: 0,
		role: 0,
		category: "System",
		shortDescription: "Reply when only prefix is sent",
		longDescription: "Sends a welcome message with image when a user sends only the prefix",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function () {},

	onChat: async function ({ api, event }) {
		const { GoatBot } = global;
		const { config } = GoatBot;
		const { threadID, messageID, body } = event;

		if (!body) return;

		const prefix = config.prefix;
		if (body.trim() !== prefix) return;

		const imageLinks = [
			"https://i.imgur.com/22jvZAY.jpeg",
			"https://i.imgur.com/RRfliha.jpeg",
			"https://i.imgur.com/22jvZAY.jpeg",
			"https://i.imgur.com/CJSfSzw.jpeg"
		];
		const imageLink = imageLinks[Math.floor(Math.random() * imageLinks.length)];

		const msg = {
			body:
				"🌸 Assalamualaikum 🌸\n" +
				"🌺 Thanks you so much for using my bot your group ❤️‍🩹\n" +
				"😻 I will you are members enjoy!🤗\n\n" +
				"☢️ To view any command 📌\n" +
				`${prefix}Help\n` +
				`${prefix}Bot\n` +
				`${prefix}Info\n\n` +
				"Bot Owner➢Mehedi Hassan"
		};

		try {
			msg.attachment = await global.utils.getStreamFromURL(imageLink, {
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					"Referer": "https://imgur.com/",
					"Accept": "image/*"
				}
			});
		} catch (err) {
			console.error("hey.js image fetch failed:", imageLink, "|", err.message);
		}

		return api.sendMessage(msg, threadID, messageID);
	}
};
