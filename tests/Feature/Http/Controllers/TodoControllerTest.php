<?php

declare(strict_types=1);

use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    // テスト時はViteマニフェストチェックをスキップ
    $this->withoutVite();
});

describe('TodoController@index', function (): void {
    test('TODOリストページを表示できる', function (): void {
        Todo::factory()->count(3)->create();

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Todos/Index')
            ->has('todos', 3)
        );
    });

    test('TODOがない場合も正常に表示できる', function (): void {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Todos/Index')
            ->has('todos', 0)
        );
    });

    test('todosには必要なプロパティが含まれる', function (): void {
        Todo::factory()->create([
            'title' => 'テストタスク',
            'is_completed' => true,
        ]);

        $response = $this->get('/');

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Todos/Index')
            ->has('todos.0', fn (AssertableInertia $todo) => $todo
                ->has('id')
                ->where('title', 'テストタスク')
                ->where('is_completed', true)
                ->has('created_at')
                ->has('updated_at')
            )
        );
    });
});

describe('TodoController@store', function (): void {
    test('TODOを作成できる', function (): void {
        $response = $this->post('/todos', [
            'title' => '新しいタスク',
        ]);

        $response->assertRedirect('/');
        expect(Todo::count())->toBe(1);
        expect(Todo::first()->title)->toBe('新しいタスク');
    });

    test('タイトルが空の場合はバリデーションエラー', function (): void {
        $response = $this->post('/todos', [
            'title' => '',
        ]);

        $response->assertSessionHasErrors(['title']);
        expect(Todo::count())->toBe(0);
    });

    test('タイトルが255文字を超える場合はバリデーションエラー', function (): void {
        $response = $this->post('/todos', [
            'title' => str_repeat('あ', 256),
        ]);

        $response->assertSessionHasErrors(['title']);
        expect(Todo::count())->toBe(0);
    });

    test('作成時はis_completedがfalseになる', function (): void {
        $this->post('/todos', [
            'title' => '新しいタスク',
        ]);

        expect(Todo::first()->is_completed)->toBeFalse();
    });
});

describe('TodoController@update', function (): void {
    test('TODOの完了状態を切り替えできる', function (): void {
        $todo = Todo::factory()->create(['is_completed' => false]);

        $response = $this->patch("/todos/{$todo->id}", [
            'is_completed' => true,
        ]);

        $response->assertRedirect('/');
        expect($todo->fresh()->is_completed)->toBeTrue();
    });

    test('完了状態をfalseに戻せる', function (): void {
        $todo = Todo::factory()->create(['is_completed' => true]);

        $response = $this->patch("/todos/{$todo->id}", [
            'is_completed' => false,
        ]);

        $response->assertRedirect('/');
        expect($todo->fresh()->is_completed)->toBeFalse();
    });

    test('存在しないTODOの更新は404', function (): void {
        $response = $this->patch('/todos/999', [
            'is_completed' => true,
        ]);

        $response->assertNotFound();
    });
});

describe('TodoController@destroy', function (): void {
    test('TODOを削除できる', function (): void {
        $todo = Todo::factory()->create();

        $response = $this->delete("/todos/{$todo->id}");

        $response->assertRedirect('/');
        expect(Todo::find($todo->id))->toBeNull();
    });

    test('存在しないTODOの削除は404', function (): void {
        $response = $this->delete('/todos/999');

        $response->assertNotFound();
    });
});
