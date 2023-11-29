import { Client, GatewayIntentBits, TextChannel, VoiceChannel } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import * as fs from 'fs';
import { User } from 'discord.js';
import { Message } from 'discord.js';

interface Config {
    token: string;
    prefix: string;
    modLogChannelID: string;
    messageLogChannelID: string;
    voiceLogChannelID: string;
    joinLeaveLogChannelID: string;
}

const config: Config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const { token, modLogChannelID, messageLogChannelID, voiceLogChannelID, joinLeaveLogChannelID } = config;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.once('ready', () => {
    console.log('Logger is ready!');
});

const createLogEmbed = (title: string, description: string, user?: User, voiceChannel?: VoiceChannel) => {
    const embed = new EmbedBuilder()
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

client.on('messageCreate', (message: Message) => {
    if (message.author.bot) return; 
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

    if (oldChannel && !newChannel && member) {
        const embed = createLogEmbed(
            'Voice State Update',
            `${member.user.tag} left voice channel`,
            member.user,
            oldChannel as VoiceChannel
        );

        const voiceLogChannel = client.channels.cache.get(voiceLogChannelID) as TextChannel;
        if (voiceLogChannel) {
            voiceLogChannel.send({ embeds: [embed] });
        }
    } else if (!oldChannel && newChannel && member) {
        const embed = createLogEmbed(
            'Voice State Update',
            `${member.user.tag} joined voice channel`,
            member.user,
            newChannel as VoiceChannel
        );

        const voiceLogChannel = client.channels.cache.get(voiceLogChannelID) as TextChannel;
        if (voiceLogChannel) {
            voiceLogChannel.send({ embeds: [embed] });
        }
    } else if (oldChannel && newChannel && oldChannel.id !== newChannel.id && member) {
        const embed = createLogEmbed(
            'Voice State Update',
            `${member.user.tag} switched voice channels`,
            member.user,
            newChannel as VoiceChannel
        );

        const voiceLogChannel = client.channels.cache.get(voiceLogChannelID) as TextChannel;
        if (voiceLogChannel) {
            voiceLogChannel.send({ embeds: [embed] });
        }
    }
});



client.on('messageDelete', (message) => {
    const channel = message.guild?.channels.cache.get(message.channel.id);
    const channelName = channel ? `#${channel.name}` : 'Direct Message';

    const embed = createLogEmbed(
        'Message Deleted',
        `Deleted message from ${message.author?.tag} in ${channelName}:\n${message.content}`,
        message.author!
    );
    embed.setColor('Red');

    const messageLogChannel = client.channels.cache.get(messageLogChannelID) as TextChannel;
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

    const embed = createLogEmbed(
        'Message Edited',
        `Edited message from ${oldMessage.author?.tag} in ${channelName}:\n${oldMessage.content} -> ${newMessage.content}`,
        oldMessage.author!
    );
    embed.setColor('Blue');

    const messageLogChannel = client.channels.cache.get(messageLogChannelID) as TextChannel | undefined;
    if (messageLogChannel) {
        messageLogChannel.send({ embeds: [embed] });
    }
});


client.on('guildMemberAdd', (member) => {
    const embed = createLogEmbed('Member Joined', `Member joined: ${member.user.tag}`, member.user);
    embed.setColor('Green');
    (client.channels.cache.get(joinLeaveLogChannelID) as TextChannel | undefined)?.send({ embeds: [embed] });
});

client.on('guildMemberRemove', (member) => {
    const embed = createLogEmbed('Member Left', `Member left: ${member.user.tag}`, member.user);
    const joinLeaveLogChannel = client.channels.cache.get(joinLeaveLogChannelID) as TextChannel;
    embed.setColor('Red');
    if (joinLeaveLogChannel) {
        joinLeaveLogChannel.send({ embeds: [embed] });
    }
});

client.login(token);
