module.exports = {
	config: {
		name: "threadLogger",
		version: "1.2",
		author: "EryXenX",
		envConfig: {
			sendNoti: true,
			autoUnsend: false,
			timeToUnsend: 10
		},
		category: "events"
	},

	langs: {
		en: {
			addAdmin: "━━━━━━━━━━━━━━━\n👑 ADMIN UPDATE\n━━━━━━━━━━━━━━━\n▸ User   : %1\n▸ Status : Promoted to Admin ✅\n━━━━━━━━━━━━━━━",
			removeAdmin: "━━━━━━━━━━━━━━━\n👑 ADMIN UPDATE\n━━━━━━━━━━━━━━━\n▸ User   : %1\n▸ Status : Removed from Admin ❌\n━━━━━━━━━━━━━━━",
			iconUpdate: "━━━━━━━━━━━━━━━\n🖼️ GROUP UPDATE\n━━━━━━━━━━━━━━━\n▸ Icon changed to: %1\n━━━━━━━━━━━━━━━",
			colorUpdate: "━━━━━━━━━━━━━━━\n🎨 GROUP UPDATE\n━━━━━━━━━━━━━━━\n▸ Theme color has been updated\n━━━━━━━━━━━━━━━",
			nicknameUpdate: "━━━━━━━━━━━━━━━\n✏️ NICKNAME UPDATE\n━━━━━━━━━━━━━━━\n▸ User    : %1\n▸ New name: %2\n━━━━━━━━━━━━━━━",
			nameUpdate: "━━━━━━━━━━━━━━━\n📝 GROUP UPDATE\n━━━━━━━━━━━━━━━\n▸ Group name changed to: %1\n━━━━━━━━━━━━━━━",
			callStarted: "━━━━━━━━━━━━━━━\n📞 CALL UPDATE\n━━━━━━━━━━━━━━━\n▸ Started by: %1\n▸ Type     : %2Call\n━━━━━━━━━━━━━━━",
			callEnded: "━━━━━━━━━━━━━━━\n📞 CALL UPDATE\n━━━━━━━━━━━━━━━\n▸ Status  : %1Call Ended\n▸ Duration: %2\n━━━━━━━━━━━━━━━",
			callJoined: "━━━━━━━━━━━━━━━\n📞 CALL UPDATE\n━━━━━━━━━━━━━━━\n▸ %1 joined the %2call\n━━━━━━━━━━━━━━━"
		}
	},

	onStart: async ({ event, api, usersData, getLang, envEvents }) => {
		const types = ["log:thread-admins", "log:thread-name", "log:user-nickname", "log:thread-icon", "log:thread-call", "log:thread-color"];
		if (!types.includes(event.logMessageType))
			return;

		const { threadID, logMessageData, logMessageType } = event;
		const { sendNoti = true, autoUnsend = false, timeToUnsend = 10 } = envEvents || {};

		const pad = (num) => String(num).padStart(2, "0");

		const sendNotice = (text) => {
			if (!sendNoti) return;
			api.sendMessage(text, threadID, (err, info) => {
				if (!err && autoUnsend) {
					setTimeout(() => api.unsendMessage(info.messageID), timeToUnsend * 1000);
				}
			});
		};

		switch (logMessageType) {
			case "log:thread-admins": {
				if (logMessageData.ADMIN_EVENT == "add_admin")
					sendNotice(getLang("addAdmin", logMessageData.TARGET_ID));
				else if (logMessageData.ADMIN_EVENT == "remove_admin")
					sendNotice(getLang("removeAdmin", logMessageData.TARGET_ID));
				break;
			}

			case "log:thread-icon": {
				sendNotice(getLang("iconUpdate", logMessageData.thread_icon || "👍"));
				break;
			}

			case "log:thread-color": {
				sendNotice(getLang("colorUpdate"));
				break;
			}

			case "log:user-nickname": {
				const displayName = logMessageData.nickname && logMessageData.nickname.length > 0 ? logMessageData.nickname : "original name";
				sendNotice(getLang("nicknameUpdate", logMessageData.participant_id, displayName));
				break;
			}

			case "log:thread-name": {
				sendNotice(getLang("nameUpdate", logMessageData.name || "No name"));
				break;
			}

			case "log:thread-call": {
				if (logMessageData.event === "group_call_started") {
					const name = await usersData.getName(logMessageData.caller_id);
					sendNotice(getLang("callStarted", name, logMessageData.video ? "Video " : "Audio "));
				} else if (logMessageData.event === "group_call_ended") {
					const callDuration = logMessageData.call_duration;
					const hours = Math.floor(callDuration / 3600);
					const minutes = Math.floor((callDuration - (hours * 3600)) / 60);
					const seconds = callDuration - (hours * 3600) - (minutes * 60);
					const timeFormat = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
					sendNotice(getLang("callEnded", logMessageData.video ? "Video " : "Audio ", timeFormat));
				} else if (logMessageData.joining_user) {
					const name = await usersData.getName(logMessageData.joining_user);
					sendNotice(getLang("callJoined", name, logMessageData.group_call_type == "1" ? "video " : ""));
				}
				break;
			}
		}
	}
};
