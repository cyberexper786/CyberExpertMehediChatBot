module.exports = {
	config: {
		name: "botactive",
		version: "1.1",
		author: "Hridoy",
		countDown: 5,
		role: 2,
		description: "Notify all groups when the bot starts",
		category: "System",
		guide: {
			en: "{pn}: manually resend the bot-active notice to all groups"
		}
	},

	// 🔔 Auto notify all groups when the bot starts
	onLoad: async function ({ api, threadsData }) {
		try {
			setTimeout(async () => {
				const allThreads = (await threadsData.getAll()).filter(t => t.isGroup);

				for (const thread of allThreads) {
					try {
						await api.sendMessage(
							"╭──「 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒 」──╮\n\n" +
							"   🤖 𝐌𝙴ʜ𝐄ᴅ𝐈 𝐍𝒐𝒘 𝑨𝒄𝒕𝒊𝒗𝒆 ✅\n\n" +
							"   📖 𝑻𝒚𝒑𝒆 " + "‹ .ʜᴇʟᴘ ›" + " 𝒕𝒐 𝒔𝒆𝒆\n" +
							"   𝐀𝙻𝙻 𝐀𝒗𝒂𝒊𝒍𝒂𝒃𝒍𝒆 𝐂𝒐𝒎𝒎𝒂𝒏𝒅𝒔\n\n" +
							"╰───────────────╯",
							thread.threadID
						);
					} catch (err) {
						console.error(`[BOT ACTIVE] Failed to notify ${thread.threadID}:`, err?.message || err);
					}

					// Facebook rate limit এড়াতে
					await new Promise(resolve => setTimeout(resolve, 1000));
				}

				console.log("[BOT ACTIVE] Message sent to all groups.");
			}, 5000);
		} catch (err) {
			console.error("[BOT ACTIVE ERROR]", err);
		}
	},

	// 🔁 Manual trigger (admin only): resend the notice on demand
	onStart: async function ({ api, event, threadsData }) {
		const allThreads = (await threadsData.getAll()).filter(t => t.isGroup);

		for (const thread of allThreads) {
			try {
				await api.sendMessage(
					"╭───「 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒 」───╮\n\n" +
					"   🤖 𝑩𝒐𝒕 𝒊𝒔 𝒏𝒐𝒘 𝑨𝒄𝒕𝒊𝒗𝒆 ✅\n\n" +
					"   📖 𝑻𝒚𝒑𝒆 " + "‹ .help ›" + " 𝒕𝒐 𝒔𝒆𝒆\n" +
					"   𝒂𝒍𝒍 𝒂𝒗𝒂𝒊𝒍𝒂𝒃𝒍𝒆 𝒄𝒐𝒎𝒎𝒂𝒏𝒅𝒔\n\n" +
					"╰──────────────╯",
					thread.threadID
				);
			} catch (err) {
				console.error(`[BOT ACTIVE] Failed to notify ${thread.threadID}:`, err?.message || err);
			}
			await new Promise(resolve => setTimeout(resolve, 1000));
		}

		return api.sendMessage(`✨ 𝑵𝒐𝒕𝒊𝒇𝒊𝒆𝒅 ${allThreads.length} 𝒈𝒓𝒐𝒖𝒑(𝒔) ✅`, event.threadID);
	}
};
