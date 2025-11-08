<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'storage_used',
        'storage_limit',
        'dark_mode',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'storage_used' => 'integer',
        'storage_limit' => 'integer',
        'dark_mode' => 'boolean',
    ];

    /**
     * Get all photos owned by this user.
     */
    public function photos()
    {
        return $this->hasMany(Photo::class);
    }

    /**
     * Get all albums owned by this user.
     */
    public function albums()
    {
        return $this->hasMany(Album::class);
    }

    /**
     * Get all shares created by this user.
     */
    public function shares()
    {
        return $this->hasMany(Share::class);
    }

    /**
     * Get all shares received by this user.
     */
    public function receivedShares()
    {
        return $this->belongsToMany(Share::class, 'share_recipients', 'recipient_id', 'share_id')
            ->withPivot('can_download', 'can_reshare', 'viewed_at')
            ->withTimestamps();
    }

    /**
     * Get all notifications for this user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get all tags created by this user.
     */
    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    /**
     * Get all people/faces identified by this user.
     */
    public function people()
    {
        return $this->hasMany(Person::class);
    }

    /**
     * Get friendships where this user is the initiator.
     */
    public function friendships()
    {
        return $this->hasMany(Friendship::class, 'user_id');
    }

    /**
     * Get friendships where this user is the friend.
     */
    public function friendshipsReceived()
    {
        return $this->hasMany(Friendship::class, 'friend_id');
    }

    /**
     * Get all friends (accepted friendships only).
     */
    public function friends()
    {
        return $this->belongsToMany(User::class, 'friendships', 'user_id', 'friend_id')
            ->wherePivot('status', 'accepted')
            ->withPivot('status')
            ->withTimestamps();
    }

    /**
     * Get storage usage percentage.
     */
    public function getStorageUsagePercentageAttribute()
    {
        if ($this->storage_limit <= 0) {
            return 0;
        }
        return round(($this->storage_used / $this->storage_limit) * 100, 2);
    }

    /**
     * Get remaining storage in bytes.
     */
    public function getRemainingStorageAttribute()
    {
        return max(0, $this->storage_limit - $this->storage_used);
    }

    /**
     * Check if user has enough storage space.
     */
    public function hasStorageSpace($requiredBytes)
    {
        return $this->remaining_storage >= $requiredBytes;
    }

    /**
     * Update storage usage.
     */
    public function updateStorageUsed($bytes)
    {
        $this->increment('storage_used', $bytes);
    }

    /**
     * Check if users are friends.
     */
    public function isFriendsWith($userId)
    {
        return $this->friends()->where('friend_id', $userId)->exists()
            || Friendship::where('user_id', $userId)
                ->where('friend_id', $this->id)
                ->where('status', 'accepted')
                ->exists();
    }

    /**
     * Get unread notifications count.
     */
    public function getUnreadNotificationsCountAttribute()
    {
        return $this->notifications()->where('is_read', false)->count();
    }
}
