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
        Schema::create('albums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('cover_photo_id')->nullable()->constrained('photos')->onDelete('set null')->comment('Ảnh bìa album');
            $table->boolean('is_auto')->default(false)->comment('Album tự động tạo từ metadata');
            $table->enum('auto_type', ['date', 'location', 'camera', 'person'])->nullable()->comment('Loại album tự động');
            $table->json('auto_criteria')->nullable()->comment('Tiêu chí tự động');
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('is_auto');
            $table->index('auto_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('albums');
    }
};
