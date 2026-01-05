# コードリーディングレポート: Laravel + React TODOアプリ

## 思考プロセス：どのように読み進めたか

### Step 1: 全体像の把握（Why）

最初に**全体のアーキテクチャ**を理解しないと、個別のコードが何のためにあるのか分からない。そのため以下を確認した：

1. `package.json` / `composer.json` → 何の技術を使っているか
2. `.kiro/steering/` → プロジェクトの目的と設計方針
3. ディレクトリ構造 → どこに何があるか

### Step 2: データの流れを追う（How）

TODOアプリなので「**TODO作成 → 表示 → 完了 → 削除**」のフローを追った。

---

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (React)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ TodoForm    │  │ TodoItem    │  │ Pages/Todos/Index   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ Inertia.js (XHR / JSON)
┌──────────────────────────▼──────────────────────────────────┐
│                    Laravel Backend                          │
│  ┌─────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ Routes      │→ │ TodoController  │→ │ Repository     │  │
│  │ (web.php)   │  │                 │  │ Pattern        │  │
│  └─────────────┘  └─────────────────┘  └────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Eloquent ORM
                    ┌──────▼──────┐
                    │   MySQL     │
                    └─────────────┘
```

**ポイント**: これは**SPA的なMPA**。Inertia.jsが「完全なSPA」と「従来のMPA」の中間を取っている。

---

## フロントエンド詳細（React/TypeScript）

### 思考：「Inertia.jsって何？」

最初に`app.tsx`を見て気づいた。通常のReactアプリと違い、**ルーティングがLaravel側にある**。

```typescript
// resources/js/app.tsx
createInertiaApp({
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
})
```

**わかったこと**：

- `resolve`: URLに応じてLaravelが「どのPageコンポーネントを表示するか」を決める
- Reactは「レンダリング」だけ担当
- SPAのようにページ遷移が速いが、ルーティングはサーバー側

### 型定義の確認

```typescript
// resources/js/types/index.d.ts
interface Todo {
    id: number;
    title: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
}

type PageProps<T = Record<string, unknown>> = T & {
    auth: { user: User };
};
```

**思考**: `PageProps`ジェネリクス型が面白い。各ページで追加のpropsを型安全に受け取れる設計。

### メインページ（Pages/Todos/Index.tsx）

ここが**アプリの中心**。読む順序：

1. **Propsの型** → 何のデータを受け取るか
2. **State管理** → どんな状態を持つか
3. **イベントハンドラ** → 何が起きるか

```typescript
interface IndexProps extends PageProps {
    todos: Todo[];  // サーバーから受け取るTODOリスト
}

export default function Index({ auth, todos }: IndexProps) {
    // Inertia.jsのフォームフック（状態管理+送信を一体化）
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
    });

    // 「今、どのTODOを処理中か」を追跡（UX向上）
    const [processingId, setProcessingId] = useState<number | null>(null);
```

**思考**: `useForm`はInertia.js独自のフック。React Hook Formとは違い、**サーバーへの送信まで含む**。これにより：

- `processing`: 送信中かどうか
- `errors`: サーバーバリデーションエラー
- `reset`: フォームリセット

が一括管理される。

### イベントハンドラの実装

```typescript
// 作成
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('todos.store'), {
        onSuccess: () => reset(),
    });
};

// 完了トグル
const handleToggle = (id: number) => {
    setProcessingId(id);
    router.patch(route('todos.update', id), {}, {
        onFinish: () => setProcessingId(null),
    });
};

// 削除
const handleDelete = (id: number) => {
    setProcessingId(id);
    router.delete(route('todos.destroy', id), {
        onFinish: () => setProcessingId(null),
    });
};
```

**思考**:

- `route('todos.store')` → Ziggyライブラリ。Laravel側のルート名をJSで使える
- `onFinish` → 成功/失敗に関わらず処理完了時に呼ばれる

### コンポーネント分割

```
Pages/Todos/Index.tsx
    └── TodoForm.tsx (入力フォーム)
    └── TodoItem.tsx (各TODOアイテム)
