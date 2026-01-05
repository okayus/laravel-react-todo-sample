<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Todo;
use Illuminate\Support\Collection;

class EloquentTodoRepository implements TodoRepositoryInterface
{
    /**
     * @return Collection<int, Todo>
     */
    public function all(): Collection
    {
        return Todo::all();
    }

    public function find(int $id): ?Todo
    {
        return Todo::find($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Todo
    {
        return Todo::create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): bool
    {
        $todo = Todo::find($id);

        if ($todo === null) {
            return false;
        }

        return $todo->update($data);
    }

    public function delete(int $id): bool
    {
        $todo = Todo::find($id);

        if ($todo === null) {
            return false;
        }

        return (bool) $todo->delete();
    }
}
