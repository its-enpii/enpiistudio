<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Media\Contracts;

use EnpiiStudio\Core\Media\Models\Media;
use Illuminate\Http\UploadedFile;

interface MediaManager
{
    /**
     * @param  array<string, mixed>  $attrs
     */
    public function upload(UploadedFile $file, array $attrs = []): Media;

    public function delete(Media $media): bool;

    public function url(Media $media): string;
}
