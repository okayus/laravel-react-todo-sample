<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Todo;
use Illuminate\Support\Collection;

interface TodoRepositoryInterface
{
    /**
     * 全てのTodoを取得
     *
     * @return Collection<int, Todo>
     */
    public function all(): Collection;

    /**
     * IDからTodoを取得
     */
    public function find(int $id): ?Todo;

    /**
     * Todoを作成
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Todo;

    /**
     * Todoを更新
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): bool;

    /**
     * Todoを削除
     */
    public function delete(int $id): bool;
}
