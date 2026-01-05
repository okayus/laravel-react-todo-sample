import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

interface AppLayoutProps {
    title?: string;
}

export default function AppLayout({
    title,
    children,
}: PropsWithChildren<AppLayoutProps>) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-100">
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-3xl px-4 py-4">
                        <h1 className="text-xl font-bold text-gray-900">
                            TODO App
                        </h1>
                    </div>
                </header>
                <main className="py-8">
                    <div className="mx-auto max-w-3xl px-4">{children}</div>
                </main>
            </div>
        </>
    );
}
