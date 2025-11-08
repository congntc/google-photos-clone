<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'cover_photo_id',
        'is_auto',
        'auto_type',
        'auto_criteria',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_auto' => 'boolean',
        'auto_criteria' => 'array',
    ];

    /**
     * Get the user that owns the album.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cover photo for the album.
     */
    public function coverPhoto()
    {
        return $this->belongsTo(Photo::class, 'cover_photo_id');
    }

    /**
     * Get all photos in this album.
     */
    public function photos()
    {
        return $this->belongsToMany(Photo::class, 'album_photo')
            ->withPivot('order', 'added_at')
            ->orderBy('album_photo.order');
    }

    /**
     * Get the shares of this album (polymorphic).
     */
    public function shares()
    {
        return $this->morphMany(Share::class, 'shareable');
    }

    /**
     * Scope a query to only include auto-generated albums.
     */
    public function scopeAuto($query)
    {
        return $query->where('is_auto', true);
    }

    /**
     * Scope a query to only include manual albums.
     */
    public function scopeManual($query)
    {
        return $query->where('is_auto', false);
    }

    /**
     * Scope a query by auto album type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('auto_type', $type);
    }

    /**
     * Get the photos count attribute.
     */
    public function getPhotosCountAttribute()
    {
        return $this->photos()->count();
    }
}
