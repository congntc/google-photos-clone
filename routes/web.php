<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\AlumController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('welcome');

// Guest routes (login & register)
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
    
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    
    Route::controller(PhotoController::class)->group(function () {
        Route::get('/photos', 'index')->name('photos.index');
        // other photo-related routes
        Route::get('/archive', 'archive')->name('photos.archive');
        Route::get('/bin', 'bin')->name('photos.bin');
        Route::get('/documents', 'documents')->name('photos.documents');
        Route::get('/news', 'news')->name('photos.news');
        Route::get('/settings', 'settings')->name('photos.settings');
        Route::get('/favourites', 'favourites')->name('photos.favourites');
        Route::get('/screenshots', 'screenshots')->name('photos.screenshots');
    Route::get('/videos', 'videos')->name('photos.videos');
        Route::get('/recently', 'recently')->name('photos.recently');
        Route::get('/places', 'places')->name('photos.places');
        Route::get('/people', 'people')->name('photos.people');

        // Timeline grouping endpoints
        Route::get('/photos/timeline/day', 'timelineByDay')->name('photos.timeline.day');
        Route::get('/photos/timeline/month', 'timelineByMonth')->name('photos.timeline.month');
        Route::get('/photos/timeline/year', 'timelineByYear')->name('photos.timeline.year');

        // Upload
        Route::post('/photos/upload', 'upload')->name('photos.upload');
        
        // Toggle favorite
        Route::post('/photos/toggle-favorite', 'toggleFavorite')->name('photos.toggleFavorite');
        
        // Delete batch (Soft Delete - vào thùng rác)
        Route::post('/photos/delete-batch', 'deleteBatch')->name('photos.deleteBatch');
        
        // Restore from bin (Khôi phục từ thùng rác)
        Route::post('/photos/restore-batch', 'restoreBatch')->name('photos.restoreBatch');
        
        // Force delete (Xóa vĩnh viễn)
        Route::post('/photos/force-delete-batch', 'forceDeleteBatch')->name('photos.forceDeleteBatch');
        
        // Get bin photos (Lấy danh sách ảnh trong thùng rác)
        Route::get('/api/photos/bin', 'getBinPhotos')->name('photos.getBin');
        
        // Download photo
        Route::get('/photos/{id}/download', 'download')->name('photos.download');
    });

    // Albums routes
    Route::controller(AlumController::class)->group(function () {
        Route::get('/albums', 'index')->name('albums.index');
        
        // API: Get user's albums for modal
        Route::get('/api/albums/user', 'getUserAlbums')->name('albums.api.user');
        
        // Specific routes first to avoid conflicts with dynamic {id}
        Route::get('/albums/create/select', 'createSelect')->name('albums.create.select');
        Route::get('/albums/create', 'create')->name('albums.create');
        Route::post('/albums', 'store')->name('albums.store');
        Route::get('/albums/{id}', 'show')->whereNumber('id')->name('albums.show');
        // Select and attach existing photos to an album
        Route::get('/albums/{id}/select', 'select')->whereNumber('id')->name('albums.select');
        Route::post('/albums/{id}/attach', 'attachExistingPhotos')->whereNumber('id')->name('albums.attach');
        Route::patch('/albums/{id}', 'update')->whereNumber('id')->name('albums.update');
        Route::delete('/albums/{id}', 'destroy')->whereNumber('id')->name('albums.destroy');
        Route::post('/albums/{id}/photos', 'addPhotos')->whereNumber('id')->name('albums.addPhotos');
        Route::post('/albums/{id}/photos/remove-batch', 'removePhotosBatch')->whereNumber('id')->name('albums.removePhotosBatch');
        Route::delete('/albums/{id}/photos/{photoId}', 'removePhoto')->whereNumber('id')->whereNumber('photoId')->name('albums.removePhoto');
    });
});
