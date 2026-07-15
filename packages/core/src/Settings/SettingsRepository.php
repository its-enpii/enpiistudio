<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Settings;

use EnpiiStudio\Core\Settings\Models\Setting;
use InvalidArgumentException;

final class SettingsRepository
{
    public function get(string $key, mixed $default = null): mixed
    {
        $key = $this->key($key);

        return Setting::query()->where('key', $key)->value('value') ?? $default;
    }

    public function set(string $key, mixed $value): Setting
    {
        $key = $this->key($key);

        return Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }

    private function key(string $key): string
    {
        $key = trim($key);

        if ($key === '' || ! str_contains($key, '.')) {
            throw new InvalidArgumentException('Setting key must be a non-empty namespaced key.');
        }

        return $key;
    }
}
