# Laravelディレクトリ構造とフレームワーク思想

このドキュメントでは、Laravel + React（Inertia.js）プロジェクトの各ディレクトリ・ファイルの役割と、Laravelの設計思想を解説します。

---

## Laravelの基本思想

### 1. Convention over Configuration（設定より規約）

Laravelは「規約に従えば設定不要」という思想を持つ。例えば：

- `TodoController` → `todos`テーブルを操作すると推測
- `app/Models/Todo.php` → 自動的に`todos`テーブルにマッピング
- `resources/views/todos/index.blade.php` → `view('todos.index')`で呼び出せる

### 2. Elegant Syntax（エレガントな構文）

Laravelは「美しいコード」を重視する。Railsに影響を受けた思想：

```php
// 複雑なSQLを書かずに
$todos = Todo::where('is_completed', false)->orderBy('created_at')->get();

// ルーティングも直感的
Route::get('/todos', [TodoController::class, 'index']);
```

### 3. Service Container & Dependency Injection

すべてのクラスは「サービスコンテナ」で管理され、依存性注入（DI）が標準：

```php
// コンストラクタに書くだけで自動注入
public function __construct(private TodoRepositoryInterface $todoRepository) {}
```

---

## ルートディレクトリ構造

```
laravel-react-todo-sample/
├── app/                    # アプリケーションコア（PHP）
├── bootstrap/              # フレームワーク起動処理
├── config/                 # 設定ファイル群
├── database/               # マイグレーション、シーダー
├── docker/                 # Docker設定
├── public/                 # 公開ディレクトリ（Webルート）
├── resources/              # フロントエンド資産
├── routes/                 # ルーティング定義
├── storage/                # ログ、キャッシュ、アップロード
├── tests/                  # テストコード
└── vendor/                 # Composerパッケージ（自動生成）
```

---

## 各ディレクトリ詳細

### `app/` - アプリケーションコア

Laravelの心臓部。PSR-4オートロードで`App\`名前空間にマッピング。

```
app/
├── Http/
│   ├── Controllers/        # コントローラー（リクエスト処理）
│   │   ├── Controller.php          # 基底クラス
│   │   ├── TodoController.php      # TODO操作
│   │   ├── ProfileController.php   # プロフィール（Breeze）
│   │   └── Auth/                   # 認証系（Breeze）
│   ├── Middleware/         # ミドルウェア（リクエスト前後処理）
│   │   └── HandleInertiaRequests.php  # Inertia.js用
│   └── Requests/           # フォームリクエスト（バリデーション）
│       ├── StoreTodoRequest.php    # TODO作成時のバリデーション
│       └── UpdateTodoRequest.php   # TODO更新時のバリデーション
├── Models/                 # Eloquentモデル（データベース操作）
│   ├── Todo.php                    # TODOモデル
│   └── User.php                    # ユーザーモデル
├── Providers/              # サービスプロバイダー（DI設定）
│   └── AppServiceProvider.php      # アプリ全体のDI設定
└── Repositories/           # リポジトリ（データアクセス抽象化）
    ├── TodoRepositoryInterface.php # インターフェース
    └── EloquentTodoRepository.php  # Eloquent実装
```

#### 思想：レイヤードアーキテクチャ

```
Request → Middleware → Controller → Repository → Model → Database
                           ↓
                      Response (Inertia)
