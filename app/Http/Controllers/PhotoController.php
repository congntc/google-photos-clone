<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class PhotoController extends Controller
{
    // Inertia pages
    public function index()
    {
        $userId = Auth::id();
        
        // Lấy tất cả photos/videos của user, sắp xếp theo thời gian chụp (hoặc upload)
        $photos = Photo::where('user_id', $userId)
            ->whereNull('deleted_at')
            ->orderByDesc('taken_at')
            ->orderByDesc('uploaded_at')
            ->get()
            ->map(function ($photo) {
                // Kiểm tra nếu file_path là URL (bắt đầu bằng http/https) thì dùng trực tiếp
                $isExternalUrl = str_starts_with($photo->file_path, 'http://') || str_starts_with($photo->file_path, 'https://');
                $url = $isExternalUrl ? $photo->file_path : asset('storage/' . $photo->file_path);
                $thumbnailUrl = $photo->thumbnail_path 
                    ? asset('storage/' . $photo->thumbnail_path) 
                    : $url;
                
                return [
                    'id' => $photo->id,
                    'url' => $url,
                    'thumbnail_url' => $thumbnailUrl,
                    'date' => $photo->taken_at ? $photo->taken_at->format('Y-m-d') : $photo->uploaded_at->format('Y-m-d'),
                    'month' => $photo->taken_at ? $photo->taken_at->format('F Y') : $photo->uploaded_at->format('F Y'),
                    'year' => $photo->taken_at ? $photo->taken_at->format('Y') : $photo->uploaded_at->format('Y'),
                    'type' => str_starts_with($photo->mime_type, 'video/') ? 'video' : 'image',
                    'mime_type' => $photo->mime_type,
                    'is_favorite' => $photo->is_favorite,
                    'original_filename' => $photo->original_filename,
                    'file_size' => $photo->file_size,
                    'width' => $photo->width,
                    'height' => $photo->height,
                ];
            });

        return Inertia::render('Photos', [
            'photos' => $photos
        ]);
    }

    public function albums()
    {
        return Inertia::render('Albums');
    }

    public function albumShow($id)
    {
        return Inertia::render('AlbumShow', ['id' => (int) $id]);
    }

    public function archive() { return Inertia::render('Archive'); }
    public function bin() { return Inertia::render('Bin'); }
    public function documents() { return Inertia::render('Documents'); }
    public function news() { return Inertia::render('News'); }
    public function settings() { return Inertia::render('Settings'); }
    public function favourites() { return Inertia::render('Favourites'); }
    public function screenshots() { return Inertia::render('Screenshots'); }
    public function videos() { return Inertia::render('Videos'); }
    public function recently() { return Inertia::render('Recently'); }
    public function places() { return Inertia::render('Places'); }
    public function people() { return Inertia::render('PeopleAndPets'); }

    // API: hiển thị ảnh, video theo thời gian
    public function timelineByDay(Request $request)
    {
        $userId = Auth::id();
        $items = Photo::where('user_id', $userId)
            ->whereNull('deleted_at')
            ->orderByDesc('taken_at')
            ->get()
            ->groupBy(fn ($p) => optional($p->taken_at ? Carbon::parse($p->taken_at) : Carbon::parse($p->uploaded_at))->format('Y-m-d'));
        return response()->json($items);
    }

    public function timelineByMonth(Request $request)
    {
        $userId = Auth::id();
        $items = Photo::where('user_id', $userId)
            ->whereNull('deleted_at')
            ->orderByDesc('taken_at')
            ->get()
            ->groupBy(fn ($p) => optional($p->taken_at ? Carbon::parse($p->taken_at) : Carbon::parse($p->uploaded_at))->format('Y-m'));
        return response()->json($items);
    }

    public function timelineByYear(Request $request)
    {
        $userId = Auth::id();
        $items = Photo::where('user_id', $userId)
            ->whereNull('deleted_at')
            ->orderByDesc('taken_at')
            ->get()
            ->groupBy(fn ($p) => optional($p->taken_at ? Carbon::parse($p->taken_at) : Carbon::parse($p->uploaded_at))->format('Y'));
        return response()->json($items);
    }

    // Upload ảnh/video; FE có thể gọi với name="files[]"
    public function upload(Request $request)
    {
        try {
            $request->validate([
                'files' => 'required',
                'files.*' => 'file|mimes:jpeg,jpg,png,webp,gif,mp4,mov,avi,webm|max:51200',
            ]);

            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn cần đăng nhập để tải lên ảnh/video.'
                ], 401);
            }

            $saved = [];

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
                    'taken_at' => now(), // Đặt taken_at = thời điểm upload
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

                $saved[] = $photo;
            }

            return response()->json([
                'success' => true,
                'message' => 'Tải lên thành công '.count($saved).' file.',
                'count' => count($saved)
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'File không hợp lệ. Chỉ chấp nhận ảnh (jpeg, jpg, png, webp, gif) và video (mp4, mov, avi, webm) tối đa 50MB.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải lên: ' . $e->getMessage()
            ], 500);
        }
    }
}
