<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('share_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('share_id')->constrained()->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('users')->onDelete('cascade')->comment('User nhận chia sẻ');
            $table->boolean('can_download')->default(true);
            $table->boolean('can_reshare')->default(false);
            $table->timestamp('viewed_at')->nullable()->comment('Lần đầu xem');
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['share_id', 'recipient_id'], 'unique_share_recipient');
            $table->index('share_id');
            $table->index('recipient_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('share_recipients');
    }
};
