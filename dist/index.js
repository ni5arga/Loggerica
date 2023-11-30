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
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
    ],
});
client.once('ready', () => {
    console.log('Logger is ready!');
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
client.login(token);
