# Loggerica

A powerful Discord bot to keep logs in your server.

## Self Hosting Instructions 


1. **Clone the Repository**

 ```bash
git clone https://github.com/ni5arga/Loggerica.git
 ```
2. **Change Directory & Install Dependencies**

```bash
cd Loggerica
npm install
```

3. **Configuring the Bot**
Create a `config.json` file in the root directory with the following structure and replace them with your own values :

```json
{
    "token": "YOUR_DISCORD_BOT_TOKEN",
    "prefix": "YOUR_BOT_PREFIX",
    "modLogChannelID": "YOUR_MOD_LOG_CHANNEL_ID",
    "messageLogChannelID": "YOUR_MESSAGE_LOG_CHANNEL_ID",
    "voiceLogChannelID": "YOUR_VOICE_LOG_CHANNEL_ID",
    "joinLeaveLogChannelID": "YOUR_JOIN_LEAVE_LOG_CHANNEL_ID"
}
```

4. **Build and Run the Bot**
```bash
npm run build
npm start
```

## Logs the bot can keep

> **Moderator Log**

| Event                | Event Description                                         |
|----------------------|-----------------------------------------------------------|
| roleCreate           | Role created                                              |
| roleDelete           | Role deleted                                              |
| channelCreate        | Channel created                                           |
| channelDelete        | Channel deleted                                           |
| channelUpdate        | Channel permissions updated                               |
| serverUpdate          | Server name/logo change                                   |
| channelPinsUpdate    | Channel pins updated                                       |
| serverBanAdd          | User banned from the server                                |
| serverBanRemove       | User unbanned from the server                              |
| serverIntegrationsUpdate | Server integrations updated                              |
| stickerCreate        | Sticker created                                           |
| stickerDelete        | Sticker deleted                                           |
| stickerUpdate        | Sticker updated                                           |
| emojiCreate          | Emoji created                                             |
| emojiDelete          | Emoji deleted                                             |
| emojiUpdate          | Emoji updated                                             |
| inviteCreate         | Invite created                                            |
| inviteDelete         | Invite deleted                                            |
| threadCreate         | Thread created                                            |
| threadDelete         | Thread deleted                                            |
| threadUpdate         | Thread updated                                            |
| stageInstanceCreate  | Stage instance created                                    |
| stageInstanceUpdate  | Stage instance updated                                    |
| stageInstanceDelete  | Stage instance deleted                                    |
| webhookCreate        | Webhook created                                           |
| webhookDelete        | Webhook deleted                                           |

> **Member Joining Server & Leaving Server**

| Event                | Event Description                                         |
|----------------------|-----------------------------------------------------------|
| memberJoin       | Member joined                                             |
| memberLeave    | Member left                                               |

> **Message Events**

| Event                | Event Description                                         |
|----------------------|-----------------------------------------------------------|
| messageDelete        | Message deleted                                           |
| messageUpdate        | Message edited                                            |
| messageReactionAdd   | Reaction added to a message                               |
| messageReactionRemove| Reaction removed from a message                           |
| messageDeleteBulk    | Multiple messages deleted at once                         |
| messageReactionRemoveAll | All reactions removed from a message                   |

> **Voice Channel Events**

| Event                | Event Description                                         |
|----------------------|-----------------------------------------------------------|
| voiceStateUpdate     | User joined/left/switched voice channel                    |


