<?php

declare(strict_types=1);

use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Todo Model', function (): void {
    test('Todoを作成できる', function (): void {
        $todo = Todo::create([
            'title' => 'テストタスク',
            'is_completed' => false,
        ]);

        expect($todo)->toBeInstanceOf(Todo::class);
        expect($todo->title)->toBe('テストタスク');
        expect($todo->is_completed)->toBeFalse();
    });

    test('is_completedはboolean型にキャストされる', function (): void {
        $todo = Todo::create([
            'title' => 'テストタスク',
            'is_completed' => true,
        ]);

        expect($todo->is_completed)->toBeTrue();
        expect($todo->is_completed)->toBeBool();
    });

    test('is_completedのデフォルト値はfalse', function (): void {
        $todo = Todo::create([
            'title' => 'テストタスク',
        ]);

        expect($todo->is_completed)->toBeFalse();
    });

    test('全てのTodoを取得できる', function (): void {
        Todo::create(['title' => 'タスク1']);
        Todo::create(['title' => 'タスク2']);
        Todo::create(['title' => 'タスク3']);

        $todos = Todo::all();

        expect($todos)->toHaveCount(3);
    });

    test('Todoを更新できる', function (): void {
        $todo = Todo::create([
            'title' => '元のタイトル',
            'is_completed' => false,
        ]);

        $todo->update([
            'title' => '更新後のタイトル',
            'is_completed' => true,
        ]);

        expect($todo->fresh()->title)->toBe('更新後のタイトル');
        expect($todo->fresh()->is_completed)->toBeTrue();
    });

    test('Todoを削除できる', function (): void {
        $todo = Todo::create(['title' => '削除するタスク']);
        $todoId = $todo->id;

        $todo->delete();

        expect(Todo::find($todoId))->toBeNull();
    });
});
