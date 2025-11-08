<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\PhotoController;
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
        Route::get('/albums', 'albums')->name('photos.albums');
    Route::get('/albums/{id}', 'albumShow')->name('photos.albums.show');
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
    });
});
