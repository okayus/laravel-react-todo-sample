# Requirements Document

## Introduction

技術学習を目的とした最小限のTODOアプリケーション。Laravel + React + Inertia.js のフルスタック構成を実践的に習得するため、基本的なCRUD操作のみを実装する。認証機能やマルチユーザー対応は含まない。

ローカル開発環境ではMySQLを使用し、本番環境ではTiDB Cloudに切り替え可能な設計とする。

## Requirements

### Requirement 1: TODOの作成
**Objective:** As a ユーザー, I want TODOを新規作成できる, so that やるべきタスクを記録できる

#### Acceptance Criteria
1. When ユーザーがTODOのタイトルを入力して送信ボタンをクリックする, the システム shall 新しいTODOをデータベースに保存する
2. When TODOが正常に作成される, the システム shall TODOリストに新しいTODOを表示する
3. If タイトルが空の状態で送信される, then the システム shall エラーメッセージを表示して保存を拒否する

### Requirement 2: TODOの一覧表示
**Objective:** As a ユーザー, I want 登録済みのTODOを一覧で確認できる, so that やるべきタスクを把握できる

#### Acceptance Criteria
1. When ユーザーがアプリにアクセスする, the システム shall 全てのTODOを一覧表示する
2. The システム shall 各TODOのタイトルと完了状態を表示する
3. If TODOが存在しない, then the システム shall 「TODOがありません」というメッセージを表示する

### Requirement 3: TODOの完了/未完了切り替え
**Objective:** As a ユーザー, I want TODOの完了状態を切り替えられる, so that 進捗を管理できる

#### Acceptance Criteria
1. When ユーザーがTODOの完了チェックボックスをクリックする, the システム shall TODOの完了状態をトグルする
2. When 完了状態が変更される, the システム shall 変更をデータベースに即座に保存する
3. The システム shall 完了済みTODOを視覚的に区別して表示する（例：取り消し線）

### Requirement 4: TODOの削除
**Objective:** As a ユーザー, I want 不要なTODOを削除できる, so that リストを整理できる

#### Acceptance Criteria
1. When ユーザーがTODOの削除ボタンをクリックする, the システム shall 該当TODOをデータベースから削除する
2. When TODOが削除される, the システム shall TODOリストから該当TODOを即座に除去する

### Requirement 5: 開発環境
**Objective:** As a 開発者, I want Docker Composeで開発環境を起動できる, so that 環境構築を容易にできる

#### Acceptance Criteria
1. When `docker compose up` を実行する, the システム shall Laravel、Nginx、PHP-FPM、MySQLコンテナを起動する
2. The システム shall ローカルMySQLデータベースに接続可能な状態で起動する
3. When 開発環境が起動する, the システム shall Vite開発サーバーでホットリロードを有効にする

### Requirement 6: CI/CD
**Objective:** As a 開発者, I want GitHub Actionsで自動テストとデプロイができる, so that 継続的デリバリーを実現できる

#### Acceptance Criteria
1. When PRが作成またはmainブランチにプッシュされる, the システム shall GitHub Actionsワークフローを実行する
2. When ワークフローが実行される, the システム shall テスト（PestPHP、Vitest）とビルドを実行する
3. If テストが失敗する, then the システム shall マージをブロックしてエラーを通知する

### Requirement 7: 本番デプロイ（後回し）
**Objective:** As a 開発者, I want EC2に自動デプロイできる, so that 本番環境を運用できる

#### Acceptance Criteria
1. The システム shall 本番環境ではTiDB Cloudに接続する
2. When テストが成功する, the システム shall EC2インスタンスにデプロイを実行する
3. The システム shall 環境変数でデータベース接続先を切り替え可能とする
