"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
const fs = __importStar(require("fs"));
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const { token, modLogChannelID, messageLogChannelID, voiceLogChannelID, joinLeaveLogChannelID } = config;
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildEmojisAndStickers,
        discord_js_1.GatewayIntentBits.GuildInvites,
        discord_js_1.GatewayIntentBits.GuildWebhooks,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.GuildModeration,
    ],
});
client.once('ready', () => {
    console.log('Loggerica is ready!');
});
const createLogEmbed = (title, description, user, voiceChannel) => {
    const embed = new discord_js_2.EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor('White');
    embed.setTimestamp();
    if (user) {
        embed.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 32 }) });
    }
    if (voiceChannel) {
        embed.addFields({ name: 'Voice Channel', value: voiceChannel.name, inline: true });
    }
    return embed;
};
client.on('messageCreate', (message) => {
    if (message.author.bot)
        return;
    if (message.content.startsWith(config.prefix)) {
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();
        if (command === 'ping') {
            const pingEmbed = createLogEmbed('Ping', 'Calculating ping...');
            message.channel.send({ embeds: [pingEmbed] }).then((sentMessage) => {
                const ping = sentMessage.createdTimestamp - message.createdTimestamp;
                const pongEmbed = createLogEmbed('Pong!', `Bot Latency: ${ping}ms`);
                sentMessage.edit({ embeds: [pongEmbed] });
            });
        }
    }
});
client.on('voiceStateUpdate', (oldState, newState) => {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;
    const member = newState.member;
    // Check if the user left a voice channel
    if (oldChannel && !newChannel && member) {
        const embed = createLogEmbed('Voice State Update', `${member.user.tag} left voice channel`, member.user, oldChannel);
        const voiceLogChannel = client.channels.cache.get(voiceLogChannelID);
        if (voiceLogChannel) {
            voiceLogChannel.send({ embeds: [embed] });
        }
    }
    else if (!oldChannel && newChannel && member) {
        // User joined a voice channel
        const embed = createLogEmbed('Voice State Update', `${member.user.tag} joined voice channel`, member.user, newChannel);
        const voiceLogChannel = client.channels.cache.get(voiceLogChannelID);
        if (voiceLogChannel) {
            voiceLogChannel.send({ embeds: [embed] });
        }
    }
    else if (oldChannel && newChannel && oldChannel.id !== newChannel.id && member) {
        const embed = createLogEmbed('Voice State Update', `${member.user.tag} switched voice channels`, member.user, newChannel);
        const voiceLogChannel = client.channels.cache.get(voiceLogChannelID);
        if (voiceLogChannel) {
            voiceLogChannel.send({ embeds: [embed] });
        }
    }
});
client.on('messageDelete', (message) => {
    const channel = message.guild?.channels.cache.get(message.channel.id);
    const channelName = channel ? `#${channel.name}` : 'Direct Message';
    const embed = createLogEmbed('Message Deleted', `Deleted message from ${message.author?.tag} in ${channelName}:\n${message.content}`, message.author);
    embed.setColor('Red');
    const messageLogChannel = client.channels.cache.get(messageLogChannelID);
    if (messageLogChannel) {
        messageLogChannel.send({ embeds: [embed] });
    }
});
client.on('messageUpdate', (oldMessage, newMessage) => {
    if (oldMessage.author?.id === client.user?.id) {
        return;
    }
    const channel = oldMessage.guild?.channels.cache.get(oldMessage.channel.id);
    const channelName = channel ? `#${channel.name}` : 'Direct Message';
    const embed = createLogEmbed('Message Edited', `Edited message from ${oldMessage.author?.tag} in ${channelName}:\n${oldMessage.content} -> ${newMessage.content}`, oldMessage.author);
    embed.setColor('Blue');
    const messageLogChannel = client.channels.cache.get(messageLogChannelID);
    if (messageLogChannel) {
        messageLogChannel.send({ embeds: [embed] });
    }
});
client.on('guildMemberAdd', (member) => {
    const embed = createLogEmbed('Member Joined', `Member joined: ${member.user.tag}`, member.user);
    embed.setColor('Green');
    client.channels.cache.get(joinLeaveLogChannelID)?.send({ embeds: [embed] });
});
client.on('guildMemberRemove', (member) => {
    const embed = createLogEmbed('Member Left', `Member left: ${member.user.tag}`, member.user);
    const joinLeaveLogChannel = client.channels.cache.get(joinLeaveLogChannelID);
    embed.setColor('Red');
    if (joinLeaveLogChannel) {
        joinLeaveLogChannel.send({ embeds: [embed] });
    }
});
client.on('messageReactionAdd', (reaction, user) => {
    const channel = reaction.message.guild?.channels.cache.get(reaction.message.channel.id);
    const channelName = channel ? `#${channel.name}` : 'Direct Message';
    const embed = createLogEmbed('Reaction Added', `${user.tag} added reaction ${reaction.emoji} to a message in ${channelName}:\n[Jump to Message](${reaction.message.url})`, user);
    embed.setColor('Yellow');
    const messageLogChannel = client.channels.cache.get(messageLogChannelID);
    if (messageLogChannel) {
        messageLogChannel.send({ embeds: [embed] });
    }
});
client.on('messageReactionRemove', (reaction, user) => {
    const channel = reaction.message.guild?.channels.cache.get(reaction.message.channel.id);
    const channelName = channel ? `#${channel.name}` : 'Direct Message';
    const embed = createLogEmbed('Reaction Removed', `${user.tag} removed reaction ${reaction.emoji} from a message in ${channelName}:\n[Jump to Message](${reaction.message.url})`, user);
    embed.setColor('Orange');
    const messageLogChannel = client.channels.cache.get(messageLogChannelID);
    if (messageLogChannel) {
        messageLogChannel.send({ embeds: [embed] });
    }
});
client.on('roleCreate', (role) => {
    const embed = createLogEmbed('Role Created', `Role created: ${role.name}`);
    embed.setColor('Purple');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('roleDelete', (role) => {
    const embed = createLogEmbed('Role Deleted', `Role deleted: ${role.name}`);
    embed.setColor('Purple');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('channelCreate', (channel) => {
    const embed = createLogEmbed('Channel Created', `Channel created: ${channel.name}`);
    embed.setColor('Green');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('channelDelete', (channel) => {
    if ('name' in channel) {
        const embed = createLogEmbed('Channel Deleted', `Channel deleted: ${channel.name}`);
        embed.setColor('Red');
        const modLogChannel = client.channels.cache.get(modLogChannelID);
        if (modLogChannel) {
            modLogChannel.send({ embeds: [embed] });
        }
    }
});
client.on('channelUpdate', (oldChannel, newChannel) => {
    if ('name' in newChannel) {
        const embed = createLogEmbed('Channel Permissions Updated', `Channel permissions updated: ${newChannel.name}`);
        embed.setColor('Yellow');
        const modLogChannel = client.channels.cache.get(modLogChannelID);
        if (modLogChannel) {
            modLogChannel.send({ embeds: [embed] });
        }
    }
});
client.on('guildUpdate', (oldGuild, newGuild) => {
    if (oldGuild.name !== newGuild.name) {
        const embed = createLogEmbed('Server Name Change', `Server name changed: ${oldGuild.name} -> ${newGuild.name}`);
        embed.setColor('Gold');
        const modLogChannel = client.channels.cache.get(modLogChannelID);
        if (modLogChannel) {
            modLogChannel.send({ embeds: [embed] });
        }
    }
    if (oldGuild.icon !== newGuild.icon) {
        const embed = createLogEmbed('Server Logo Change', 'Server logo changed');
        embed.setColor('Gold');
        const modLogChannel = client.channels.cache.get(modLogChannelID);
        if (modLogChannel) {
            modLogChannel.send({ embeds: [embed] });
        }
    }
});
client.on('channelPinsUpdate', (channel, time) => {
    const embed = createLogEmbed('Channel Pins Update', `Pins updated in ${channel.toString()}`);
    embed.setColor('Purple');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('guildBanAdd', (ban) => {
    const embed = createLogEmbed('Guild Ban Added', `User banned: ${ban.user.tag}`);
    embed.setColor('DarkRed');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('guildBanRemove', (ban) => {
    const embed = createLogEmbed('Guild Ban Removed', `User unbanned: ${ban.user.tag}`);
    embed.setColor('Green');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('guildIntegrationsUpdate', () => {
    const embed = createLogEmbed('Guild Integrations Update', 'Guild integrations updated');
    embed.setColor('LightGrey');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('stickerCreate', (sticker) => {
    const embed = createLogEmbed('Sticker Created', `Sticker created: ${sticker.name}`);
    embed.setColor('DarkPurple');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('stickerDelete', (sticker) => {
    const embed = createLogEmbed('Sticker Deleted', `Sticker deleted: ${sticker.name}`);
    embed.setColor('DarkPurple');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('stickerUpdate', (oldSticker, newSticker) => {
    const embed = createLogEmbed('Sticker Updated', `Sticker updated: ${oldSticker.name} -> ${newSticker.name}`);
    embed.setColor('DarkPurple');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('emojiCreate', (emoji) => {
    const embed = createLogEmbed('Emoji Created', `Emoji created: ${emoji}`);
    embed.setColor('DarkPurple');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('emojiDelete', (emoji) => {
    const embed = createLogEmbed('Emoji Deleted', `Emoji deleted: ${emoji}`);
    embed.setColor('DarkPurple');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('emojiUpdate', (oldEmoji, newEmoji) => {
    const embed = createLogEmbed('Emoji Updated', `Emoji updated: ${oldEmoji} -> ${newEmoji}`);
    embed.setColor('DarkPurple');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('inviteCreate', (invite) => {
    const embed = createLogEmbed('Invite Created', `Invite created: ${invite}`);
    embed.setColor('Gold');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('inviteDelete', (invite) => {
    const embed = createLogEmbed('Invite Deleted', `Invite deleted: ${invite}`);
    embed.setColor('Gold');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('threadCreate', (thread) => {
    const embed = createLogEmbed('Thread Created', `Thread created: ${thread.name}`);
    embed.setColor('Blue');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('threadDelete', (thread) => {
    const embed = createLogEmbed('Thread Deleted', `Thread deleted: ${thread.name}`);
    embed.setColor('Blue');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('threadUpdate', (oldThread, newThread) => {
    const embed = createLogEmbed('Thread Updated', `Thread updated: ${oldThread.name} -> ${newThread.name}`);
    embed.setColor('Blue');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('stageInstanceCreate', (stageInstance) => {
    const embed = createLogEmbed('Stage Instance Created', `Stage instance created: ${stageInstance.topic}`, undefined, undefined);
    embed.setColor('Blue');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('stageInstanceUpdate', (oldStageInstance, newStageInstance) => {
    const embed = createLogEmbed('Stage Instance Updated', `Stage instance updated: ${oldStageInstance?.topic ?? 'Unknown'} -> ${newStageInstance.topic}`, undefined, undefined);
    embed.setColor('Yellow');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('stageInstanceDelete', (stageInstance) => {
    const embed = createLogEmbed('Stage Instance Deleted', `Stage instance deleted: ${stageInstance.topic}`, undefined, undefined);
    embed.setColor('Red');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('messageDeleteBulk', (messages) => {
    const channel = messages.first()?.guild?.channels.cache.get(messages.first().channel.id);
    const channelName = channel ? `#${channel.name}` : 'Direct Message';
    const author = messages.first()?.author || undefined;
    const embed = createLogEmbed('Bulk Message Delete', `Bulk deleted messages in ${channelName}:\n${messages.size} messages deleted`, author);
    embed.setColor('Red');
    const messageLogChannel = client.channels.cache.get(messageLogChannelID);
    if (messageLogChannel) {
        messageLogChannel.send({ embeds: [embed] });
    }
});
client.on('messageReactionRemoveAll', (message) => {
    const channel = message.guild?.channels.cache.get(message.channel.id);
    const channelName = channel ? `#${channel.name}` : 'Direct Message';
    const embed = createLogEmbed('All Reactions Removed', `All reactions removed from a message in ${channelName}:\n[Jump to Message](${message.url})`);
    embed.setColor('Orange');
    const messageLogChannel = client.channels.cache.get(messageLogChannelID);
    if (messageLogChannel) {
        messageLogChannel.send({ embeds: [embed] });
    }
});
client.on('webhookCreate', (webhook) => {
    const embed = createLogEmbed('Webhook Created', `Webhook created: ${webhook.name}`);
    embed.setColor('DarkOrange');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel instanceof discord_js_1.TextChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.on('webhookDelete', (webhook) => {
    const embed = createLogEmbed('Webhook Deleted', `Webhook deleted: ${webhook.name}`);
    embed.setColor('DarkOrange');
    const modLogChannel = client.channels.cache.get(modLogChannelID);
    if (modLogChannel instanceof discord_js_1.TextChannel) {
        modLogChannel.send({ embeds: [embed] });
    }
});
client.login(token);
