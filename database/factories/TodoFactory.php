<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Todo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Todo>
 */
class TodoFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'is_completed' => false,
        ];
    }

    /**
     * 完了済み状態のTodo
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_completed' => true,
        ]);
    }
}
