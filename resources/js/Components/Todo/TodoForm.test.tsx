import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TodoForm from './TodoForm';

describe('TodoForm', () => {
    it('renders input field and submit button', () => {
        const mockOnChange = vi.fn();
        const mockOnSubmit = vi.fn();

        render(
            <TodoForm
                value=""
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />
        );

        expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
    });

    it('displays the current value in input', () => {
        const mockOnChange = vi.fn();
        const mockOnSubmit = vi.fn();

        render(
            <TodoForm
                value="テストタスク"
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />
        );

        expect(screen.getByDisplayValue('テストタスク')).toBeInTheDocument();
    });

    it('calls onChange when input value changes', () => {
        const mockOnChange = vi.fn();
        const mockOnSubmit = vi.fn();

        render(
            <TodoForm
                value=""
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />
        );

        const input = screen.getByPlaceholderText('新しいタスクを入力...');
        fireEvent.change(input, { target: { value: '新しいタスク' } });

        expect(mockOnChange).toHaveBeenCalledWith('新しいタスク');
    });

    it('calls onSubmit when form is submitted', () => {
        const mockOnChange = vi.fn();
        const mockOnSubmit = vi.fn((e) => e.preventDefault());

        render(
            <TodoForm
                value="タスク"
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
            />
        );

        const button = screen.getByRole('button', { name: '追加' });
        fireEvent.click(button);

        expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('displays error message when error prop is provided', () => {
        const mockOnChange = vi.fn();
        const mockOnSubmit = vi.fn();

        render(
            <TodoForm
                value=""
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
                error="タイトルは必須です"
            />
        );

        expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    });

    it('disables input and button when processing', () => {
        const mockOnChange = vi.fn();
        const mockOnSubmit = vi.fn();

        render(
            <TodoForm
                value=""
                onChange={mockOnChange}
                onSubmit={mockOnSubmit}
                processing={true}
            />
        );

        expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeDisabled();
        expect(screen.getByRole('button', { name: '追加' })).toBeDisabled();
    });
});
