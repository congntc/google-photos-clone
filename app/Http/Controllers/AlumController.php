<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AlumController extends Controller
{
    /**
     * Display a listing of the user's albums.
     */
    public function index()
    {
        $userId = Auth::id();

        // Get owned albums
        $ownedAlbums = Album::with([
                'photos' => function ($q) {
                    $q->select('photos.id', 'photos.file_path', 'photos.thumbnail_path')
                      ->orderBy('album_photo.order')
                      ->limit(1);
                },
            ])
            ->where('user_id', $userId)
            ->withCount('photos')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Album $album) {
                $first = $album->photos->first();
                $coverUrl = null;
                if ($first) {
                    $isExternal = str_starts_with($first->file_path, 'http://') || str_starts_with($first->file_path, 'https://');
                    $coverUrl = $first->thumbnail_path
                        ? asset('storage/' . $first->thumbnail_path)
                        : ($isExternal ? $first->file_path : asset('storage/' . $first->file_path));
                }

                return [
                    'id' => $album->id,
                    'title' => $album->title,
                    'description' => $album->description,
                    'photos_count' => $album->photos_count,
                    'cover_url' => $coverUrl,
                    'is_owner' => true,
                    'shared_to_me' => false,
                    'created_at' => $album->created_at?->toDateTimeString(),
                    'updated_at' => $album->updated_at?->toDateTimeString(),
                ];
            });

        // Get albums shared with this user via ShareRecipient
        $sharedAlbums = Album::with([
                'photos' => function ($q) {
                    $q->select('photos.id', 'photos.file_path', 'photos.thumbnail_path')
                      ->orderBy('album_photo.order')
                      ->limit(1);
                },
            ])
            ->withCount('photos')
            ->whereHas('shares.recipients', function ($q) use ($userId) {
                $q->where('recipient_id', $userId);
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Album $album) {
                $first = $album->photos->first();
                $coverUrl = null;
                if ($first) {
                    $isExternal = str_starts_with($first->file_path, 'http://') || str_starts_with($first->file_path, 'https://');
                    $coverUrl = $first->thumbnail_path
                        ? asset('storage/' . $first->thumbnail_path)
                        : ($isExternal ? $first->file_path : asset('storage/' . $first->file_path));
                }

                return [
                    'id' => $album->id,
                    'title' => $album->title,
                    'description' => $album->description,
                    'photos_count' => $album->photos_count,
                    'cover_url' => $coverUrl,
                    'is_owner' => false,
                    'shared_to_me' => true,
                    'created_at' => $album->created_at?->toDateTimeString(),
                    'updated_at' => $album->updated_at?->toDateTimeString(),
                ];
            });

        // Merge and sort by created_at desc
        $albums = $ownedAlbums->merge($sharedAlbums)->sortByDesc('created_at')->values();

        return Inertia::render('Albums', [
            'albums' => $albums,
        ]);
    }

    /**
     * Show the form for creating a new album.
     */
    public function create(Request $request)
    {
        $title = $request->query('title', '');
        return Inertia::render('AlbumCreate', [
            'title' => $title,
        ]);
    }

    /**
     * Store a newly created album for the current user.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'photo_ids' => 'nullable|array',
            'photo_ids.*' => 'integer|exists:photos,id'
        ]);

        $userId = Auth::id();

        // Filter only user's photos for security
        $photoIds = collect($data['photo_ids'] ?? [])
            ->unique()
            ->values();
        if ($photoIds->isNotEmpty()) {
            $ownedPhotoIds = Photo::where('user_id', $userId)
                ->whereIn('id', $photoIds)
                ->pluck('id');
            $photoIds = $photoIds->intersect($ownedPhotoIds);
        }

        $album = Album::create([
            'user_id' => $userId,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'is_auto' => false,
        ]);

        if ($photoIds->isNotEmpty()) {
            $pivotData = $photoIds->values()->mapWithKeys(function ($pid, $index) {
                return [$pid => ['order' => $index, 'added_at' => now()]];
            });
            $album->photos()->attach($pivotData);
        }

        return redirect()->route('albums.show', $album->id)
            ->with('success', 'Tạo album thành công.');
    }

    /**
     * Display the specified album with its photos.
     */
    public function show($id)
    {
        $userId = Auth::id();

        $album = Album::where('user_id', $userId)
            ->with(['photos'])
            ->findOrFail($id);

        // Map photos & videos for FE
        $photos = $album->photos->map(function (Photo $photo) {
            $isExternal = str_starts_with($photo->file_path, 'http://') || str_starts_with($photo->file_path, 'https://');
            $url = $isExternal ? $photo->file_path : asset('storage/' . $photo->file_path);
            $thumb = $photo->thumbnail_path ? asset('storage/' . $photo->thumbnail_path) : $url;
            $mime = $photo->mime_type ?? 'image/jpeg';
            $type = str_starts_with($mime, 'video/') ? 'video' : 'image';
            return [
                'id' => $photo->id,
                'url' => $url,
                'thumbnail_url' => $thumb,
                'date' => optional($photo->taken_at ?? $photo->uploaded_at)->format('Y-m-d'),
                'type' => $type,
                'mime_type' => $mime,
            ];
        })->values();

        $albumPayload = [
            'id' => $album->id,
            'title' => $album->title,
            'description' => $album->description,
            'photos_count' => $album->photos()->count(),
            'created_at' => $album->created_at?->toDateTimeString(),
            'updated_at' => $album->updated_at?->toDateTimeString(),
        ];

        return Inertia::render('AlbumShow', [
            'album' => $albumPayload,
            'photos' => $photos,
        ]);
    }

    /**
     * Show selection UI for adding existing user's photos to an album.
     */
    public function select($id)
    {
        $userId = Auth::id();
        $album = Album::where('user_id', $userId)->with('photos')->findOrFail($id);

        // Existing photo IDs in album to exclude
        $existingIds = $album->photos->pluck('id')->toArray();

        $photos = Photo::where('user_id', $userId)
            ->whereNull('deleted_at')
            ->when(!empty($existingIds), function ($q) use ($existingIds) {
                $q->whereNotIn('id', $existingIds);
            })
            ->orderByDesc('taken_at')
            ->orderByDesc('uploaded_at')
            ->get()
            ->map(function (Photo $photo) {
                $isExternalUrl = str_starts_with($photo->file_path, 'http://') || str_starts_with($photo->file_path, 'https://');
                $url = $isExternalUrl ? $photo->file_path : asset('storage/' . $photo->file_path);
                $thumb = $photo->thumbnail_path ? asset('storage/' . $photo->thumbnail_path) : $url;
                return [
                    'id' => $photo->id,
                    'url' => $url,
                    'thumbnail_url' => $thumb,
                    'date' => optional($photo->taken_at ?? $photo->uploaded_at)->format('Y-m-d'),
                    'type' => str_starts_with($photo->mime_type, 'video/') ? 'video' : 'image',
                    'mime_type' => $photo->mime_type,
                ];
            });

        $albumPayload = [
            'id' => $album->id,
            'title' => $album->title,
            'photos_count' => $album->photos()->count(),
        ];

        return Inertia::render('AlbumAddSelect', [
            'album' => $albumPayload,
            'photos' => $photos,
        ]);
    }

    /**
     * Attach existing photos (by id) to an album (no file upload).
     */
    public function attachExistingPhotos(Request $request, $id)
    {
        $userId = Auth::id();
        $album = Album::where('user_id', $userId)->findOrFail($id);

        $data = $request->validate([
            'photo_ids' => 'required|array',
            'photo_ids.*' => 'integer|exists:photos,id'
        ]);

        // Filter only user's own photos
        $photoIds = collect($data['photo_ids'])
            ->unique()
            ->values();
        if ($photoIds->isNotEmpty()) {
            $ownedPhotoIds = Photo::where('user_id', $userId)
                ->whereIn('id', $photoIds)
                ->pluck('id');
            $photoIds = $photoIds->intersect($ownedPhotoIds);
        }

        if ($photoIds->isEmpty()) {
            return back()->with('success', 'Không có ảnh hợp lệ để thêm.');
        }

        $currentMax = $album->photos()->max('album_photo.order') ?? -1;
        $pivotData = [];
        foreach ($photoIds as $index => $pid) {
            $pivotData[$pid] = [
                'order' => $currentMax + 1 + $index,
                'added_at' => now(),
            ];
        }

        // Avoid duplicates: syncWithoutDetaching maintains existing rows
        $album->photos()->syncWithoutDetaching($pivotData);

        return redirect()->route('albums.show', $album->id)->with('success', 'Đã thêm ' . count($photoIds) . ' ảnh/video vào album.');
    }

    /**
     * Update the specified album (e.g., rename).
     */
    public function update(Request $request, $id)
    {
        $userId = Auth::id();
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $album = Album::where('user_id', $userId)->findOrFail($id);
        $album->update([
            'title' => $data['title'],
        ]);

        return redirect()->route('albums.index')->with('success', 'Đã đổi tên album.');
    }

    /**
     * Remove the specified album from storage.
     */
    public function destroy($id)
    {
        $userId = Auth::id();
        $album = Album::where('user_id', $userId)->findOrFail($id);
        $album->delete();

        return redirect()->route('albums.index')->with('success', 'Đã xóa album.');
    }

    /**
     * Multi-step: show selection of user's photos to build album.
     */
    public function createSelect(Request $request)
    {
        $userId = Auth::id();
        $title = $request->query('title', '');

        $photos = Photo::where('user_id', $userId)
            ->whereNull('deleted_at')
            ->orderByDesc('taken_at')
            ->orderByDesc('uploaded_at')
            ->get()
            ->map(function ($photo) {
                $isExternalUrl = str_starts_with($photo->file_path, 'http://') || str_starts_with($photo->file_path, 'https://');
                $url = $isExternalUrl ? $photo->file_path : asset('storage/' . $photo->file_path);
                $thumbnailUrl = $photo->thumbnail_path ? asset('storage/' . $photo->thumbnail_path) : $url;
                return [
                    'id' => $photo->id,
                    'url' => $url,
                    'thumbnail_url' => $thumbnailUrl,
                    'date' => $photo->taken_at ? $photo->taken_at->format('Y-m-d') : $photo->uploaded_at->format('Y-m-d'),
                    'type' => str_starts_with($photo->mime_type, 'video/') ? 'video' : 'image',
                    'mime_type' => $photo->mime_type,
                ];
            });

        return Inertia::render('AlbumCreateSelect', [
            'title' => $title,
            'photos' => $photos,
        ]);
    }

    /**
     * Upload and add photos/videos to an existing album.
     */
    public function addPhotos(Request $request, $id)
    {
        $userId = Auth::id();
        $album = Album::where('user_id', $userId)->findOrFail($id);

        $request->validate([
            'files' => 'required',
            'files.*' => 'file|mimes:jpeg,jpg,png,webp,gif,mp4,mov,avi,webm|max:51200',
        ]);

        $uploaded = [];
        foreach ((array) $request->file('files', []) as $file) {
            $storedPath = $file->store("photos/{$userId}", 'public');

            $photo = Photo::create([
                'user_id' => $userId,
                'original_filename' => $file->getClientOriginalName(),
                'stored_filename' => basename($storedPath),
                'file_path' => $storedPath,
                'thumbnail_path' => null,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                'width' => null,
                'height' => null,
                'taken_at' => now(),
                'camera_make' => null,
                'camera_model' => null,
                'latitude' => null,
                'longitude' => null,
                'location_name' => null,
                'is_favorite' => false,
                'is_archived' => false,
                'deleted_at' => null,
                'uploaded_at' => now(),
            ]);

            // Attach to album with order
            $maxOrder = $album->photos()->max('album_photo.order') ?? -1;
            $album->photos()->attach($photo->id, [
                'order' => $maxOrder + 1,
                'added_at' => now(),
            ]);

            $uploaded[] = $photo;
        }

        // Format uploaded photos để trả về cho frontend
        $photosData = collect($uploaded)->map(function ($photo) {
            $isExternalUrl = str_starts_with($photo->file_path, 'http://') || str_starts_with($photo->file_path, 'https://');
            $url = $isExternalUrl ? $photo->file_path : asset('storage/' . $photo->file_path);
            $thumbnailUrl = $photo->thumbnail_path 
                ? asset('storage/' . $photo->thumbnail_path) 
                : $url;
            
            return [
                'id' => $photo->id,
                'url' => $url,
                'thumbnail_url' => $thumbnailUrl,
                'date' => $photo->taken_at?->format('Y-m-d'),
                'title' => $photo->original_filename,
                'type' => str_starts_with($photo->mime_type, 'video/') ? 'video' : 'image',
                'mime_type' => $photo->mime_type,
            ];
        });

        // Nếu là AJAX request thì trả về JSON
        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Đã thêm ' . count($uploaded) . ' ảnh/video vào album.',
                'photos' => $photosData
            ]);
        }

        return back()->with('success', 'Đã thêm ' . count($uploaded) . ' ảnh/video vào album.');
    }

    /**
     * Remove a photo from the album (detach from album_photo pivot).
     */
    public function removePhoto($id, $photoId)
    {
        $userId = Auth::id();
        $album = Album::where('user_id', $userId)->findOrFail($id);

        // Detach the photo from the album
        $album->photos()->detach($photoId);

        // Nếu là AJAX request thì trả về JSON
        if (request()->wantsJson() || request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Đã xóa ảnh/video khỏi album.'
            ]);
        }

        return back()->with('success', 'Đã xóa ảnh/video khỏi album.');
    }

    /**
     * Remove multiple photos from the album (detach many from album_photo pivot).
     */
    public function removePhotosBatch(Request $request, $id)
    {
        $userId = Auth::id();
        $album = Album::where('user_id', $userId)->findOrFail($id);

        $data = $request->validate([
            'photo_ids' => 'required|array',
            'photo_ids.*' => 'integer',
        ]);

        $ids = collect($data['photo_ids'])->unique()->values();
        if ($ids->isEmpty()) {
            return back()->with('success', 'Không có ảnh/video để xóa.');
        }

        // Only detach those that actually belong to this album
        $attachedIds = $album->photos()->whereIn('photos.id', $ids)->pluck('photos.id');
        if ($attachedIds->isNotEmpty()) {
            $album->photos()->detach($attachedIds->all());
        }

        // Nếu là AJAX request thì trả về JSON
        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Đã xóa ' . $attachedIds->count() . ' ảnh/video khỏi album.',
                'deleted_ids' => $attachedIds->toArray()
            ]);
        }

        return back()->with('success', 'Đã xóa ' . $attachedIds->count() . ' ảnh/video khỏi album.');
    }

    /**
     * API: Get user's private albums for modal selection
     */
    public function getUserAlbums()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn cần đăng nhập.'
            ], 401);
        }

        $albums = Album::with([
                'photos' => function ($q) {
                    $q->select('photos.id', 'photos.file_path', 'photos.thumbnail_path')
                      ->orderBy('album_photo.order')
                      ->limit(1);
                },
            ])
            ->where('user_id', $userId)
            ->withCount('photos')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Album $album) {
                $first = $album->photos->first();
                $coverUrl = null;
                if ($first) {
                    $isExternal = str_starts_with($first->file_path, 'http://') || str_starts_with($first->file_path, 'https://');
                    $coverUrl = $first->thumbnail_path
                        ? asset('storage/' . $first->thumbnail_path)
                        : ($isExternal ? $first->file_path : asset('storage/' . $first->file_path));
                }

                return [
                    'id' => $album->id,
                    'title' => $album->title,
                    'description' => $album->description,
                    'photos_count' => $album->photos_count,
                    'cover_url' => $coverUrl,
                    'created_at' => $album->created_at?->format('d/m/Y'),
                    'updated_at' => $album->updated_at?->toDateTimeString(),
                ];
            });

        return response()->json([
            'success' => true,
            'albums' => $albums
        ]);
    }
}
