<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
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
    
    public function favourites() 
    { 
        $userId = Auth::id();
        
        // Lấy tất cả photos/videos yêu thích của user
        $photos = Photo::where('user_id', $userId)
            ->where('is_favorite', true)
            ->whereNull('deleted_at')
            ->orderByDesc('taken_at')
            ->orderByDesc('uploaded_at')
            ->get()
            ->map(function ($photo) {
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

        return Inertia::render('Favourites', [
            'photos' => $photos
        ]);
    }
    
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

            // Format photos data để trả về cho frontend
            $photosData = collect($saved)->map(function ($photo) {
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

            return response()->json([
                'success' => true,
                'message' => 'Tải lên thành công '.count($saved).' file.',
                'count' => count($saved),
                'photos' => $photosData
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

    // API xóa nhiều ảnh/video (SOFT DELETE - chuyển vào thùng rác)
    // Option C: Soft delete - giữ file vật lý, user có 60 ngày để khôi phục
    public function deleteBatch(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer|exists:photos,id',
            ]);

            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn cần đăng nhập để xóa ảnh/video.'
                ], 401);
            }

            // Soft delete - chỉ set deleted_at, không xóa thật
            // File vật lý vẫn được giữ lại
            $deleted = Photo::whereIn('id', $request->ids)
                ->where('user_id', $userId)
                ->delete(); // Soft delete do model có SoftDeletes trait

            return response()->json([
                'success' => true,
                'message' => "Đã chuyển {$deleted} ảnh/video vào thùng rác. Bạn có 60 ngày để khôi phục.",
                'count' => $deleted
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa: ' . $e->getMessage()
            ], 500);
        }
    }

    // API khôi phục ảnh/video từ thùng rác
    public function restoreBatch(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer|exists:photos,id',
            ]);

            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn cần đăng nhập để khôi phục ảnh/video.'
                ], 401);
            }

            // Khôi phục - set deleted_at = null
            $restored = Photo::onlyTrashed()
                ->whereIn('id', $request->ids)
                ->where('user_id', $userId)
                ->restore();

            return response()->json([
                'success' => true,
                'message' => "Đã khôi phục {$restored} ảnh/video.",
                'count' => $restored
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi khôi phục: ' . $e->getMessage()
            ], 500);
        }
    }

    // API xóa vĩnh viễn ảnh/video
    // Option C: Force delete - xóa cả database và file vật lý
    public function forceDeleteBatch(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer|exists:photos,id',
            ]);

            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn cần đăng nhập để xóa vĩnh viễn ảnh/video.'
                ], 401);
            }

            // Lấy danh sách photos cần xóa
            $photos = Photo::onlyTrashed()
                ->whereIn('id', $request->ids)
                ->where('user_id', $userId)
                ->get();

            if ($photos->count() === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy ảnh/video trong thùng rác.'
                ], 404);
            }

            $deletedCount = 0;
            $errors = [];

            foreach ($photos as $photo) {
                try {
                    // Bước 1: Xóa khỏi album_photo (do foreign key RESTRICT)
                    DB::table('album_photo')->where('photo_id', $photo->id)->delete();
                    
                    // Bước 2: Xóa khỏi photo_tag
                    DB::table('photo_tag')->where('photo_id', $photo->id)->delete();
                    
                    // Bước 3: Xóa khỏi photo_person
                    DB::table('photo_person')->where('photo_id', $photo->id)->delete();

                    // Bước 4: Xóa file vật lý
                    if ($photo->file_path && Storage::disk('public')->exists($photo->file_path)) {
                        Storage::disk('public')->delete($photo->file_path);
                    }
                    
                    // Xóa thumbnail nếu có
                    if ($photo->thumbnail_path && Storage::disk('public')->exists($photo->thumbnail_path)) {
                        Storage::disk('public')->delete($photo->thumbnail_path);
                    }

                    // Bước 5: Xóa record trong database (force delete)
                    $photo->forceDelete();
                    
                    $deletedCount++;

                } catch (\Exception $e) {
                    $errors[] = "Lỗi khi xóa ảnh ID {$photo->id}: " . $e->getMessage();
                }
            }

            if ($deletedCount === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa ảnh/video.',
                    'errors' => $errors
                ], 500);
            }

            $message = "Đã xóa vĩnh viễn {$deletedCount} ảnh/video.";
            if (count($errors) > 0) {
                $message .= " Có " . count($errors) . " lỗi xảy ra.";
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'count' => $deletedCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa vĩnh viễn: ' . $e->getMessage()
            ], 500);
        }
    }

    // API lấy danh sách ảnh/video trong thùng rác
    public function getBinPhotos()
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn cần đăng nhập.'
                ], 401);
            }

            // Lấy ảnh đã xóa (có deleted_at)
            $photos = Photo::onlyTrashed()
                ->where('user_id', $userId)
                ->orderByDesc('deleted_at')
                ->get()
                ->map(function ($photo) {
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
                        'deleted_at' => $photo->deleted_at?->toISOString(),
                        'days_remaining' => $photo->days_remaining,
                        'is_expiring_soon' => $photo->is_expiring_soon,
                        'is_expired' => $photo->is_expired,
                        'expiration_message' => $photo->expiration_message,
                    ];
                });

            return response()->json([
                'success' => true,
                'photos' => $photos,
                'count' => $photos->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách: ' . $e->getMessage()
            ], 500);
        }
    }

    // API download ảnh/video
    public function download(Request $request, $id)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn cần đăng nhập để tải xuống ảnh/video.'
                ], 401);
            }

            $photo = Photo::where('id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$photo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy ảnh/video.'
                ], 404);
            }

            // Kiểm tra nếu file_path là URL external
            $isExternalUrl = str_starts_with($photo->file_path, 'http://') || str_starts_with($photo->file_path, 'https://');
            
            if ($isExternalUrl) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể tải xuống file từ URL external.'
                ], 400);
            }

            // Kiểm tra file tồn tại
            if (!Storage::disk('public')->exists($photo->file_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File không tồn tại trên server.'
                ], 404);
            }

            // Get full path and download
            $filePath = Storage::disk('public')->path($photo->file_path);
            return response()->download($filePath, $photo->original_filename);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải xuống: ' . $e->getMessage()
            ], 500);
        }
    }

    // API toggle favorite (thêm/bỏ yêu thích)
    // Option 2: Database có unique constraint để ngăn duplicate
    // Option 3: Validate trước khi update để đảm bảo bảo mật
    // Option 4: Sử dụng Transaction để đảm bảo data integrity
    public function toggleFavorite(Request $request)
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer|exists:photos,id',
                'is_favorite' => 'required|boolean',
            ]);

            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn cần đăng nhập để thêm/bỏ yêu thích.'
                ], 401);
            }

            // OPTION 3: Validate - Lấy danh sách photos thuộc về user
            // Đảm bảo user chỉ có thể update ảnh của chính họ
            $photos = Photo::whereIn('id', $request->ids)
                ->where('user_id', $userId)
                ->get();

            // Kiểm tra số lượng - đảm bảo tất cả IDs đều hợp lệ
            if ($photos->count() !== count($request->ids)) {
                $validIds = $photos->pluck('id')->toArray();
                $invalidIds = array_diff($request->ids, $validIds);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Một số ảnh không tồn tại hoặc không thuộc về bạn.',
                    'invalid_ids' => $invalidIds
                ], 403);
            }

            // OPTION 4: Transaction - Đảm bảo update an toàn
            // Nếu có lỗi ở giữa chừng, tất cả sẽ được rollback
            $updated = DB::transaction(function () use ($photos, $request) {
                $count = 0;
                foreach ($photos as $photo) {
                    // Chỉ update nếu giá trị thay đổi (tối ưu performance)
                    if ($photo->is_favorite !== $request->is_favorite) {
                        $photo->is_favorite = $request->is_favorite;
                        if ($photo->save()) {
                            $count++;
                        }
                    } else {
                        // Nếu giá trị không đổi, vẫn tính là "updated"
                        $count++;
                    }
                }
                return $count;
            });

            $message = $request->is_favorite 
                ? "Đã thêm {$updated} ảnh/video vào yêu thích."
                : "Đã bỏ {$updated} ảnh/video khỏi yêu thích.";

            return response()->json([
                'success' => true,
                'message' => $message,
                'count' => $updated,
                'is_favorite' => $request->is_favorite
            ]);

        } catch (\Illuminate\Database\QueryException $e) {
            // Bắt lỗi database (vd: unique constraint violation)
            if ($e->getCode() == 23000) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lỗi: File đã tồn tại trong hệ thống.'
                ], 409);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi database: ' . $e->getMessage()
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật: ' . $e->getMessage()
            ], 500);
        }
    }
}
