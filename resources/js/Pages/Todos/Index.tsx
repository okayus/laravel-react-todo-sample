import { router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import TodoForm from '@/Components/Todo/TodoForm';
import TodoItem from '@/Components/Todo/TodoItem';
import AppLayout from '@/Layouts/AppLayout';
import { Todo } from '@/types';

interface IndexProps {
    todos: Todo[];
}

export default function Index({ todos }: IndexProps) {
    const [processingId, setProcessingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('todos.store'), {
            onSuccess: () => reset('title'),
        });
    };

    const handleToggle = (id: number) => {
        setProcessingId(id);
        router.patch(
            route('todos.update', id),
            {},
            {
                onFinish: () => setProcessingId(null),
            }
        );
    };

    const handleDelete = (id: number) => {
        setProcessingId(id);
        router.delete(route('todos.destroy', id), {
            onFinish: () => setProcessingId(null),
        });
    };

    return (
        <AppLayout title="TODOs">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">TODO List</h2>

            <TodoForm
                value={data.title}
                onChange={(value) => setData('title', value)}
                onSubmit={handleSubmit}
                error={errors.title}
                processing={processing}
            />

            {todos.length === 0 ? (
                <p className="text-gray-500">
                    TODOがありません。新しいタスクを追加してください。
                </p>
            ) : (
                <ul className="space-y-2">
                    {todos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            processing={processingId === todo.id}
                        />
                    ))}
                </ul>
            )}
        </AppLayout>
    );
}
