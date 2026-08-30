<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Media\Http\Controllers;

use EnpiiStudio\Core\Media\Contracts\MediaManager;
use EnpiiStudio\Core\Media\Http\Requests\StoreMediaRequest;
use EnpiiStudio\Core\Media\Http\Requests\UpdateMediaRequest;
use EnpiiStudio\Core\Media\Http\Resources\MediaResource;
use EnpiiStudio\Core\Media\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;

final class MediaController extends Controller
{
    public function __construct(private MediaManager $mediaManager) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Media::query();

        if ($request->filled('mime')) {
            $query->where('mime_type', 'like', $request->string('mime').'%');
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(fn ($q) => $q
                ->where('original_name', 'like', '%'.$search.'%')
                ->orWhere('title', 'like', '%'.$search.'%'));
        }

        return MediaResource::collection(
            $query->latest()->paginate(25)
        );
    }

    public function store(StoreMediaRequest $request): JsonResponse
    {
        $media = $this->mediaManager->upload(
            $request->file('file'),
            $request->safe()->only(['title', 'alt', 'meta'])
        );

        return response()->json([
            'data' => MediaResource::make($media)->toArray(request()),
            'meta' => [
                'tenant' => $media->tenant_id,
            ],
        ], 201);
    }

    public function show(Media $media): JsonResponse
    {
        return response()->json([
            'data' => MediaResource::make($media)->toArray(request()),
        ]);
    }

    public function update(UpdateMediaRequest $request, Media $media): JsonResponse
    {
        $media->update($request->safe()->only(['title', 'alt', 'meta']));

        return response()->json([
            'data' => MediaResource::make($media->refresh())->toArray(request()),
        ]);
    }

    public function destroy(Media $media): JsonResponse
    {
        $this->mediaManager->delete($media);

        return response()->json([
            'data' => ['deleted' => true],
        ]);
    }
}
