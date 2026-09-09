const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const cacheDir = path.join(__dirname, "cache", "hey_ibb");
fs.ensureDirSync(cacheDir);

const imageLinks = [
	"https://i.ibb.co/FLCycPj1/da513d91194f.jpg",
	"https://i.ibb.co/Q35y3MTt/bd2649afc444.jpg",
	"https://i.ibb.co/spypZP9y/e9cb9a41729d.jpg",
	"https://i.ibb.co/tpFxC9w3/45026ba43022.jpg"
];

async function ensureCached() {
	for (let i = 0; i < imageLinks.length; i++) {
		const filePath = path.join(cacheDir, `img${i}.jpeg`);
		if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) continue;
		try {
			const response = await axios({
				url: imageLinks[i],
				method: "GET",
				responseType: "arraybuffer",
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					"Referer": "https://imgur.com/",
					"Accept": "image/*"
				}
			});
			fs.writeFileSync(filePath, response.data);
		} catch (err) {
			console.error("hey.js failed to cache image:", imageLinks[i], "|", err.message);
		}
	}
}
ensureCached();

module.exports = {
	config: {
		name: "hey",
		version: "1.1",
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

		const msg = {
			body:
				"╭───────────────╮\n" +
				"│  🌸 𝗜'𝗠 𝗔𝗖𝗧𝗜𝗩𝗘 🌸  │\n" +
				"╰───────────────╯\n" +
				"𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗮𝗹𝗮𝗶𝗸𝘂𝗺! 𝗧𝗵𝗮𝗻𝗸𝘀 𝘆𝗼𝘂 𝘀𝗼 𝗺𝘂𝗰𝗵\n" +
				"𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗺𝘆 𝗯𝗼𝘁 𝘆𝗼𝘂𝗿 𝗴𝗿𝗼𝘂𝗽 ❤️‍🩹\n" +
				"𝗜 𝘄𝗶𝗹𝗹 𝘆𝗼𝘂 𝗮𝗿𝗲 𝗺𝗲𝗺𝗯𝗲𝗿𝘀 𝗲𝗻𝗷𝗼𝘆! 🤗\n\n" +
				"╭─── 📌 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 ───╮\n" +
				`   ${prefix}𝗛𝗲𝗹𝗽\n` +
				`   ${prefix}𝗕𝗼𝘁\n` +
				`   ${prefix}𝗜𝗻𝗳𝗼\n` +
				"╰───────────────╯\n\n" +
				"👑𝗢ᴡɴᴇʀ ♡ ᴍᴇʜᴇᴅɪ ᴋʜᴀɴ👑"
		};

		const cachedFiles = fs.readdirSync(cacheDir).filter(f => fs.statSync(path.join(cacheDir, f)).size > 0);
		if (cachedFiles.length) {
			const chosen = cachedFiles[Math.floor(Math.random() * cachedFiles.length)];
			msg.attachment = fs.createReadStream(path.join(cacheDir, chosen));
		} else {
			ensureCached();
		}

		return api.sendMessage(msg, threadID, messageID);
	}
};
