<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShareRecipient extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'share_id',
        'recipient_id',
        'can_download',
        'can_reshare',
        'viewed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'can_download' => 'boolean',
        'can_reshare' => 'boolean',
        'viewed_at' => 'datetime',
    ];

    /**
     * Get the share that this recipient belongs to.
     */
    public function share()
    {
        return $this->belongsTo(Share::class);
    }

    /**
     * Get the user who is the recipient.
     */
    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Mark as viewed.
     */
    public function markAsViewed()
    {
        if (!$this->viewed_at) {
            $this->update(['viewed_at' => now()]);
        }
    }

    /**
     * Check if the recipient has viewed the share.
     */
    public function hasViewed()
    {
        return !is_null($this->viewed_at);
    }

    /**
     * Scope a query to only include recipients who have viewed.
     */
    public function scopeViewed($query)
    {
        return $query->whereNotNull('viewed_at');
    }

    /**
     * Scope a query to only include recipients who haven't viewed.
     */
    public function scopeUnviewed($query)
    {
        return $query->whereNull('viewed_at');
    }
}
