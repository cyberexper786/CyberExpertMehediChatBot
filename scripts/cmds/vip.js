module.exports = {
	config: {
		name: "vip",
		aliases: ["premium"],
		version: "2.0",
		author: "NeoKEX",
		countDown: 5,
		role: 0,

		description: {
			vi: "Mở khóa VIP với giá $5000",
			en: "Unlock VIP for $5000"
		},

		category: "premium",

		guide: {
			vi: "{pn}",
			en: "{pn}"
		}
	},

	langs: {
		en: {
			alreadyVip:
				"👑 VIP STATUS\n━━━━━━━━━━━━━━━\n" +
				"✅ You are already a VIP user!\n" +
				"💰 Balance: $%1\n" +
				"⭐ Status: Premium User\n" +
				"━━━━━━━━━━━━━━━",

			success:
				"🎉 VIP ACTIVATED!\n" +
				"━━━━━━━━━━━━━━━\n" +
				"👑 Congratulations! Your VIP has been activated.\n" +
				"💸 VIP Price: $5000\n" +
				"💰 Remaining Balance: $%1\n" +
				"⭐ Status: Premium User\n" +
				"━━━━━━━━━━━━━━━\n" +
				"✨ Enjoy your VIP features!",

			notEnough:
				"❌ INSUFFICIENT BALANCE\n" +
				"━━━━━━━━━━━━━━━\n" +
				"💸 VIP Price: $5000\n" +
				"💰 Your Balance: $%1\n" +
				"💵 Needed: $%2\n" +
				"━━━━━━━━━━━━━━━\n" +
				"Please add more money to activate VIP."
		},

		vi: {
			alreadyVip:
				"👑 TRẠNG THÁI VIP\n━━━━━━━━━━━━━━━\n" +
				"✅ Bạn đã là thành viên VIP!\n" +
				"💰 Số dư: $%1\n" +
				"⭐ Trạng thái: Premium User\n" +
				"━━━━━━━━━━━━━━━",

			success:
				"🎉 KÍCH HOẠT VIP THÀNH CÔNG!\n" +
				"━━━━━━━━━━━━━━━\n" +
				"👑 Chúc mừng! VIP của bạn đã được kích hoạt.\n" +
				"💸 Giá VIP: $5000\n" +
				"💰 Số dư còn lại: $%1\n" +
				"⭐ Trạng thái: Premium User\n" +
				"━━━━━━━━━━━━━━━\n" +
				"✨ Chúc bạn sử dụng VIP vui vẻ!",

			notEnough:
				"❌ KHÔNG ĐỦ SỐ DƯ\n" +
				"━━━━━━━━━━━━━━━\n" +
				"💸 Giá VIP: $5000\n" +
				"💰 Số dư: $%1\n" +
				"💵 Cần thêm: $%2\n" +
				"━━━━━━━━━━━━━━━"
		}
	},

	onStart: async function ({ message, usersData, event, getLang }) {
		const VIP_PRICE = 5000;

		try {
			const userData = await usersData.get(event.senderID);

			const userMoney = Number(userData.money) || 0;
			const isVip = userData.vip === true;

			// Already VIP
			if (isVip) {
				return message.reply(
					getLang("alreadyVip", userMoney)
				);
			}

			// Not enough money
			if (userMoney < VIP_PRICE) {
				const needed = VIP_PRICE - userMoney;

				return message.reply(
					getLang("notEnough", userMoney, needed)
				);
			}

			// Deduct $5000
			const remainingMoney = userMoney - VIP_PRICE;

			await usersData.set(
				event.senderID,
				{
					money: remainingMoney,
					vip: true
				}
			);

			return message.reply(
				getLang("success", remainingMoney)
			);

		} catch (error) {
			console.error("VIP Error:", error);
			return message.reply(
				"❌ VIP activation failed.\nPlease try again later."
			);
		}
	}
};
