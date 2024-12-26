// 必要なdiscord.jsクラスをインポート
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes, Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config()
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// クライアントインスタンスの作成
const client = new Client({
    intents: [
        // 必要なインテントを追加してください
        // 参照: https://discord-api-types.dev/api/discord-api-types-v10/enum/GatewayIntentBits
        GatewayIntentBits.Guilds, // サーバーに関するイベント
        // GatewayIntentBits.GuildMessages, // メッセージ関連のイベント
        // GatewayIntentBits.GuildMembers, // サーバーメンバー関連のイベント
    ],
});

client.commands = new Collection();
const commands = [];

// コマンドファイルの読み込み
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // コレクションに新しい項目を追加（キーはコマンド名、値はエクスポートされたモジュール）
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON()); // commands配列にコマンドデータを追加
}
console.log(client.commands);

// RESTモジュールのインスタンスを作成
const rest = new REST().setToken(token);

(async () => {
    const DELETE_EXISTING_COMMANDS = false; // 既存コマンドを削除するかどうかを指定

    try {
        // 既存のコマンドを取得
        const currentCommands = await rest.get(
            Routes.applicationGuildCommands(clientId, guildId)
        );

        if (DELETE_EXISTING_COMMANDS) {
            // 既存のコマンドを削除
            for (const command of currentCommands) {
                await rest.delete(
                    Routes.applicationGuildCommand(clientId, guildId, command.id)
                );
                console.log(`Deleted command ${command.name}`);
            }
        } else {
            console.log("Skipping command deletion.");
        }

        // 新しいコマンドをデプロイ
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // エラーをキャッチしてログに出力
        console.error(error);
    }
})();

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// クライアントが準備完了したときに実行するコード
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// クライアントのトークンを使用してDiscordにログイン
client.login(token);