```

**設計判断の読み取り**：

- `TodoForm`: **制御コンポーネント**（親が状態を持つ）
- `TodoItem`: 表示+コールバック呼び出しのみ

```typescript
// Components/Todo/TodoForm.tsx
interface TodoFormProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    error?: string;
    processing: boolean;
}
```

**思考**: `processing`propsでボタン無効化。UX的に重要。連打防止。

---

## バックエンド概要（Laravel）

### 思考：「なぜリポジトリパターン？」

学習目的のアプリで**リポジトリパターン**を採用している。理由を考えた：

1. **テスタビリティ**: モックに差し替え可能
2. **学習目的**: Clean Architectureの入門として

```php
// app/Http/Controllers/TodoController.php
class TodoController extends Controller
{
    public function __construct(
        private TodoRepositoryInterface $todoRepository  // DI
    ) {}

    public function index(): Response
    {
        return Inertia::render('Todos/Index', [
            'todos' => $this->todoRepository->all(),
        ]);
    }
```

**思考**: `Inertia::render`がReactコンポーネントにpropsを渡す橋渡し役。

### ルーティング（routes/web.php）

```php
Route::get('/', [TodoController::class, 'index'])->name('todos.index');
Route::post('/todos', [TodoController::class, 'store'])->name('todos.store');
Route::patch('/todos/{id}', [TodoController::class, 'update'])->name('todos.update');
Route::delete('/todos/{id}', [TodoController::class, 'destroy'])->name('todos.destroy');
```

**思考**: RESTfulな設計。フロントの`route('todos.store')`がここの`name`に対応。

---

## データフロー：TODOを作成する流れ

```
1. ユーザーがフォーム入力 → TodoForm onChange
2. 送信ボタンクリック → handleSubmit
3. Inertia post() → XHRリクエスト
4. Laravel Routes → TodoController@store
5. StoreTodoRequest バリデーション
6. TodoRepository::create()
7. redirect('/') → Inertia が自動でページ再取得
8. React 再レンダリング（新しいtodosで）
```

**思考**: Inertia.jsの魔法は「リダイレクト時に自動でデータ再取得」。SPAのようなUXだが、状態管理の複雑さがない。

---

## テスト構造

### フロントエンド（Vitest + Testing Library）

```typescript
// TodoForm.test.tsx
it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<TodoForm {...defaultProps} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onSubmit).toHaveBeenCalled();
});
```

**思考**: コンポーネントテストは**振る舞い**をテスト。実装詳細ではなく「ユーザーが見るもの」をテスト。

### バックエンド（Pest PHP）

```php
it('can create a todo', function () {
    $todo = Todo::create(['title' => 'Test Todo']);
    expect($todo->title)->toBe('Test Todo');
});
```

---

## 開発環境（Docker）

```yaml
# docker-compose.yml
services:
  nginx: 8080:80  # Webサーバー
  php: PHP-FPM    # Laravelランタイム
  mysql: 3306     # データベース
  node: 5173      # Vite開発サーバー（HMR）
```

**思考**: `node`コンテナが分離されていて、`pnpm dev --host`でHMR（Hot Module Replacement）が効く設計。

---

## 学んだアーキテクチャパターン

| パターン | 場所 | 目的 |
|---------|------|------|
| リポジトリパターン | `app/Repositories/` | データアクセス抽象化 |
| DI（依存性注入） | `AppServiceProvider` | テスタビリティ向上 |
| 制御コンポーネント | `TodoForm` | 親が状態管理 |
| Inertia.js | 全体 | SPA的UX + サーバールーティング |

---

## 所感

このプロジェクトは**フルスタック学習**に最適化されている：

- **フロントエンド開発者**として見ると、Inertia.jsは「React Router不要、状態管理シンプル」という利点がある
- トレードオフは「Laravelに依存」「APIファーストではない」
- 小〜中規模アプリには良い選択肢

**Reactエンジニアへのアドバイス**:

- `useForm`はInertia独自。React Hook Formとは別物
- `route()`関数はZiggy（PHP→JSルート変換）
- ページ遷移は`router.visit()`や`Link`コンポーネント

---

## 技術スタック一覧

### フロントエンド

- React 18.2.0
- TypeScript 5.0.2
- Inertia.js 2.0.0
- Vite 7.0.7
- Tailwind CSS 3.2.1
- Vitest 4.0.16
- Testing Library

### バックエンド

- Laravel 12
- PHP 8.4
- Pest PHP 3.8
- Inertia Laravel 2.0

### インフラ

- Docker (Nginx + PHP-FPM + MySQL 8.0)
- GitHub Actions (CI/CD)
