# 写経セットアップガイド: Laravel + React TODOアプリ

このガイドでは、ゼロからTODOアプリを写経して学習する手順を解説します。

---

## 目次

1. [前提条件](#1-前提条件)
2. [プロジェクトセットアップ](#2-プロジェクトセットアップ)
3. [写経の順序](#3-写経の順序)
4. [各ステップの詳細](#4-各ステップの詳細)
5. [よく使うコマンド](#5-よく使うコマンド)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. 前提条件

### 必要なソフトウェア

| ソフトウェア | バージョン | 確認コマンド |
|-------------|-----------|-------------|
| Docker | 20.10+ | `docker --version` |
| Docker Compose | 2.0+ | `docker compose version` |
| Git | 2.30+ | `git --version` |

**ホストマシンにPHP/Composer/Node.jsは不要！** すべてDockerコンテナ内で実行します。

---

## 2. プロジェクトセットアップ

### Step 1: ディレクトリ作成

```bash
cd ~/dev
mkdir my-laravel-todo
cd my-laravel-todo
```

### Step 2: Laravelプロジェクト作成

```bash
# Composer公式イメージでLaravelを作成
docker run --rm -v $(pwd):/app composer create-project laravel/laravel
```

**ポイント**: 末尾に `.` を付けない。`laravel/` サブディレクトリが作成される。

### Step 3: 中身をカレントディレクトリに移動

```bash
# laravel/ の中身を移動
mv laravel/* .
mv laravel/.* . 2>/dev/null  # 隠しファイルも移動（エラーは無視）
rmdir laravel
```

### Step 4: Docker環境ファイルを追加

参照元リポジトリから以下のファイルをコピー（または写経）：

```bash
# ディレクトリ作成
mkdir -p docker/nginx docker/php
```

| ファイル | 作成場所 |
|---------|---------|
| `docker-compose.yml` | プロジェクトルート |
| `docker/php/Dockerfile` | docker/php/ |
| `docker/nginx/default.conf` | docker/nginx/ |

**docker-compose.yml**:
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - .:/var/www/html
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - php
    networks:
      - app-network

  php:
    build:
      context: ./docker/php
      args:
        UID: ${UID:-1000}
        GID: ${GID:-1000}
    volumes:
      - .:/var/www/html
    networks:
      - app-network
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: laravel
      MYSQL_USER: laravel
      MYSQL_PASSWORD: secret
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - app-network

  node:
    image: node:20-alpine
    working_dir: /var/www/html
    volumes:
      - .:/var/www/html
    ports:
      - "5173:5173"
    command: sh -c "corepack enable && corepack prepare pnpm@latest --activate && pnpm dev --host"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mysql-data:
```

**docker/php/Dockerfile**:
```dockerfile
FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

ARG UID=1000
ARG GID=1000
RUN groupadd -g ${GID} appgroup && useradd -u ${UID} -g appgroup -m appuser

USER appuser
```

**docker/nginx/default.conf**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /var/www/html/public;
    index index.php index.html;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass php:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### Step 5: .envファイルを編集

```bash
cp .env.example .env
```

`.env` を編集：

```diff
- DB_CONNECTION=sqlite
+ DB_CONNECTION=mysql
+ DB_HOST=mysql
+ DB_PORT=3306
+ DB_DATABASE=laravel
+ DB_USERNAME=laravel
+ DB_PASSWORD=secret
```

### Step 6: コンテナ起動

```bash
# PHPコンテナをビルドして起動
docker compose up -d php mysql

# 起動確認
docker compose ps
```

### Step 7: Breeze + パッケージインストール

```bash
# Breezeインストール
docker compose exec php composer require laravel/breeze --dev

# React + TypeScript でスキャフォールド
docker compose exec php php artisan breeze:install react --typescript

# Ziggyインストール
docker compose exec php composer require tightenco/ziggy

# アプリケーションキー生成
docker compose exec php php artisan key:generate
```

### Step 8: フロントエンド環境

```bash
# Nodeコンテナでパッケージインストール
docker compose run --rm node sh -c "corepack enable && pnpm install"

# テストライブラリを追加
docker compose run --rm node sh -c "corepack enable && pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom"
```

**package.jsonに追加**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

### Step 9: マイグレーション実行

```bash
docker compose exec php php artisan migrate
```

### Step 10: 全コンテナ起動 & 動作確認

```bash
docker compose up -d
```

- http://localhost:8080 → Laravelのウェルカムページ
- http://localhost:5173 → Vite開発サーバー（HMR用）

---

## 3. 写経の順序

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

## 4. 各ステップの詳細

### Phase 1: バックエンド基盤

#### Step 1.1: マイグレーション作成

```bash
docker compose exec php php artisan make:migration create_todos_table
```

**参照ファイル**: `database/migrations/xxxx_create_todos_table.php`

**動作確認**:
```bash
docker compose exec php php artisan migrate
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

```bash
mkdir -p app/Repositories
```

**作成するファイル**:
- `app/Repositories/TodoRepositoryInterface.php`
- `app/Repositories/EloquentTodoRepository.php`

---

#### Step 1.5: サービスプロバイダー登録

**参照ファイル**: `app/Providers/AppServiceProvider.php`

`register()`メソッド内にDI設定を追加。

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

---

### Phase 2: フロントエンド基盤

#### Step 2.1: 型定義

**参照ファイル**: `resources/js/types/index.d.ts`

`Todo` インターフェースを追加。

---

#### Step 2.2: AppLayout

**参照ファイル**: `resources/js/Layouts/AppLayout.tsx`

---

#### Step 2.3-2.4: Todoコンポーネント

```bash
mkdir -p resources/js/Components/Todo
```

**参照ファイル**:
- `resources/js/Components/Todo/TodoForm.tsx`
- `resources/js/Components/Todo/TodoItem.tsx`

---

#### Step 2.5: TODOページ

```bash
mkdir -p resources/js/Pages/Todos
```

**参照ファイル**: `resources/js/Pages/Todos/Index.tsx`

**動作確認**: http://localhost:8080 でTODOリスト表示

---

### Phase 3: CRUD動作確認

| 機能 | 操作 | 期待結果 |
|------|------|---------|
| 作成 | フォームに入力してAdd | リストに追加 |
| 完了 | チェックボックスをクリック | 取り消し線が付く |
| 削除 | 削除ボタンをクリック | リストから消える |

---

### Phase 4: テスト

#### Step 4.1: Vitestセットアップ

**作成するファイル**:
- `vitest.config.ts`（プロジェクトルート）
- `resources/js/test/setup.ts`

**vitest.config.ts**:
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

**resources/js/test/setup.ts**:
```typescript
import '@testing-library/jest-dom';
```

---

#### Step 4.2: コンポーネントテスト

**参照ファイル**:
- `resources/js/Components/Todo/TodoForm.test.tsx`
- `resources/js/Components/Todo/TodoItem.test.tsx`

**動作確認**:
```bash
docker compose run --rm node sh -c "corepack enable && pnpm test:run"
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

## 5. よく使うコマンド

### Docker操作

```bash
docker compose up -d          # 起動
docker compose down           # 停止
docker compose ps             # 状態確認
docker compose logs -f php    # ログ確認
docker compose exec php bash  # PHPコンテナに入る
```

### Laravel（Artisan）

```bash
docker compose exec php php artisan migrate          # マイグレーション
docker compose exec php php artisan migrate:fresh   # 全テーブル再作成
docker compose exec php php artisan make:model Name # モデル作成
docker compose exec php php artisan route:list      # ルート一覧
docker compose exec php php artisan tinker          # REPL
docker compose exec php php artisan test            # テスト
```

### フロントエンド

```bash
docker compose run --rm node sh -c "corepack enable && pnpm install"    # インストール
docker compose run --rm node sh -c "corepack enable && pnpm build"      # ビルド
docker compose run --rm node sh -c "corepack enable && pnpm test:run"   # テスト
```

---

## 6. トラブルシューティング

### Q: ブラウザでアクセスできない

```bash
docker compose ps              # コンテナ起動確認
docker compose logs nginx      # ログ確認
docker compose logs php
```

### Q: データベース接続エラー

`.env`を確認：
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
docker compose logs node       # nodeコンテナのログ確認
```

開発時は `pnpm dev` が動いていること。

### Q: 権限エラー（Permission denied）

```bash
docker compose exec php chmod -R 777 storage bootstrap/cache
```

### Q: "Project directory is not empty" エラー

docker-compose.yml等を先に作成した場合に発生。

**解決方法**:
```bash
# ディレクトリを作り直す
cd ~/dev
rm -rf my-laravel-todo
mkdir my-laravel-todo
cd my-laravel-todo

# Laravel作成（末尾に.を付けない）
docker run --rm -v $(pwd):/app composer create-project laravel/laravel

# 中身を移動
mv laravel/* .
mv laravel/.* . 2>/dev/null
rmdir laravel

# その後でDockerファイルを追加
```

---

## 写経のコツ

1. **一度に全部やらない** - Phase単位で区切って動作確認
2. **コピペではなく手で打つ** - 理解が深まる
3. **エラーを恐れない** - エラーメッセージを読む練習
4. **Gitでこまめにコミット** - 戻れるようにしておく
5. **分からないところはドキュメントを読む** - 公式ドキュメントが最強

Happy Coding!
