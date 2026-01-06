# 写経ガイド: Laravel + React TODOアプリ

このガイドでは、ゼロからこのTODOアプリを写経して学習する手順を解説します。

---

## 目次

1. [前提条件](#1-前提条件)
2. [プロジェクト作成](#2-プロジェクト作成)
3. [Docker環境構築](#3-docker環境構築)
4. [写経の順序](#4-写経の順序)
5. [各ステップの詳細](#5-各ステップの詳細)
6. [よく使うコマンド一覧](#6-よく使うコマンド一覧)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. 前提条件

### 必要なソフトウェア

| ソフトウェア | バージョン | 確認コマンド |
|-------------|-----------|-------------|
| Docker | 20.10+ | `docker --version` |
| Docker Compose | 2.0+ | `docker compose version` |
| Git | 2.30+ | `git --version` |

### オプション（Dockerなしで開発する場合）

| ソフトウェア | バージョン | 確認コマンド |
|-------------|-----------|-------------|
| PHP | 8.2+ | `php --version` |
| Composer | 2.0+ | `composer --version` |
| Node.js | 20+ | `node --version` |
| pnpm/npm | 最新 | `pnpm --version` |
| MySQL | 8.0 | `mysql --version` |

---

## 2. プロジェクト作成

### Step 2.1: Laravelプロジェクト作成

```bash
# 作業ディレクトリに移動
cd ~/dev

# Laravelプロジェクト作成
composer create-project laravel/laravel my-todo-app

# プロジェクトに移動
cd my-todo-app
```

### Step 2.2: Laravel Breezeインストール（React + TypeScript）

```bash
# Breezeをインストール
composer require laravel/breeze --dev

# React + TypeScript + Inertia.jsでスキャフォールド
php artisan breeze:install react --typescript
```

**このコマンドで自動生成されるもの**:
- `resources/js/` 配下のReactコンポーネント
- 認証関連のコントローラー・ルート
- Tailwind CSS設定
- Vite設定

### Step 2.3: 追加パッケージのインストール

```bash
# Ziggy（LaravelルートをJSで使用）
composer require tightenco/ziggy

# Inertia.js Laravel（自動で入るが念のため）
composer require inertiajs/inertia-laravel
```

### Step 2.4: フロントエンドテスト環境

```bash
# Vitestと Testing Libraryをインストール
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**package.jsonに追加するスクリプト**:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

---

## 3. Docker環境構築

### Step 3.1: ディレクトリ作成

```bash
mkdir -p docker/nginx docker/php
```

### Step 3.2: 作成するファイル

以下のファイルを写経：

| ファイル | 参照元 |
|---------|-------|
| `docker-compose.yml` | プロジェクトルート |
| `docker/php/Dockerfile` | docker/php/ |
| `docker/nginx/default.conf` | docker/nginx/ |

### Step 3.3: .envファイルの変更

**新規プロジェクトで必須の変更**:

```bash
# .env.example をコピー
cp .env.example .env
```

`.env`を以下のように編集：

```diff
- DB_CONNECTION=sqlite
+ DB_CONNECTION=mysql
+ DB_HOST=mysql
+ DB_PORT=3306
+ DB_DATABASE=laravel
+ DB_USERNAME=laravel
+ DB_PASSWORD=secret
```

### Step 3.4: Docker起動

```bash
# コンテナ起動
docker compose up -d

# PHPコンテナ内でセットアップ
docker compose exec php composer install
docker compose exec php php artisan key:generate
docker compose exec php php artisan migrate

# フロントエンドビルド（nodeコンテナ）
# docker-compose.ymlのnodeコンテナが自動でpnpm devを実行
```

### Step 3.5: 動作確認

- http://localhost:8080 → Laravelのウェルカムページ
- http://localhost:5173 → Vite開発サーバー（HMR用）

---

## 4. 写経の順序

### 全体フロー

```
Phase 1: バックエンド基盤
  ↓
Phase 2: フロントエンド基盤
  ↓
Phase 3: CRUD実装
  ↓
Phase 4: テスト
```

### 詳細順序

| Phase | Step | ファイル | 動作確認 |
|-------|------|---------|---------|
| 1 | 1.1 | マイグレーション作成 | `php artisan migrate` |
| 1 | 1.2 | Todoモデル | tinkerで確認 |
| 1 | 1.3 | リポジトリインターフェース | - |
| 1 | 1.4 | リポジトリ実装 | - |
| 1 | 1.5 | サービスプロバイダー登録 | - |
| 1 | 1.6 | フォームリクエスト | - |
| 1 | 1.7 | コントローラー | - |
| 1 | 1.8 | ルーティング | ブラウザで確認 |
| 2 | 2.1 | 型定義 | TypeScriptエラーなし |
| 2 | 2.2 | AppLayout | - |
| 2 | 2.3 | TodoFormコンポーネント | - |
| 2 | 2.4 | TodoItemコンポーネント | - |
| 2 | 2.5 | Todos/Index.tsx | ブラウザで確認 |
| 3 | 3.1 | TODO作成機能 | フォームから追加 |
| 3 | 3.2 | TODO完了機能 | チェックボックスで切替 |
| 3 | 3.3 | TODO削除機能 | 削除ボタンで削除 |
| 4 | 4.1 | Vitestセットアップ | `pnpm test:run` |
| 4 | 4.2 | コンポーネントテスト | テスト通過 |
| 4 | 4.3 | Pestテスト | `php artisan test` |

---

## 5. 各ステップの詳細

### Phase 1: バックエンド基盤

#### Step 1.1: マイグレーション作成

```bash
# コマンドを実行
docker compose exec php php artisan make:migration create_todos_table
```

**参照ファイル**: `database/migrations/xxxx_create_todos_table.php`

**動作確認**:
```bash
docker compose exec php php artisan migrate
# "Migration table created successfully" が表示される
```

---

#### Step 1.2: Todoモデル

```bash
docker compose exec php php artisan make:model Todo
```

**参照ファイル**: `app/Models/Todo.php`

**動作確認**（tinker）:
```bash
docker compose exec php php artisan tinker
```

```php
>>> Todo::create(['title' => 'Test Todo']);
>>> Todo::all();
>>> exit
```

---

#### Step 1.3-1.4: リポジトリパターン

**作成するファイル**:
1. `app/Repositories/TodoRepositoryInterface.php`
2. `app/Repositories/EloquentTodoRepository.php`

**ディレクトリ作成**:
```bash
mkdir -p app/Repositories
```

---

#### Step 1.5: サービスプロバイダー登録

**参照ファイル**: `app/Providers/AppServiceProvider.php`

**変更点**: `register()`メソッド内にDI設定を追加

---

#### Step 1.6: フォームリクエスト

```bash
docker compose exec php php artisan make:request StoreTodoRequest
docker compose exec php php artisan make:request UpdateTodoRequest
```

**参照ファイル**:
- `app/Http/Requests/StoreTodoRequest.php`
- `app/Http/Requests/UpdateTodoRequest.php`

---

#### Step 1.7: コントローラー

```bash
docker compose exec php php artisan make:controller TodoController
```

**参照ファイル**: `app/Http/Controllers/TodoController.php`

---

#### Step 1.8: ルーティング

**参照ファイル**: `routes/web.php`

**動作確認**:
```bash
docker compose exec php php artisan route:list
```

```
GET|HEAD  / .................. todos.index › TodoController@index
POST      todos .............. todos.store › TodoController@store
PATCH     todos/{id} ......... todos.update › TodoController@update
DELETE    todos/{id} ......... todos.destroy › TodoController@destroy
```

ブラウザで http://localhost:8080 にアクセス → エラーになるはず（Reactページ未作成）

---

### Phase 2: フロントエンド基盤

#### Step 2.1: 型定義

**参照ファイル**: `resources/js/types/index.d.ts`

**追加する型**:
- `Todo` インターフェース

---

#### Step 2.2: AppLayout

**参照ファイル**: `resources/js/Layouts/AppLayout.tsx`

---

#### Step 2.3-2.4: Todoコンポーネント

**ディレクトリ作成**:
```bash
mkdir -p resources/js/Components/Todo
```

**参照ファイル**:
- `resources/js/Components/Todo/TodoForm.tsx`
- `resources/js/Components/Todo/TodoItem.tsx`

---

#### Step 2.5: TODOページ

**ディレクトリ作成**:
```bash
mkdir -p resources/js/Pages/Todos
```

**参照ファイル**: `resources/js/Pages/Todos/Index.tsx`

**動作確認**:

http://localhost:8080 にアクセス → TODOリストが表示される

---

### Phase 3: CRUD動作確認

| 機能 | 操作 | 期待結果 |
|------|------|---------|
| 作成 | フォームに入力してAdd | リストに追加される |
| 完了 | チェックボックスをクリック | 取り消し線が付く |
| 削除 | 削除ボタンをクリック | リストから消える |

---

### Phase 4: テスト

#### Step 4.1: Vitestセットアップ

**作成するファイル**:
1. `vitest.config.ts`
2. `resources/js/test/setup.ts`

**参照ファイル**:
- `vitest.config.ts`（プロジェクトルート）
- `resources/js/test/setup.ts`

---

#### Step 4.2: コンポーネントテスト

**参照ファイル**:
- `resources/js/Components/Todo/TodoForm.test.tsx`
- `resources/js/Components/Todo/TodoItem.test.tsx`

**動作確認**:
```bash
pnpm test:run
```

---

#### Step 4.3: PHPテスト

**参照ファイル**:
- `tests/Feature/TodoTest.php`
- `tests/Feature/TodoControllerTest.php`
- `tests/Feature/EloquentTodoRepositoryTest.php`

**動作確認**:
```bash
docker compose exec php php artisan test
```

---

## 6. よく使うコマンド一覧

### Docker操作

```bash
# 起動
docker compose up -d

# 停止
docker compose down

# ログ確認
docker compose logs -f php

# PHPコンテナに入る
docker compose exec php bash

# MySQLに接続
docker compose exec mysql mysql -u laravel -p laravel
```

### Laravel（Artisan）

```bash
# マイグレーション
docker compose exec php php artisan migrate
docker compose exec php php artisan migrate:fresh    # 全テーブル再作成

# モデル作成
docker compose exec php php artisan make:model ModelName

# コントローラー作成
docker compose exec php php artisan make:controller ControllerName

# ルート一覧
docker compose exec php php artisan route:list

# キャッシュクリア
docker compose exec php php artisan cache:clear
docker compose exec php php artisan config:clear

# Tinker（REPL）
docker compose exec php php artisan tinker

# テスト
docker compose exec php php artisan test
```

### フロントエンド

```bash
# 開発サーバー（Docker外で実行する場合）
pnpm dev

# ビルド
pnpm build

# テスト
pnpm test        # ウォッチモード
pnpm test:run    # 1回実行

# 型チェック
pnpm tsc --noEmit
```

### Git

```bash
git status
git add .
git commit -m "メッセージ"
git push origin main
```

---

## 7. トラブルシューティング

### Q: ブラウザでアクセスできない

```bash
# コンテナが起動しているか確認
docker compose ps

# ログを確認
docker compose logs nginx
docker compose logs php
```

### Q: データベース接続エラー

```bash
# MySQLコンテナが起動しているか
docker compose ps mysql

# .envのDB設定を確認
cat .env | grep DB_
```

**正しい設定**:
```
DB_CONNECTION=mysql
DB_HOST=mysql          # ← "localhost"ではなく"mysql"
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=secret
```

### Q: Viteのアセットが読み込まれない

```bash
# nodeコンテナのログを確認
docker compose logs node

# マニフェストファイルがあるか
ls public/build/manifest.json
```

**開発時**: `pnpm dev`が動いていること
**本番時**: `pnpm build`でビルドすること

### Q: マイグレーションエラー

```bash
# マイグレーション状態を確認
docker compose exec php php artisan migrate:status

# 全部やり直し（開発時のみ）
docker compose exec php php artisan migrate:fresh
```

### Q: 権限エラー（Permission denied）

```bash
# storageとbootstrap/cacheに書き込み権限を付与
docker compose exec php chmod -R 777 storage bootstrap/cache
```

### Q: Composerのメモリ不足

```bash
# メモリ制限を解除して実行
docker compose exec php php -d memory_limit=-1 /usr/bin/composer install
```

---

## 新規プロジェクトで変更が必要な箇所まとめ

### 必須の変更

| ファイル | 変更内容 |
|---------|---------|
| `.env` | DB接続情報（DB_HOST=mysql等） |
| `docker-compose.yml` | プロジェクト固有のポート番号 |

### 推奨の変更

| ファイル | 変更内容 |
|---------|---------|
| `.env` | `APP_NAME`をプロジェクト名に |
| `composer.json` | `name`フィールドを変更 |
| `package.json` | 必要に応じてパッケージ追加 |

### vitest.config.ts（新規作成）

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./resources/js/test/setup.ts'],
        include: ['resources/js/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './resources/js'),
        },
    },
});
```

### tsconfig.json への追記

```json
{
    "compilerOptions": {
        "types": ["vitest/globals", "@testing-library/jest-dom"]
    }
}
```

---

## 写経のコツ

1. **一度に全部やらない** - Phase単位で区切って動作確認
2. **コピペではなく手で打つ** - 理解が深まる
3. **エラーを恐れない** - エラーメッセージを読む練習
4. **Gitでこまめにコミット** - 戻れるようにしておく
5. **分からないところはドキュメントを読む** - 公式ドキュメントが最強

Happy Coding!