```

- **Controller**: リクエストを受け取り、適切な処理を呼び出す
- **Repository**: データアクセスを抽象化（テスト容易性向上）
- **Model**: データベーステーブルを表現

---

### `bootstrap/` - フレームワーク起動

```
bootstrap/
├── app.php                 # アプリケーションインスタンス生成
├── cache/                  # 設定キャッシュ（自動生成）
│   └── .gitignore
└── providers.php           # サービスプロバイダー一覧
```

**役割**: Laravelの起動シーケンスを定義。通常は編集不要。

---

### `config/` - 設定ファイル群

```
config/
├── app.php                 # アプリ基本設定（名前、タイムゾーン等）
├── auth.php                # 認証設定（ガード、プロバイダー）
├── cache.php               # キャッシュドライバー設定
├── database.php            # データベース接続設定
├── filesystems.php         # ファイルストレージ設定
├── logging.php             # ログ設定
├── mail.php                # メール設定
├── queue.php               # キュー設定
├── services.php            # 外部サービス設定
└── session.php             # セッション設定
```

#### 思想：環境変数による設定

```php
// config/database.php
'mysql' => [
    'host' => env('DB_HOST', '127.0.0.1'),  // .envから読み込み
    'database' => env('DB_DATABASE', 'laravel'),
]
```

- `.env`ファイルで環境ごとの値を設定
- `config()`ヘルパーでアクセス：`config('app.name')`

---

### `database/` - データベース関連

```
database/
├── factories/              # モデルファクトリー（テストデータ生成）
│   └── UserFactory.php
├── migrations/             # マイグレーション（スキーマ変更履歴）
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 0001_01_01_000001_create_cache_table.php
│   ├── 0001_01_01_000002_create_jobs_table.php
│   └── 2026_01_05_124459_create_todos_table.php
└── seeders/                # シーダー（初期データ投入）
    └── DatabaseSeeder.php
```

#### 思想：バージョン管理されたスキーマ

```php
// マイグレーションファイル
public function up(): void
{
    Schema::create('todos', function (Blueprint $table) {
        $table->id();                              // BIGINT AUTO_INCREMENT
        $table->string('title');                   // VARCHAR(255)
        $table->boolean('is_completed')->default(false);
        $table->timestamps();                      // created_at, updated_at
    });
}

public function down(): void
{
    Schema::dropIfExists('todos');                 // ロールバック用
}
```

- `php artisan migrate`: マイグレーション実行
- `php artisan migrate:rollback`: ロールバック

---

### `docker/` - Docker設定

```
docker/
├── nginx/
│   └── default.conf        # Nginx設定（リバースプロキシ）
└── php/
    └── Dockerfile          # PHP-FPMイメージ定義
```

**思想**: 開発環境の統一化。チーム全員が同じ環境で開発できる。

---

### `public/` - 公開ディレクトリ

```
public/
├── index.php               # エントリーポイント（全リクエストここを通る）
├── build/                  # Viteビルド成果物（自動生成）
│   ├── assets/
│   └── manifest.json
├── robots.txt              # クローラー制御
└── .htaccess               # Apache用リライト設定
```

#### 思想：シングルエントリーポイント

すべてのHTTPリクエストは`index.php`を通過。これにより：

- 統一的なリクエスト処理
- ミドルウェアの適用
- ルーティングの一元管理

---

### `resources/` - フロントエンド資産

```
resources/
├── css/
│   └── app.css             # Tailwind CSSエントリー
├── js/                     # React/TypeScriptコード
│   ├── app.tsx             # Reactエントリーポイント
│   ├── bootstrap.ts        # Axios設定
│   ├── Components/         # 再利用可能コンポーネント
│   │   ├── Todo/
│   │   │   ├── TodoForm.tsx
│   │   │   ├── TodoForm.test.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   └── TodoItem.test.tsx
│   │   ├── Modal.tsx
│   │   ├── TextInput.tsx
│   │   ├── Checkbox.tsx
│   │   └── ...（UIコンポーネント）
│   ├── Layouts/            # レイアウトコンポーネント
│   │   ├── AppLayout.tsx           # TODOアプリ用
│   │   ├── AuthenticatedLayout.tsx # 認証済みユーザー用
│   │   └── GuestLayout.tsx         # ゲスト用
│   ├── Pages/              # ページコンポーネント（=ルート）
│   │   ├── Todos/
│   │   │   └── Index.tsx           # TODO一覧ページ
│   │   ├── Auth/                   # 認証ページ（Breeze）
│   │   ├── Profile/                # プロフィールページ
│   │   ├── Dashboard.tsx
│   │   └── Welcome.tsx
│   ├── types/              # TypeScript型定義
│   │   ├── index.d.ts              # User, Todo, PageProps
│   │   ├── global.d.ts             # グローバル型
│   │   └── vite-env.d.ts           # Vite環境型
│   └── test/
│       └── setup.ts                # Vitestセットアップ
└── views/                  # Bladeテンプレート
    └── app.blade.php               # SPAシェル（HTMLベース）
