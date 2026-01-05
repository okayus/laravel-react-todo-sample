import { FormEventHandler } from 'react';

interface TodoFormProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: FormEventHandler;
    error?: string;
    processing?: boolean;
}

export default function TodoForm({
    value,
    onChange,
    onSubmit,
    error,
    processing = false,
}: TodoFormProps) {
    return (
        <form onSubmit={onSubmit} className="mb-6">
            <div className="flex gap-2">
                <div className="flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="新しいタスクを入力..."
                        className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={processing}
                    />
                    {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    追加
                </button>
            </div>
        </form>
    );
}
