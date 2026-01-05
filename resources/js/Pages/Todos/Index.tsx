import { Head } from '@inertiajs/react';

interface Todo {
    id: number;
    title: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
}

interface IndexProps {
    todos: Todo[];
}

export default function Index({ todos }: IndexProps) {
    return (
        <>
            <Head title="TODOs" />
            <div className="min-h-screen bg-gray-100 py-12">
                <div className="mx-auto max-w-3xl px-4">
                    <h1 className="mb-8 text-3xl font-bold text-gray-900">
                        TODO List
                    </h1>
                    {todos.length === 0 ? (
                        <p className="text-gray-500">
                            TODOがありません。新しいタスクを追加してください。
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {todos.map((todo) => (
                                <li
                                    key={todo.id}
                                    className="rounded bg-white p-4 shadow"
                                >
                                    <span
                                        className={
                                            todo.is_completed
                                                ? 'text-gray-400 line-through'
                                                : ''
                                        }
                                    >
                                        {todo.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}
