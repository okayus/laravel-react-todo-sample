# Research & Design Decisions

## Summary
- **Feature**: `minimal-todo`
- **Discovery Scope**: New Feature (greenfield) - Simple Addition (CRUD)
- **Key Findings**:
  - Laravel 11 + Inertia.js + React の組み合わせは公式にサポートされ、Laravel Breezeで簡単にセットアップ可能
  - リポジトリパターンでDB抽象化し、ローカル（MySQL）と本番（TiDB Cloud）を切り替え可能
  - GitHub ActionsのCI構築を先行し、デプロイは後回しにする

## Research Log

### Laravel 11 + Inertia.js + React セットアップ
- **Context**: フルスタック構成の技術選定確認
- **Sources Consulted**: Laravel公式ドキュメント、Inertia.js公式サイト
- **Findings**:
  - Laravel Breezeがinertia + reactスターターを提供
  - Viteがデフォルトのビルドツール
  - TypeScriptはオプションだが追加設定で対応可能
- **Implications**: `laravel new --breeze --stack=react` でプロジェクト初期化可能

### リポジトリパターン採用
- **Context**: ローカル（MySQL）と本番（TiDB Cloud）のDB切り替え
- **Sources Consulted**: Laravel公式、DDD実践ガイド
- **Findings**:
  - LaravelのService Containerでインターフェースと実装をバインド
  - Eloquentを使用する限りMySQL/TiDBは同一実装で対応可能
  - 将来的にTiDB固有の最適化が必要になった場合に備える
- **Implications**: TodoRepositoryInterface → EloquentTodoRepository

### ローカルMySQL + Docker Compose
- **Context**: TiDB Cloud設定を後回しにし、ローカル開発を優先
- **Sources Consulted**: Docker公式、Laravel Sail
- **Findings**:
  - MySQLコンテナをDocker Composeに追加
  - .envでDB_HOST=mysqlを設定
  - マイグレーションはローカルMySQLで実行
- **Implications**: 開発環境の起動が簡単になり、外部サービス依存なし

### TiDB Cloud接続（本番用・後回し）
- **Context**: 本番環境でのDB接続
- **Sources Consulted**: TiDB Cloud公式ドキュメント
- **Findings**:
  - Serverless Tierは5GB、50M Request Units/月まで無料
  - MySQL 8.0互換、SSL接続必須
  - 接続文字列形式: `mysql://user:pass@gateway.tidbcloud.com:4000/db?ssl=true`
- **Implications**: デプロイフェーズで.env.productionに設定

### テストフレームワーク
- **Context**: ユニットテストとコンポーネントテスト
- **Sources Consulted**: PestPHP公式、Vitest公式
- **Findings**:
  - PestPHP: PHPUnitのシンタックスシュガー、Laravelと親和性高い
  - Vitest: Viteベースで高速、React Testing Libraryと組み合わせ
- **Implications**: `pest:install`でPest導入、`vitest`をdevDependenciesに追加

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Laravel MVC + Inertia | Laravelの標準MVCにInertiaでReactを統合 | 学習コスト低、公式サポート | SPAと比べると柔軟性は劣る | 学習目的に最適 |
| リポジトリパターン | データアクセス層を抽象化 | DB切り替え容易、テスタブル | 小規模には過剰かも | 学習目的として採用 |

## Design Decisions

### Decision: リポジトリパターン採用
- **Context**: ローカルMySQL、本番TiDB Cloudの切り替え
- **Alternatives Considered**:
  1. 直接Eloquent使用 — シンプルだがDB切り替えが.envのみ依存
  2. リポジトリパターン — 抽象化層を追加
- **Selected Approach**: リポジトリパターン
- **Rationale**: 学習目的としてデザインパターンを実践。将来TiDB固有の実装が必要になった場合に備える
- **Trade-offs**: 小規模プロジェクトには若干オーバー。ただしLaravelのDI機能学習に有効
- **Follow-up**: なし

### Decision: CI先行・デプロイ後回し
- **Context**: ローカル完成を優先
- **Alternatives Considered**:
  1. CI/CDを同時に構築
  2. CIのみ先行、デプロイは後で
- **Selected Approach**: CI先行
- **Rationale**: ローカルで動作確認しながら開発を進める。デプロイ設定は後から追加
- **Trade-offs**: 本番環境での動作確認が遅れる
- **Follow-up**: Requirement 7で本番デプロイを実装

### Decision: Docker Compose構成
- **Context**: 開発環境構築
- **Alternatives Considered**:
  1. Nginx + PHP-FPM + MySQL — 3サービス構成
  2. Laravel Sail — Laravel公式Docker環境
- **Selected Approach**: Nginx + PHP-FPM + MySQL
- **Rationale**: Sailは学習用には隠蔽されすぎる。カスタム構成で仕組みを理解
- **Trade-offs**: 初期設定は手間だが、インフラ学習に有効
- **Follow-up**: 本番ではMySQLをTiDB Cloudに差し替え

## Risks & Mitigations
- **リポジトリパターンの過剰設計** — 学習目的として許容。シンプルな実装を維持
- **TiDB互換性問題** — MySQL互換のため問題は少ないが、本番デプロイ時に確認
- **CI/CDの分離** — 後からデプロイを追加する際の統合に注意

## References
- [Laravel 11 Documentation](https://laravel.com/docs/11.x)
- [Inertia.js Official](https://inertiajs.com/)
- [PestPHP Official](https://pestphp.com/)
- [Vitest Official](https://vitest.dev/)
- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud/)
