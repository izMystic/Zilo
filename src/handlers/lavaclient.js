const { EmbedBuilder, GatewayDispatchEvents } = require("discord.js");
const { Cluster } = require("lavaclient");
const { formatTime } = require("@helpers/Utils");
require("@lavaclient/plugin-queue/register");

/**
 * @param {import("@structures/BotClient")} client
 */
module.exports = (client) => {
  const lavaclient = new Cluster({
    nodes: client.config.MUSIC.LAVALINK_NODES,
    ws: client.config.MUSIC.LAVALINK_WS,
    discord: {
      sendGatewayCommand: (id, payload) => client.guilds.cache.get(id)?.shard?.send(payload),
    },
  });

  client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data) => lavaclient.players.handleVoiceUpdate(data));
  client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data) => lavaclient.players.handleVoiceUpdate(data));

  lavaclient.on("nodeConnected", (node, event) => {
    client.logger.log(`Node "${node.identifier}" connected`);
  });

  lavaclient.on("nodeDisconnected", (node, event) => {
    client.logger.log(`Node "${node.identifier}" disconnected`);
  });

  lavaclient.on("nodeError", (node, error) => {
    client.logger.error(`Node "${node.identifier}" encountered an error: ${error.message}.`, error);
  });

  lavaclient.on("nodeDebug", (node, event) => {
    client.logger.debug(`Node "${node.identifier}" debug: ${event.message}`);
  });

  lavaclient.on("nodeTrackStart", async (_node, queue, track) => {
    const fields = [];

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Now Playing" })
      .setColor(client.config.EMBED_COLORS.BOT_EMBED)
      .setDescription(`[${track.info.title}](${track.info.uri})`)
      .setFooter({ text: `Requested By: ${track.requesterId}` })
      .setThumbnail(track.info.artworkUrl);

    if (track.sourceName === "youtube") {
      const identifier = song.identifier;
      const thumbnail = `https://img.youtube.com/vi/${identifier}/hqdefault.jpg`;
      embed.setThumbnail(thumbnail);
    }

    fields.push({
      name: "Song Duration",
      value: "`" + formatTime(track.info.length) + "`",
      inline: true,
    });

    if (queue.tracks.length > 0) {
      fields.push({
        name: "Position in Queue",
        value: (queue.tracks.length + 1).toString(),
        inline: true,
      });
    }

    embed.setFields(fields);
    queue.data.channel.safeSend({ embeds: [embed] });
  });

  lavaclient.on("nodeQueueFinish", async (_node, queue) => {
    queue.data.channel.safeSend("Queue has ended.");
    await client.musicManager.players.destroy(queue.player.guildId).then(() => queue.player.voice.disconnect());
  });

  return lavaclient;
};
