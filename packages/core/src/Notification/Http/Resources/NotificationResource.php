<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Notification\Http\Resources;

use EnpiiStudio\Core\Notification\Models\Notification as NotificationModel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var NotificationModel $resource */
        $resource = $this->resource;

        return [
            'id' => (string) $resource->getKey(),
            'type' => $resource->type,
            'title' => $resource->title,
            'body' => $resource->body,
            'data' => $resource->data,
            'read_at' => $resource->read_at?->format('c'),
            'created_at' => $resource->created_at?->toISOString(),
        ];
    }
}
