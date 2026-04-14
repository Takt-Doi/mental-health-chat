# こころのサポートAI

CBT（認知行動療法）ベースのメンタルヘルスカウンセリングチャットボット。  
合言葉を知っているメンバーがアクセスできるシンプルな認証付きです。

## 機能

- 💬 CBTベースのAIカウンセリング（Claude Sonnet）
- 🎯 相談カテゴリ選択（メンタルヘルス・ハラスメント・キャリア・エンゲージメント）
- 📊 気分トラッカー
- 💡 リラクゼーションヒント
- 🔖 クイックトピック
- 📁 相談履歴インポート（Excel対応）
- 🎤 音声入力（ブラウザ対応時）
- 🌙 ダーク/ライトモード
- 🔐 合言葉認証

## セットアップ（ローカル開発）

### 1. リポジトリをクローン

```bash
git clone https://github.com/Takt-Doi/mental-health-chat.git
cd mental-health-chat
```

### 2. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して以下の値を設定:

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `PASSPHRASE` | アクセス用の合言葉（デフォルト: `test`） | ✅ |
| `SESSION_SECRET` | Cookie署名用の秘密鍵（32文字以上） | ✅ |
| `ANTHROPIC_API_KEY` | Anthropic APIキー | ✅ |

`SESSION_SECRET` の生成例:
```bash
openssl rand -base64 32
```

### 3. 依存パッケージをインストール

```bash
pnpm install
```

### 4. 開発サーバーを起動

```bash
pnpm dev
```

`http://localhost:3000` にアクセスし、合言葉 `test` でログインできます。

---

## Vercelへのデプロイ

### 1. GitHubリポジトリを接続

[vercel.com](https://vercel.com) → **Import Repository** → `Takt-Doi/mental-health-chat`

### 2. 環境変数を設定

Vercel ダッシュボード → **Settings** → **Environment Variables**

| 変数名 | 値 |
|--------|-----|
| `PASSPHRASE` | 任意の合言葉（クライエントに共有する文字列） |
| `SESSION_SECRET` | `openssl rand -base64 32` で生成した文字列 |
| `ANTHROPIC_API_KEY` | Anthropic Console で取得したAPIキー |

### 3. デプロイ

設定後 **Deploy** ボタンをクリック。

---

## 合言葉の変更方法（管理者向け）

1. Vercel ダッシュボード → **Settings** → **Environment Variables**
2. `PASSPHRASE` の値を変更
3. **Redeploy** ボタンをクリック（約30秒で反映）

> 変更後は古い合言葉では入室できなくなります。

---

## ログアウト

画面右下の <kbd>↩</kbd> アイコン（半透明）をクリック、または `/api/auth/logout` にアクセスします。

---

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **AI**: Claude Sonnet 4.5 via Anthropic API
- **UI**: shadcn/ui + Tailwind CSS
- **認証**: 合言葉 + HMAC-SHA256署名Cookie

---

## ⚠️ 免責事項

本アプリケーションは AI による会話サポートを提供するものであり、**専門的な医療・精神科診療の代替ではありません**。  
深刻な状況や危機的な状態では、必ず専門家にご相談ください。

### 公的支援機関

| 機関名 | 連絡先 |
|--------|--------|
| こころの健康相談統一ダイヤル | 0570-064-556 |
| よりそいホットライン | 0120-279-338（24時間） |
| いのちの電話 | 0570-783-556 |
| まもろうよ こころ（厚労省） | https://www.mhlw.go.jp/mamorouyokokoro/ |
