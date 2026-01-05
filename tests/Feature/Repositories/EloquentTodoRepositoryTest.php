<?php

declare(strict_types=1);

use App\Models\Todo;
use App\Repositories\EloquentTodoRepository;
use App\Repositories\TodoRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->repository = new EloquentTodoRepository();
});

describe('EloquentTodoRepository', function (): void {
    test('TodoRepositoryInterfaceを実装している', function (): void {
        expect($this->repository)->toBeInstanceOf(TodoRepositoryInterface::class);
    });

    test('all()で全てのTodoを取得できる', function (): void {
        Todo::factory()->count(3)->create();

        $todos = $this->repository->all();

        expect($todos)->toHaveCount(3);
    });

    test('all()でTodoがない場合は空のコレクションを返す', function (): void {
        $todos = $this->repository->all();

        expect($todos)->toBeEmpty();
    });

    test('find()でIDからTodoを取得できる', function (): void {
        $todo = Todo::factory()->create(['title' => 'テストタスク']);

        $found = $this->repository->find($todo->id);

        expect($found)->not->toBeNull();
        expect($found->title)->toBe('テストタスク');
    });

    test('find()で存在しないIDの場合はnullを返す', function (): void {
        $found = $this->repository->find(999);

        expect($found)->toBeNull();
    });

    test('create()でTodoを作成できる', function (): void {
        $todo = $this->repository->create([
            'title' => '新しいタスク',
        ]);

        expect($todo)->toBeInstanceOf(Todo::class);
        expect($todo->title)->toBe('新しいタスク');
        expect($todo->is_completed)->toBeFalse();
        expect(Todo::count())->toBe(1);
    });

    test('update()でTodoを更新できる', function (): void {
        $todo = Todo::factory()->create([
            'title' => '元のタイトル',
            'is_completed' => false,
        ]);

        $result = $this->repository->update($todo->id, [
            'title' => '更新後のタイトル',
            'is_completed' => true,
        ]);

        expect($result)->toBeTrue();
        expect($todo->fresh()->title)->toBe('更新後のタイトル');
        expect($todo->fresh()->is_completed)->toBeTrue();
    });

    test('update()で存在しないIDの場合はfalseを返す', function (): void {
        $result = $this->repository->update(999, ['title' => 'テスト']);

        expect($result)->toBeFalse();
    });

    test('delete()でTodoを削除できる', function (): void {
        $todo = Todo::factory()->create();

        $result = $this->repository->delete($todo->id);

        expect($result)->toBeTrue();
        expect(Todo::find($todo->id))->toBeNull();
    });

    test('delete()で存在しないIDの場合はfalseを返す', function (): void {
        $result = $this->repository->delete(999);

        expect($result)->toBeFalse();
    });
});

describe('TodoRepositoryInterface DI', function (): void {
    test('ServiceContainerからTodoRepositoryInterfaceを解決できる', function (): void {
        $repository = app(TodoRepositoryInterface::class);

        expect($repository)->toBeInstanceOf(EloquentTodoRepository::class);
    });
});
