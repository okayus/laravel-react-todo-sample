import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TodoItem from './TodoItem';
import { Todo } from '@/types';

const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
    id: 1,
    title: 'テストタスク',
    is_completed: false,
    created_at: '2026-01-05T00:00:00Z',
    updated_at: '2026-01-05T00:00:00Z',
    ...overrides,
});

describe('TodoItem', () => {
    it('renders todo title', () => {
        const todo = createTodo({ title: 'サンプルタスク' });
        const mockOnToggle = vi.fn();
        const mockOnDelete = vi.fn();

        render(
            <TodoItem
                todo={todo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByText('サンプルタスク')).toBeInTheDocument();
    });

    it('renders checkbox with correct checked state for incomplete todo', () => {
        const todo = createTodo({ is_completed: false });
        const mockOnToggle = vi.fn();
        const mockOnDelete = vi.fn();

        render(
            <TodoItem
                todo={todo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
    });

    it('renders checkbox with correct checked state for completed todo', () => {
        const todo = createTodo({ is_completed: true });
        const mockOnToggle = vi.fn();
        const mockOnDelete = vi.fn();

        render(
            <TodoItem
                todo={todo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    it('applies line-through style when todo is completed', () => {
        const todo = createTodo({ is_completed: true, title: '完了タスク' });
        const mockOnToggle = vi.fn();
        const mockOnDelete = vi.fn();

        render(
            <TodoItem
                todo={todo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const titleElement = screen.getByText('完了タスク');
        expect(titleElement).toHaveClass('line-through');
    });

    it('does not apply line-through style when todo is not completed', () => {
        const todo = createTodo({ is_completed: false, title: '未完了タスク' });
        const mockOnToggle = vi.fn();
        const mockOnDelete = vi.fn();

        render(
            <TodoItem
                todo={todo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const titleElement = screen.getByText('未完了タスク');
        expect(titleElement).not.toHaveClass('line-through');
    });

    it('calls onToggle with todo id when checkbox is clicked', () => {
        const todo = createTodo({ id: 42 });
        const mockOnToggle = vi.fn();
        const mockOnDelete = vi.fn();

        render(
            <TodoItem
                todo={todo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(mockOnToggle).toHaveBeenCalledWith(42);
    });

    it('renders delete button', () => {
        const todo = createTodo();
        const mockOnToggle = vi.fn();
        const mockOnDelete = vi.fn();

        render(
            <TodoItem
                todo={todo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
    });

    it('calls onDelete with todo id when delete button is clicked', () => {
        const todo = createTodo({ id: 123 });
        const mockOnToggle = vi.fn();
        const mockOnDelete = vi.fn();

        render(
            <TodoItem
                todo={todo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const deleteButton = screen.getByRole('button', { name: '削除' });
        fireEvent.click(deleteButton);

        expect(mockOnDelete).toHaveBeenCalledWith(123);
    });

    it('disables checkbox and delete button when processing', () => {
        const todo = createTodo();
        const mockOnToggle = vi.fn();
        const mockOnDelete = vi.fn();

        render(
            <TodoItem
                todo={todo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
                processing={true}
            />
        );

        expect(screen.getByRole('checkbox')).toBeDisabled();
        expect(screen.getByRole('button', { name: '削除' })).toBeDisabled();
    });
});
