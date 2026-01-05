# Implementation Plan

## Overview
ローカル環境でのTODOアプリ完成を優先し、デプロイは後回しにする。
各タスクはPR単位で実装し、振り返りやすい粒度を維持する。

**DB戦略**: リポジトリパターンを採用し、ローカルはMySQL、本番はTiDB Cloudに切り替え可能にする。

## Phase 1: 基盤構築

- [x] 1. プロジェクト初期化とGitHubリポジトリ作成
  - Laravelプロジェクトを新規作成（Breeze + React + TypeScript）
  - PestPHPをインストール・設定
  - Vitestをインストール・設定
  - GitHubリポジトリを作成し、初期コミットをプッシュ
  - .gitignore、.editorconfig等の基本設定
  - _Requirements: 5.1_

- [x] 2. CI基盤構築（GitHub Actions）
  - GitHub Actionsワークフローファイルを作成
  - PestPHP実行ステップを追加
  - Vitest実行ステップを追加
  - npm run build実行ステップを追加
  - PR時とmainプッシュ時に自動実行されるよう設定
  - _Requirements: 6.1, 6.2, 6.3_
  - _Note: デプロイステップは後で追加_

- [x] 3. Docker Compose開発環境構築
- [x] 3.1 Nginx + PHP-FPM + MySQLコンテナ設定
  - Nginx設定ファイル作成（Laravel用）
  - PHP-FPM Dockerfile作成（PHP 8.3、必要な拡張）
  - MySQLコンテナ追加（ローカル開発用）
  - docker-compose.yml作成
  - _Requirements: 5.1, 5.2_

- [x] 3.2 Vite開発サーバー統合
  - Viteのホットリロードをdocker環境で動作させる設定
  - vite.config.tsのhost設定調整
  - _Requirements: 5.3_

## Phase 2: バックエンド実装

- [x] 4. Todoモデルとマイグレーション
  - Todoモデル作成（fillable、casts設定）
  - todosテーブルのマイグレーション作成
  - モデルファクトリ作成（テスト用）
  - _Requirements: 1.1, 2.2, 3.1, 4.1_

- [x] 5. リポジトリパターン導入
  - TodoRepositoryInterfaceを作成
  - EloquentTodoRepository実装（MySQL/TiDB共通）
  - ServiceProviderでバインディング設定
  - _Requirements: 7.3_
  - _Note: DB切り替え可能な設計を実現_

- [x] 6. TodoController実装
- [x] 6.1 一覧表示アクション（index）
  - リポジトリ経由で全TODO取得
  - Inertiaでページ返却
  - 空リスト時の処理
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 6.2 作成アクション（store）
  - リクエストバリデーション（タイトル必須）
  - リポジトリ経由でTODO保存
  - バリデーションエラー時のエラー返却
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 6.3 (P) 完了切り替えアクション（update）
  - is_completedのトグル処理
  - 存在しないTODOの404処理
  - _Requirements: 3.1, 3.2_

- [x] 6.4 (P) 削除アクション（destroy）
  - TODO削除処理
  - 存在しないTODOの404処理
  - _Requirements: 4.1, 4.2_

- [x] 7. バックエンドテスト（PestPHP）
  - TODO作成テスト（正常系・バリデーションエラー）
  - TODO一覧表示テスト
  - TODO完了トグルテスト
  - TODO削除テスト
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 3.2, 4.1, 4.2_
  - _Note: タスク6のTodoControllerTest.phpで実装済み_

## Phase 3: フロントエンド実装

- [x] 8. 型定義とレイアウト
  - Todo型定義（resources/js/types/）
  - 共通レイアウトコンポーネント作成
  - _Requirements: 2.2_

- [x] 9. Todoコンポーネント実装
- [x] 9.1 TodoFormコンポーネント
  - タイトル入力フィールド
  - 送信ボタン
  - エラーメッセージ表示
  - _Requirements: 1.1, 1.3_

- [x] 9.2 (P) TodoItemコンポーネント
  - タイトル表示
  - 完了チェックボックス
  - 削除ボタン
  - 完了時の取り消し線スタイル
  - _Requirements: 2.2, 3.1, 3.3, 4.1_

- [x] 10. Indexページ実装
  - TodoFormとTodoItemの統合
  - useFormによるフォーム状態管理
  - router.post/patch/deleteによるAPI呼び出し
  - 空リスト時のメッセージ表示
  - _Requirements: 1.2, 2.1, 2.3, 3.2, 4.2_

- [ ] 11. フロントエンドテスト（Vitest）
  - TodoFormコンポーネントのレンダリングテスト
  - TodoItemコンポーネントのレンダリングテスト
  - _Requirements: 1.3, 2.2, 3.3_

## Phase 4: 統合と仕上げ

- [ ] 12. ルーティング設定
  - web.phpにTodoControllerのルート追加
  - ルート名の設定（todos.store, todos.update, todos.destroy）
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 13. 動作確認と最終調整
  - docker compose upでの起動確認
  - 全CRUD操作の手動テスト
  - CIでのテストパス確認
  - _Requirements: 5.1, 5.2, 5.3, 6.2_

---

## Deferred: Phase 5 - デプロイ（後で実装）

- [ ] 14. TiDB Cloud接続設定
  - .env.productionにTiDB接続情報設定
  - SSL証明書パス設定
  - 接続テスト
  - _Requirements: 7.1_

- [ ] 15. EC2デプロイ設定
  - GitHub ActionsにSSHデプロイステップ追加
  - GitHub Secretsの設定手順ドキュメント
  - 本番用docker-compose.prod.yml作成
  - _Requirements: 7.1, 7.2_

---

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1 | 4, 6.2, 9.1, 12 |
| 1.2 | 6.2, 10 |
| 1.3 | 6.2, 9.1, 11 |
| 2.1 | 6.1, 10, 12 |
| 2.2 | 4, 6.1, 8, 9.2, 11 |
| 2.3 | 6.1, 10 |
| 3.1 | 4, 6.3, 9.2, 12 |
| 3.2 | 6.3, 10 |
| 3.3 | 9.2, 11 |
| 4.1 | 4, 6.4, 9.2, 12 |
| 4.2 | 6.4, 10 |
| 5.1 | 1, 3.1, 13 |
| 5.2 | 3.1, 13 |
| 5.3 | 3.2, 13 |
| 6.1 | 2 |
| 6.2 | 2, 13 |
| 6.3 | 2 |
| 7.1 | 14, 15 (deferred) |
| 7.2 | 15 (deferred) |
| 7.3 | 5 |

## PR Strategy

各タスクを以下の粒度でPRにする（目安）:

| PR# | Tasks | Title |
|-----|-------|-------|
| 1 | 1 | feat: プロジェクト初期化（PestPHP, Vitest設定含む） |
| 2 | 2 | ci: GitHub Actions基盤構築 |
| 3 | 3.1, 3.2 | feat: Docker Compose開発環境（MySQL） |
| 4 | 4 | feat: Todoモデルとマイグレーション |
| 5 | 5 | feat: リポジトリパターン導入 |
| 6 | 6.1, 6.2, 6.3, 6.4 | feat: TodoController CRUD |
| 7 | 7 | test: PestPHPバックエンドテスト |
| 8 | 8, 9.1, 9.2 | feat: フロントエンドコンポーネント |
| 9 | 10 | feat: Indexページ統合 |
| 10 | 11 | test: Vitestフロントエンドテスト |
| 11 | 12, 13 | feat: ルーティングと最終調整 |
