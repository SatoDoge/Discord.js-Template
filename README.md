# Discord.js-Template

自分用のDiscord.jsのテンプレート

## 動作環境

- npm v9.8.1
- node v18.18.0
- dotenv@16.4.7
- discord.js@14.13.0

## メモ

- 既存のコマンドを削除して再取得してデプロイしたい場合はDELETE_EXISTING_COMMANDSフラグを**true**にする
- インテントを追加したい場合は[**ドキュメント**](https://discord-api-types.dev/api/discord-api-types-v10/enum/GatewayIntentBits)を参照
- Node.js v20.6.0以上ではdotenvパッケージが**不要**らしいので修正が必要。具体的には`require('dotenv').config()`を削除して実行時にフラグする`node --env-file=.env app.js`
- .envのTOKENはボットのトークン。[ここから取得してくる](https://discord.com/developers/applications)
- .envのCLIENT_IDはボットのユーザーID。
- .envのGUILD_IDはボットを導入しているサーバーのID。

## 注意事項

- commands/内のプログラムでファイルを参照する場合、app.jsからのパスで参照すること。
