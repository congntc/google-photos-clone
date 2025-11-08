<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Photo extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'original_filename',
        'stored_filename',
        'file_path',
        'thumbnail_path',
        'file_size',
        'mime_type',
        'width',
        'height',
        'taken_at',
        'camera_make',
        'camera_model',
        'latitude',
        'longitude',
        'location_name',
        'is_favorite',
        'is_archived',
        'uploaded_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'taken_at' => 'datetime',
        'uploaded_at' => 'datetime',
        'is_favorite' => 'boolean',
        'is_archived' => 'boolean',
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * The name of the "deleted at" column.
     *
     * @var string
     */
    const DELETED_AT = 'deleted_at';

    /**
     * Get the user that owns the photo.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all albums that contain this photo.
     */
    public function albums()
    {
        return $this->belongsToMany(Album::class, 'album_photo')
            ->withPivot('order', 'added_at')
            ->orderBy('album_photo.order');
    }

    /**
     * Get all tags for this photo.
     */
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'photo_tag')
            ->withTimestamps();
    }

    /**
     * Get all people recognized in this photo.
     */
    public function people()
    {
        return $this->belongsToMany(Person::class, 'photo_person')
            ->withPivot('face_coordinates', 'confidence')
            ->withTimestamps();
    }

    /**
     * Get the shares of this photo (polymorphic).
     */
    public function shares()
    {
        return $this->morphMany(Share::class, 'shareable');
    }

    /**
     * Scope a query to only include favorite photos.
     */
    public function scopeFavorite($query)
    {
        return $query->where('is_favorite', true);
    }

    /**
     * Scope a query to only include archived photos.
     */
    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }

    /**
     * Scope a query to only include photos with GPS coordinates.
     */
    public function scopeWithLocation($query)
    {
        return $query->whereNotNull('latitude')
            ->whereNotNull('longitude');
    }

    /**
     * Get the full URL to the photo.
     */
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Get the thumbnail URL.
     */
    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail_path 
            ? asset('storage/' . $this->thumbnail_path)
            : $this->url;
    }
}