```

#### 思想：Inertia.jsによるSPA

```
Pages/ = Laravelのルートと1対1対応

Route::get('/', [TodoController::class, 'index'])
    ↓
Inertia::render('Todos/Index', ['todos' => ...])
    ↓
resources/js/Pages/Todos/Index.tsx がレンダリング
```

---

### `routes/` - ルーティング

```
routes/
├── web.php                 # Webルート（セッション、CSRF保護あり）
├── auth.php                # 認証ルート（Breeze）
├── console.php             # Artisanコマンド定義
└── api.php                 # APIルート（存在する場合）
```

#### web.php の構造

```php
<?php
// TODO CRUD
Route::get('/', [TodoController::class, 'index'])->name('todos.index');
Route::post('/todos', [TodoController::class, 'store'])->name('todos.store');
Route::patch('/todos/{id}', [TodoController::class, 'update'])->name('todos.update');
Route::delete('/todos/{id}', [TodoController::class, 'destroy'])->name('todos.destroy');

// 認証が必要なルート
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');
    // ...
});

require __DIR__.'/auth.php';  // 認証ルート読み込み
```

#### 思想：名前付きルート

```php
Route::get('/todos', ...)->name('todos.index');
```

フロントエンドで`route('todos.index')`として参照可能（Ziggy）。
URLが変わっても名前で参照しているためコード変更不要。

---

### `storage/` - ストレージ

```
storage/
├── app/                    # アプリケーションファイル
│   ├── public/             # 公開ファイル（シンボリックリンク）
│   └── private/            # 非公開ファイル
├── framework/              # フレームワーク生成ファイル
│   ├── cache/              # キャッシュ
│   ├── sessions/           # セッションファイル
│   └── views/              # コンパイル済みビュー
└── logs/                   # ログファイル
    └── laravel.log
```

**思想**: 書き込み可能な領域を分離。デプロイ時に上書きされない。

---

### `tests/` - テストコード

```
tests/
├── Feature/                # 機能テスト（統合テスト）
│   ├── TodoTest.php                # TODOモデルテスト
│   ├── TodoControllerTest.php      # コントローラーテスト
│   ├── EloquentTodoRepositoryTest.php
│   ├── Auth/                       # 認証テスト（Breeze）
│   └── ProfileTest.php
├── Unit/                   # ユニットテスト
│   └── ExampleTest.php
├── Pest.php                # Pest設定
└── TestCase.php            # テスト基底クラス
```

#### 思想：Feature vs Unit

- **Feature**: アプリケーション全体の動作をテスト（HTTPリクエスト〜レスポンス）
- **Unit**: 個別のクラス・メソッドを単体テスト

```php
// Feature Test
it('can create a todo', function () {
    $response = $this->post('/todos', ['title' => 'Test']);
    $response->assertRedirect('/');
    $this->assertDatabaseHas('todos', ['title' => 'Test']);
});

