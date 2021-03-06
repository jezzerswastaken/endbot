"use strict";

const Command = require("../Command.js");

class Online extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Online",
			"usage": "online [--all]",
			"alias": "o",
			"description": "Sends the list of all online players across servers"
		};
	}

	async run(message, args) {
		let rcon;
		let servers = this.client.config.servers;
		let keys = Object.keys(servers);

		for (let i = 0; i < keys.length; i++) {
			let server = servers[keys[i]];
			if (server["bridge-channel"] == message.channel.id) rcon = this.client.bridges.get(message.channel.id).rcon;
		}

		if (args[0] == "--all" || rcon == undefined) {
			let iterator = this.client.bridges.entries();
			for (let i = 0; i < this.client.bridges.size; i++) {
				let bridge = iterator.next().value[1];
				await message.channel.send(await this.getOnlinePlayers(bridge.rcon));
			}
			return;
		} else  {
			await message.channel.send(await this.getOnlinePlayers(rcon));
		}
	}

	async getOnlinePlayers(rcon) {
		let data = await rcon.sendCommand("list");
		let response = data.body.split(" ");
		let online = {
			onlineCount: response[2],
			maxCount: (response[6] == "of") ? response[7] : response[6],
			players: response.slice(10)
		};
		
		let embedColor = "result";

		if (online.players[0] == "") {
			online.players = ["No players online."];
			embedColor = "error";
		}

		let embed = this.client.createEmbed(embedColor)
			.setTitle(`${online.onlineCount}/${online.maxCount}` + " Players Online On: " + rcon.name)
			.addField("Player List:", online.players.join("\n").replace(/([_*~`])/g, "\\$1"));

		return embed;
	}
}

module.exports = Online;
