<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\FeatureFlags;

use EnpiiStudio\Core\FeatureFlags\Models\FeatureFlag;
use InvalidArgumentException;

final class FeatureFlags
{
    public function enabled(string $key): bool
    {
        return FeatureFlag::query()->where('key', $this->key($key))->value('enabled') ?? false;
    }

    public function set(string $key, bool $enabled): FeatureFlag
    {
        $key = $this->key($key);

        return FeatureFlag::query()->updateOrCreate(['key' => $key], ['enabled' => $enabled]);
    }

    private function key(string $key): string
    {
        $key = trim($key);

        if ($key === '') {
            throw new InvalidArgumentException('Feature flag key must not be empty.');
        }

        return $key;
    }
}