// Unit Test
it('casts is_completed to boolean', function () {
    $todo = new Todo(['is_completed' => 1]);
    expect($todo->is_completed)->toBeTrue();
});
```

---

## 設定ファイル（ルート直下）

### PHP関連

| ファイル | 役割 |
|---------|------|
| `composer.json` | PHP依存関係定義 |
| `composer.lock` | 依存関係のロックファイル |
| `phpunit.xml` | PHPUnitテスト設定 |
| `artisan` | LaravelのCLIツール |

### JavaScript関連

| ファイル | 役割 |
|---------|------|
| `package.json` | Node.js依存関係定義 |
| `pnpm-lock.yaml` | pnpmロックファイル |
| `vite.config.ts` | Viteビルド設定 |
| `tsconfig.json` | TypeScript設定 |
| `tailwind.config.js` | Tailwind CSS設定 |
| `postcss.config.js` | PostCSS設定 |

### 環境・設定

| ファイル | 役割 |
|---------|------|
| `.env` | 環境変数（Git管理外） |
| `.env.example` | 環境変数テンプレート |
| `.gitignore` | Git除外設定 |
| `.editorconfig` | エディタ設定統一 |

### Docker

| ファイル | 役割 |
|---------|------|
| `docker-compose.yml` | コンテナ構成定義 |

### ドキュメント

| ファイル | 役割 |
|---------|------|
| `README.md` | プロジェクト説明 |
| `CLAUDE.md` | AI開発アシスタント設定 |

---

## Laravelの主要な設計パターン

### 1. MVC（Model-View-Controller）

```
Model      → app/Models/Todo.php
View       → resources/js/Pages/Todos/Index.tsx (Inertia)
Controller → app/Http/Controllers/TodoController.php
```

### 2. サービスプロバイダー

アプリケーションの「ブートストラップ」を担当：

```php
// app/Providers/AppServiceProvider.php
public function register(): void
{
    // インターフェースと実装の紐付け
    $this->app->bind(
        TodoRepositoryInterface::class,
        EloquentTodoRepository::class
    );
}
```

### 3. ミドルウェア

リクエスト/レスポンスのパイプライン処理：

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        'auth' => ['user' => $request->user()],  // 全ページで共有
    ];
}
```

### 4. フォームリクエスト

バリデーションロジックの分離：

```php
// app/Http/Requests/StoreTodoRequest.php
public function rules(): array
{
    return [
        'title' => ['required', 'string', 'max:255'],
    ];
}
```

### 5. Eloquent ORM

ActiveRecordパターンの実装：

```php
// モデル定義だけでCRUD可能
$todo = Todo::create(['title' => 'New Todo']);
$todo->update(['is_completed' => true]);
$todo->delete();
```

---

## ファイル命名規則

### PHP（PSR-4準拠）

| 種類 | 命名 | 例 |
|------|------|-----|
| クラス | PascalCase | `TodoController.php` |
| メソッド | camelCase | `public function store()` |
| 変数 | camelCase / snake_case | `$todoRepository` |

### TypeScript/React

| 種類 | 命名 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `TodoForm.tsx` |
| フック | camelCase（use prefix） | `useForm` |
| 型/インターフェース | PascalCase | `interface Todo` |

### データベース

| 種類 | 命名 | 例 |
|------|------|-----|
| テーブル | snake_case（複数形） | `todos` |
| カラム | snake_case | `is_completed` |
| 外部キー | 単数形_id | `user_id` |

---

## リクエストライフサイクル

```
1. public/index.php           # エントリーポイント
       ↓
2. bootstrap/app.php          # アプリケーション起動
       ↓
3. Middleware                 # 認証、CSRF、Inertia等
       ↓
4. routes/web.php             # ルートマッチング
       ↓
5. Controller                 # ビジネスロジック
       ↓
6. Repository/Model           # データアクセス
       ↓
7. Inertia::render()          # Reactコンポーネント指定
       ↓
8. resources/js/Pages/*.tsx   # Reactレンダリング
       ↓
9. ブラウザ表示
```

---

## まとめ

Laravelの設計思想は「**開発者の幸福度を最大化する**」こと。

- 規約に従えば設定不要
- エレガントな構文
- 豊富なヘルパー関数
- 強力なORM
- テスト容易性

このプロジェクトでは、Inertia.jsを使ってLaravelの良さを活かしつつ、Reactによるモダンなフロントエンド開発を実現している。
