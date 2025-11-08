<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Share extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'shareable_type',
        'shareable_id',
        'share_token',
        'share_type',
        'password',
        'expires_at',
        'is_active',
        'view_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'view_count' => 'integer',
    ];

    /**
     * The attributes that should be hidden.
     *
     * @var array<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($share) {
            if (empty($share->share_token)) {
                $share->share_token = Str::random(32);
            }
        });
    }

    /**
     * Get the user who created the share.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the shareable model (Photo or Album).
     */
    public function shareable()
    {
        return $this->morphTo();
    }

    /**
     * Get all recipients of this share.
     */
    public function recipients()
    {
        return $this->belongsToMany(User::class, 'share_recipients', 'share_id', 'recipient_id')
            ->withPivot('can_download', 'can_reshare', 'viewed_at')
            ->withTimestamps();
    }

    /**
     * Get share recipients records.
     */
    public function shareRecipients()
    {
        return $this->hasMany(ShareRecipient::class);
    }

    /**
     * Scope a query to only include active shares.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Scope a query to only include public shares.
     */
    public function scopePublic($query)
    {
        return $query->where('share_type', 'public');
    }

    /**
     * Check if share is expired.
     */
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if share requires password.
     */
    public function hasPassword()
    {
        return !empty($this->password);
    }

    /**
     * Increment view count.
     */
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    /**
     * Get the full share URL.
     */
    public function getShareUrlAttribute()
    {
        return url('/share/' . $this->share_token);
    }
}
