<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'avatar_photo_id',
    ];

    /**
     * Get the user that owns this person.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the photo used as avatar for this person.
     */
    public function avatarPhoto()
    {
        return $this->belongsTo(Photo::class, 'avatar_photo_id');
    }

    /**
     * Get all photos that feature this person.
     */
    public function photos()
    {
        return $this->belongsToMany(Photo::class, 'photo_person')
            ->withPivot('face_coordinates')
            ->withTimestamps();
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include named people.
     */
    public function scopeNamed($query)
    {
        return $query->whereNotNull('name');
    }

    /**
     * Scope a query to only include unnamed people.
     */
    public function scopeUnnamed($query)
    {
        return $query->whereNull('name');
    }

    /**
     * Scope a query to search by name.
     */
    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('name', 'like', '%' . $searchTerm . '%');
    }

    /**
     * Get the number of photos featuring this person.
     */
    public function getPhotosCountAttribute()
    {
        return $this->photos()->count();
    }

    /**
     * Check if this person is named.
     */
    public function isNamed()
    {
        return !is_null($this->name);
    }
}
