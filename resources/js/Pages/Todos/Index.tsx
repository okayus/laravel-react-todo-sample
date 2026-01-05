import AppLayout from '@/Layouts/AppLayout';
import { Todo } from '@/types';

interface IndexProps {
    todos: Todo[];
}

export default function Index({ todos }: IndexProps) {
    return (
        <AppLayout title="TODOs">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">TODO List</h2>
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
        </AppLayout>
    );
}
