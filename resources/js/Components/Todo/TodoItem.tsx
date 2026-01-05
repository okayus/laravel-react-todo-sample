import { Todo } from '@/types';

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
    processing?: boolean;
}

export default function TodoItem({
    todo,
    onToggle,
    onDelete,
    processing = false,
}: TodoItemProps) {
    return (
        <li className="flex items-center justify-between rounded bg-white p-4 shadow">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={todo.is_completed}
                    onChange={() => onToggle(todo.id)}
                    disabled={processing}
                    className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span
                    className={
                        todo.is_completed
                            ? 'text-gray-400 line-through'
                            : 'text-gray-900'
                    }
                >
                    {todo.title}
                </span>
            </div>
            <button
                type="button"
                onClick={() => onDelete(todo.id)}
                disabled={processing}
                className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
                削除
            </button>
        </li>
    );
}
