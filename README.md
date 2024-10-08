# CoverTweak

CoverTweakは、kintoneスペースのカバー画像を簡単に作成するためのツールです。
このツールを使用すると、背景画像やアイコン画像を選択するだけで、カスタマイズしたカバー画像を生成することができます。

## 特徴

- **100%クライアント処理**: 処理はHTMLとJavaScriptで完結しています。使用する画像はサーバーに送信せず、ローカルで処理します。
- **簡単な操作**: 画像を選択するだけでカバー画像を作成できます。
- **範囲指定機能**: マウスドラッグでカバー画像の切り出し範囲を指定できます。
- **保存機能**: 作成した画像をローカルに保存することができます。

## 使用方法

1. `index.html`ファイルをブラウザで開きます。
2. 背景画像とアイコン画像をそれぞれアップロードします。
3. マウス操作で切り出し範囲を指定します。
4. 「画像を保存」ボタンをクリックして、カバー画像を保存します。

## ファイル構成

- `index.html`: メインのHTMLファイル。ユーザーインターフェースを提供します。
- `script.js`: 画像の処理とカバー画像の生成を行うJavaScriptファイル。
- `style.css`: スタイルシート。UIのデザインを定義します。
- `service-worker.js`: サービスワーカー。オフライン機能をサポートします。

# 参考情報

このツールを作成するに当たり、以下の記事を参考にさせていただきました。kintoneコミュニティの知見の蓄積に感謝します。

### スペースのカバー画像のアイデアを検討してみま... | キンコミ kintone user community

https://kincom.cybozu.co.jp/chats/ak6ne0eqlitylhda

### スペースのカバー画像をいい感じに設定するためのノウハウ

https://kintone-guide.cybozu.co.jp/posts/vUl6LMXT

### 【テンプレ有】kintone のスペース カバー画像を(ほぼ)ぴったり作った！｜相澤

https://note.com/zawalog/n/n45ed95da7abc


# Author

- **開発者**: 本橋大輔
- **日付**: 2024/09/13

# License

このプロジェクトはMITライセンスの下で提供されています。詳細については、以下のリンクを参照してください。

[MITライセンス](https://opensource.org/licenses/MIT)

