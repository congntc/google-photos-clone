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
        Schema::create('photo_person', function (Blueprint $table) {
            $table->id();
            $table->foreignId('photo_id')->constrained()->onDelete('cascade');
            $table->foreignId('person_id')->constrained('people')->onDelete('cascade');
            $table->json('face_coordinates')->nullable()->comment('Tọa độ khuôn mặt {x, y, width, height}');
            $table->decimal('confidence', 5, 2)->nullable()->comment('Độ tin cậy 0.00-100.00');
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['photo_id', 'person_id'], 'unique_photo_person');
            $table->index('photo_id');
            $table->index('person_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('photo_person');
    }
};
