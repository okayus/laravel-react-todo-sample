# Technology Stack

## Architecture

モノリシックSPA構成。LaravelがバックエンドAPIとViewの両方を担当し、Inertia.jsがReactフロントエンドとシームレスに接続。

```
┌─────────────────────────────────────┐
│  React (TypeScript) + Inertia.js   │  ← フロントエンド
├─────────────────────────────────────┤
│  Laravel 11                         │  ← バックエンド
├─────────────────────────────────────┤
│  TiDB Cloud (MySQL互換)            │  ← データベース
└─────────────────────────────────────┘
```

## Core Technologies

- **Language**: PHP 8.3+, TypeScript 5+
- **Backend**: Laravel 11
- **Frontend**: React 18+, Inertia.js
- **Database**: TiDB Cloud Serverless (MySQL互換)
- **Runtime**: Docker (Nginx + PHP-FPM)

## Key Libraries

- **Inertia.js**: LaravelとReactの橋渡し
- **Vite**: フロントエンドビルド
- **Tailwind CSS**: スタイリング（予定）

## Development Standards

### Type Safety
- TypeScript strict mode
- Laravel型付きプロパティ活用

### Code Quality
- ESLint + Prettier（フロントエンド）
- Laravel Pint（バックエンド）

### Testing
- PHPUnit（バックエンド）
- Jest/Vitest（フロントエンド、必要に応じて）

## Development Environment

### Required Tools
- Docker & Docker Compose
- Node.js 20+
- PHP 8.3+ (ローカル開発時)

### Common Commands
```bash
# Dev: docker compose up -d
# Build: npm run build
# Test: php artisan test
```

## Infrastructure

- **Hosting**: AWS EC2 (t3.micro)
- **Database**: TiDB Cloud Serverless (Free Tier)
- **DNS**: お名前.com
- **IaC**: Terraform（別リポジトリ）
- **CI/CD**: GitHub Actions

## Key Technical Decisions

| 決定 | 理由 |
|------|------|
| TiDB over RDS | コスト削減（無料枠）、MySQL互換 |
| EC2 over ECS | 学習目的、シンプル構成優先 |
| Inertia.js | SPAのUXとLaravelの開発効率を両立 |
| モノレポ | アプリ側の一元管理、インフラは分離 |

---
_Document standards and patterns, not every dependency_
