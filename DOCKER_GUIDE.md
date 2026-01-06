# Docker・Nginx・ネットワーク入門ガイド

このドキュメントでは、本プロジェクトのDocker構成を題材に、Docker、Nginx、ネットワークの基礎を初学者向けに解説します。

---

## 目次

1. [Dockerとは何か](#1-dockerとは何か)
2. [コンテナとイメージの違い](#2-コンテナとイメージの違い)
3. [docker-compose.ymlを読み解く](#3-docker-composeymlを読み解く)
4. [Nginxの役割](#4-nginxの役割)
5. [PHP-FPMとは](#5-php-fpmとは)
6. [コンテナ間ネットワーク](#6-コンテナ間ネットワーク)
7. [ポートマッピング](#7-ポートマッピング)
8. [ボリューム（データ永続化）](#8-ボリュームデータ永続化)
9. [リクエストの流れ（図解）](#9-リクエストの流れ図解)
10. [よく使うコマンド](#10-よく使うコマンド)

---

## 1. Dockerとは何か

### 問題：「私の環境では動くのに...」

開発でよくある問題：

- 自分のPCでは動くのに、チームメンバーのPCでは動かない
- 開発環境と本番環境で挙動が違う
- 「PHPのバージョンが違う」「拡張機能が入ってない」

### 解決策：コンテナ技術

Dockerは「**アプリケーションとその実行環境をパッケージ化**」する技術。

```
従来の方法:
┌─────────────────────────────────────┐
│         あなたのPC (Mac)            │
│  PHP 8.4 + MySQL 8.0 + Node 20     │
│  （手動でインストール）              │
└─────────────────────────────────────┘

Docker:
┌─────────────────────────────────────┐
│         あなたのPC (Mac)            │
│  ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │PHP 8.4  │ │MySQL 8.0│ │Node 20│ │
│  │コンテナ │ │コンテナ │ │コンテナ│ │
│  └─────────┘ └─────────┘ └───────┘ │
│         Docker Engine              │
└─────────────────────────────────────┘
```

**メリット**:
- 環境構築が`docker compose up`一発
- チーム全員が同じ環境
- 開発環境と本番環境の差異を減らせる

---

## 2. コンテナとイメージの違い

### イメージ = 設計図

```
イメージ: 「PHP 8.4 + 必要な拡張機能」が入ったテンプレート
          → Docker Hubで公開されている
          → 読み取り専用
```

### コンテナ = 実行中のインスタンス

```
コンテナ: イメージから作られた「動いている環境」
          → 読み書き可能
          → 停止・削除できる
```

### 例えで理解する

| 概念 | 例え |
|------|------|
| イメージ | クッキーの型（何度でも使える） |
| コンテナ | 焼いたクッキー（実際に食べられる） |

```bash
# イメージからコンテナを作成して起動
docker compose up

# コンテナを停止
docker compose down

# イメージは残っているので、再度upすればすぐ起動
```

---

## 3. docker-compose.ymlを読み解く

`docker-compose.yml`は「複数のコンテナをまとめて管理」する設定ファイル。

### 全体構造

```yaml
services:        # 起動するコンテナの定義
  nginx:         # コンテナ1: Webサーバー
  php:           # コンテナ2: PHPアプリケーション
  mysql:         # コンテナ3: データベース
  node:          # コンテナ4: フロントエンドビルド

networks:        # コンテナ間の通信設定
  app-network:

volumes:         # データ永続化設定
  mysql-data:
```

### 各サービスの解説

#### Nginx（Webサーバー）

```yaml
nginx:
  image: nginx:alpine          # 使用するイメージ（Docker Hubから取得）
  ports:
    - "8080:80"                # ポートマッピング（後述）
  volumes:
    - .:/var/www/html          # ソースコードをマウント
    - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
  depends_on:
    - php                      # phpコンテナが起動してから起動
  networks:
    - app-network              # 接続するネットワーク
```

**ポイント**:
- `image: nginx:alpine` → 軽量版Nginxイメージを使用
- `depends_on` → 起動順序の制御

#### PHP（アプリケーション）

```yaml
php:
  build:                       # Dockerfileからビルド
    context: ./docker/php
    args:
      UID: ${UID:-1000}        # ホストのユーザーIDを渡す
      GID: ${GID:-1000}
  volumes:
    - .:/var/www/html          # ソースコードをマウント
  networks:
    - app-network
  depends_on:
    - mysql
```

**ポイント**:
- `image`ではなく`build` → カスタムイメージを作成
- `UID/GID` → ファイル権限問題を回避

#### MySQL（データベース）

```yaml
mysql:
  image: mysql:8.0
  environment:                 # 環境変数でDB設定
    MYSQL_ROOT_PASSWORD: secret
    MYSQL_DATABASE: laravel
    MYSQL_USER: laravel
    MYSQL_PASSWORD: secret
  volumes:
    - mysql-data:/var/lib/mysql  # 名前付きボリューム
  ports:
    - "3306:3306"
  networks:
    - app-network
```

**ポイント**:
- `environment` → コンテナ内の環境変数を設定
- `mysql-data` → コンテナを削除してもデータは残る

#### Node（フロントエンド）

```yaml
node:
  image: node:20-alpine
  working_dir: /var/www/html
  volumes:
    - .:/var/www/html
  ports:
    - "5173:5173"              # Vite開発サーバー
  command: sh -c "corepack enable && corepack prepare pnpm@latest --activate && pnpm dev --host"
  networks:
    - app-network
```

**ポイント**:
- `command` → コンテナ起動時に実行するコマンド
- `--host` → 外部からアクセス可能にする

---

## 4. Nginxの役割

### Nginxとは

Nginx（エンジンエックス）は**Webサーバー**ソフトウェア。役割：

1. **静的ファイルの配信**: CSS、JS、画像など
2. **リバースプロキシ**: PHPへのリクエスト転送
3. **ロードバランサー**: 複数サーバーへの負荷分散（本番環境）

### 設定ファイルの解説

```nginx
# docker/nginx/default.conf

server {
    listen 80;                          # ポート80でリッスン
    server_name localhost;
    root /var/www/html/public;          # ドキュメントルート
    index index.php index.html;         # デフォルトファイル

    client_max_body_size 20M;           # アップロード上限

    # 通常のリクエスト処理
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHPファイルの処理
    location ~ \.php$ {
        fastcgi_pass php:9000;          # PHP-FPMに転送
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # 隠しファイルへのアクセス禁止
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### location / の動作

```nginx
try_files $uri $uri/ /index.php?$query_string;
```

この1行が重要。順番に試す：

1. `$uri` → リクエストされたファイルがあるか？
2. `$uri/` → ディレクトリとしてあるか？
3. `/index.php?...` → なければ全部index.phpへ

```
GET /about
  ↓ /var/www/html/public/about ある？ → ない
  ↓ /var/www/html/public/about/ ある？ → ない
  ↓ /index.php?/about へ転送 → Laravelがルーティング処理
```

**これがSPA的な動作を可能にする**。

---

## 5. PHP-FPMとは

### CGIの歴史

```
昔（CGI時代）:
リクエストごとにPHPプロセスを起動 → 遅い

今（PHP-FPM）:
PHPプロセスを常駐させて待機 → 高速
```

### FPM = FastCGI Process Manager

```
Nginx                    PHP-FPM
  │                         │
  │ "このPHPを実行して"     │
  │ ───────────────────────→│
  │                         │ PHPを実行
  │       実行結果          │
  │ ←───────────────────────│
  │                         │
```

### なぜNginxとPHP-FPMを分けるのか

```
┌─────────────┐
│   Apache    │  ← PHPモジュールを内蔵（一体型）
│  + mod_php  │     シンプルだが重い
└─────────────┘

┌─────────────┐    ┌─────────────┐
│   Nginx     │ ←→ │  PHP-FPM    │  ← 分離型
└─────────────┘    └─────────────┘    軽量・スケーラブル
```

**分離のメリット**:
- Nginxは静的ファイルを超高速で配信
- PHPが必要な時だけPHP-FPMに投げる
- それぞれ独立してスケール可能

---

## 6. コンテナ間ネットワーク

### Dockerネットワークの仕組み

```yaml
networks:
  app-network:
    driver: bridge
```

`bridge`ネットワークを作成すると、コンテナ同士が**サービス名で通信**できる。

```
┌─────────────────────────────────────────────────────┐
│                  app-network                        │
│                                                     │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐        │
│  │  nginx  │    │   php   │    │  mysql  │        │
│  │         │───→│         │───→│         │        │
│  │ :80     │    │ :9000   │    │ :3306   │        │
│  └─────────┘    └─────────┘    └─────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### DNS解決

Docker Composeは**内部DNS**を提供する：

```nginx
# Nginx設定内で
fastcgi_pass php:9000;   # "php"というホスト名でPHPコンテナに接続
```

```php
// Laravel .env内で
DB_HOST=mysql   # "mysql"というホスト名でMySQLコンテナに接続
```

**IPアドレスを知らなくても、サービス名で通信できる！**

---

## 7. ポートマッピング

### ホストとコンテナのポート

```yaml
ports:
  - "8080:80"
```

これは「**ホストの8080番ポート → コンテナの80番ポート**」という意味。

```
あなたのPC（ホスト）              Dockerコンテナ
┌──────────────────┐            ┌──────────────────┐
│                  │            │                  │
│   localhost:8080 │ ─────────→ │     nginx:80     │
│                  │            │                  │
│   localhost:5173 │ ─────────→ │     node:5173    │
│                  │            │                  │
│   localhost:3306 │ ─────────→ │    mysql:3306    │
│                  │            │                  │
└──────────────────┘            └──────────────────┘
```

### なぜ8080？

- ポート80は管理者権限が必要（1024未満は特権ポート）
- 開発環境では8080などを使うのが一般的
- 本番環境では80/443を使う

### コンテナ間通信はポートマッピング不要

```yaml
# mysqlコンテナ
ports:
  - "3306:3306"   # これはホストからのアクセス用
```

```
ホスト → mysql: ポートマッピングが必要（localhost:3306）
php → mysql:    ポートマッピング不要（mysql:3306で直接通信）
```

---

## 8. ボリューム（データ永続化）

### 問題：コンテナは一時的

```bash
docker compose down   # コンテナ削除
docker compose up     # 新しいコンテナ作成
```

→ コンテナ内のデータは消える！

### 解決策：ボリューム

```yaml
volumes:
  mysql-data:        # 名前付きボリュームを定義

services:
  mysql:
    volumes:
      - mysql-data:/var/lib/mysql   # MySQLのデータをボリュームに保存
```

```
┌─────────────────────────────────────────┐
│              ホストマシン                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     mysql-data（ボリューム）      │   │  ← コンテナを削除しても残る
│  └─────────────────────────────────┘   │
│              ↑                          │
│              │ マウント                  │
│  ┌─────────────────────────────────┐   │
│  │    mysqlコンテナ                 │   │
│  │    /var/lib/mysql               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### バインドマウント vs 名前付きボリューム

```yaml
volumes:
  # バインドマウント: ホストのディレクトリをそのままマウント
  - .:/var/www/html                    # カレントディレクトリ → /var/www/html

  # 名前付きボリューム: Dockerが管理する永続ストレージ
  - mysql-data:/var/lib/mysql          # mysql-data → /var/lib/mysql
```

| 種類 | 用途 | 例 |
|------|------|-----|
| バインドマウント | ソースコード共有 | `.:/var/www/html` |
| 名前付きボリューム | データ永続化 | `mysql-data:/var/lib/mysql` |

---

## 9. リクエストの流れ（図解）

### ブラウザからTODOを表示するまで

```
┌────────────────────────────────────────────────────────────────────┐
│                         あなたのPC                                  │
└────────────────────────────────────────────────────────────────────┘
        │
        │ 1. http://localhost:8080/ にアクセス
        ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Docker Engine                                    │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │                    app-network                            │    │
│   │                                                           │    │
│   │   ┌─────────────┐                                        │    │
│   │   │   nginx     │ 2. ポート80で受信                       │    │
│   │   │   :80       │    "/"へのリクエスト                    │    │
│   │   └──────┬──────┘                                        │    │
│   │          │                                                │    │
│   │          │ 3. try_files で index.php へ転送              │    │
│   │          ▼                                                │    │
│   │   ┌─────────────┐                                        │    │
│   │   │   php       │ 4. PHP-FPMがLaravelを実行              │    │
│   │   │   :9000     │    TodoController@index                │    │
│   │   └──────┬──────┘                                        │    │
│   │          │                                                │    │
│   │          │ 5. DBからTODO取得                              │    │
│   │          ▼                                                │    │
│   │   ┌─────────────┐                                        │    │
│   │   │   mysql     │ 6. SELECT * FROM todos                 │    │
│   │   │   :3306     │                                        │    │
│   │   └──────┬──────┘                                        │    │
│   │          │                                                │    │
│   │          │ 7. 結果を返す                                  │    │
│   │          ▼                                                │    │
│   │   ┌─────────────┐                                        │    │
│   │   │   php       │ 8. Inertia::render で                  │    │
│   │   │             │    Reactコンポーネント指定              │    │
│   │   └──────┬──────┘                                        │    │
│   │          │                                                │    │
│   │          │ 9. HTMLレスポンス                              │    │
│   │          ▼                                                │    │
│   │   ┌─────────────┐                                        │    │
│   │   │   nginx     │ 10. レスポンスをクライアントへ          │    │
│   │   └─────────────┘                                        │    │
│   │                                                           │    │
│   └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│   ┌─────────────┐                                                  │
│   │   node      │ 11. Viteがアセットを配信（開発時）              │
│   │   :5173     │     HMR（Hot Module Replacement）               │
│   └─────────────┘                                                  │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
        │
        │ 12. ブラウザでReactがレンダリング
        ▼
┌────────────────────────────────────────────────────────────────────┐
│                    TODOリストが表示される                           │
└────────────────────────────────────────────────────────────────────┘
```

### 開発時のアセット配信

```
開発モード（npm run dev）:
  ブラウザ → Vite（node:5173）→ JSをリアルタイムコンパイル

本番モード（npm run build）:
  ブラウザ → Nginx → public/build/ の静的ファイル
```

---

## 10. よく使うコマンド

### 基本操作

```bash
# コンテナを起動（バックグラウンド）
docker compose up -d

# コンテナを停止・削除
docker compose down

# コンテナの状態確認
docker compose ps

# ログを見る
docker compose logs -f          # 全コンテナ
docker compose logs -f php      # phpコンテナのみ
```

### コンテナ内でコマンド実行

```bash
# PHPコンテナでartisanコマンド
docker compose exec php php artisan migrate

# PHPコンテナにシェルで入る
docker compose exec php bash

# MySQLに接続
docker compose exec mysql mysql -u laravel -p laravel
```

### イメージ・ボリューム管理

```bash
# イメージの再ビルド
docker compose build --no-cache

# 不要なイメージを削除
docker image prune

# ボリュームも含めて完全削除（注意！データ消える）
docker compose down -v
```

### トラブルシューティング

```bash
# コンテナが起動しない場合
docker compose logs php

# ネットワーク確認
docker network ls
docker network inspect laravel-react-todo-sample_app-network

# ポート使用状況確認
lsof -i :8080
```

---

## まとめ

### このプロジェクトのDocker構成

```
┌─────────────────────────────────────────────────────────────┐
│                        ホストマシン                          │
│                                                             │
│  localhost:8080 ─┬─→ nginx ──→ php ──→ mysql               │
│                  │      │        │                          │
│  localhost:5173 ─┼─→ node（Vite）│                          │
│                  │               │                          │
│  localhost:3306 ─┴───────────────┴─→ mysql                  │
│                                                             │
│  ソースコード: バインドマウントで共有                         │
│  DBデータ: 名前付きボリュームで永続化                         │
└─────────────────────────────────────────────────────────────┘
```

### 覚えておくべきポイント

1. **コンテナはサービス名で通信**
   - `php` → `mysql:3306` でDB接続
   - `nginx` → `php:9000` でPHP実行

2. **ポートマッピングはホストからのアクセス用**
   - `8080:80` → ブラウザから`localhost:8080`でアクセス

3. **ボリュームでデータ永続化**
   - コンテナを削除してもDBデータは残る

4. **Nginxはリバースプロキシ**
   - 静的ファイル → 直接配信
   - PHPファイル → PHP-FPMに転送

5. **docker compose up で一発起動**
   - 環境構築の手間を大幅削減
