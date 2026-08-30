<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Media;

use EnpiiStudio\Core\Media\Contracts\MediaManager as MediaManagerContract;
use EnpiiStudio\Core\Media\Models\Media;
use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class MediaManager implements MediaManagerContract
{
    public function __construct(private TenantContext $context) {}

    public function upload(UploadedFile $file, array $attrs = []): Media
    {
        $tenantId = $this->context->id();
        $uuid = (string) Str::uuid();
        $directory = $tenantId.'/'.now()->format('Y').'/'.now()->format('m');
        $filename = $uuid.'.'.strtolower($file->getClientOriginalExtension());
        $path = $directory.'/'.$filename;

        $disk = (string) config('enpii-core.media.disk', 'public');
        Storage::disk($disk)->putFileAs($directory, $file, $filename);

        return Media::query()->create([
            'tenant_id' => $tenantId,
            'disk' => $disk,
            'path' => $path,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'title' => $attrs['title'] ?? null,
            'alt' => $attrs['alt'] ?? null,
            'meta' => $attrs['meta'] ?? null,
        ]);
    }

    public function delete(Media $media): bool
    {
        $deleted = Storage::disk($media->disk)->delete($media->path);

        return $media->delete() && $deleted;
    }

    public function url(Media $media): string
    {
        return Storage::disk($media->disk)->url($media->path);
    }
}
