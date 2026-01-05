<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Repositories\TodoRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TodoController extends Controller
{
    public function __construct(
        private readonly TodoRepositoryInterface $todoRepository
    ) {}

    public function index(): Response
    {
        return Inertia::render('Todos/Index', [
            'todos' => $this->todoRepository->all(),
        ]);
    }

    public function store(StoreTodoRequest $request): RedirectResponse
    {
        $this->todoRepository->create($request->validated());

        return redirect('/');
    }

    public function update(UpdateTodoRequest $request, int $id): RedirectResponse
    {
        $todo = $this->todoRepository->find($id);

        if ($todo === null) {
            abort(404);
        }

        // is_completedをトグル
        $this->todoRepository->update($id, [
            'is_completed' => !$todo->is_completed,
        ]);

        return redirect('/');
    }

    public function destroy(int $id): RedirectResponse
    {
        $todo = $this->todoRepository->find($id);

        if ($todo === null) {
            abort(404);
        }

        $this->todoRepository->delete($id);

        return redirect('/');
    }
}
