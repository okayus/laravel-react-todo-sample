# Project Structure

## Organization Philosophy

**Laravel標準構成 + Inertia.js統合**

Laravelの規約に従いつつ、フロントエンドはInertia.jsの推奨パターンに沿って配置。

## Repository Structure

```
📁 todo-app/              # アプリ側（モノレポ）- このリポジトリ
📁 todo-app-infra/        # インフラ側（別リポジトリ）
```

## Directory Patterns

### Backend (Laravel)
**Location**: `/app/`, `/routes/`, `/database/`
**Purpose**: Laravel標準MVC構成
**Pattern**:
- Controllers: `App\Http\Controllers\{Resource}Controller`
- Models: `App\Models\{Model}`
- Migrations: `database/migrations/`

### Frontend (React + Inertia)
**Location**: `/resources/js/`
**Purpose**: Reactコンポーネントとページ
**Pattern**:
- Pages: `/resources/js/Pages/{PageName}.tsx`
- Components: `/resources/js/Components/{ComponentName}.tsx`
- Layouts: `/resources/js/Layouts/{LayoutName}.tsx`

### Docker
**Location**: `/docker/`
**Purpose**: コンテナ設定
**Files**: Nginx設定、PHP-FPM設定

### CI/CD
**Location**: `/.github/workflows/`
**Purpose**: GitHub Actionsワークフロー

## Naming Conventions

- **PHP Files**: PascalCase (`TodoController.php`)
- **React Components**: PascalCase (`TodoList.tsx`)
- **Config/Routes**: kebab-case (`web.php`, `app.php`)
- **Migrations**: snake_case with timestamp (`2024_01_01_create_todos_table.php`)

## Import Organization

```typescript
// React/Inertia imports
import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'

// Components
import Layout from '@/Layouts/AppLayout'
import TodoItem from '@/Components/TodoItem'

// Types
import type { Todo } from '@/types'
```

**Path Aliases**:
- `@/`: `/resources/js/`

## Code Organization Principles

- Laravelの規約を尊重
- Inertia.jsのPage単位でルーティング
- コンポーネントは再利用可能な単位で分割
- 型定義は `/resources/js/types/` に集約

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
