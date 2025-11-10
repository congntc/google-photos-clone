<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Photo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class DeleteExpiredPhotos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'photos:delete-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Xóa vĩnh viễn các ảnh/video trong thùng rác đã hết hạn (> 60 ngày)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🗑️  Đang tìm các ảnh/video đã hết hạn...');
        
        // Tìm tất cả ảnh đã xóa > 60 ngày
        $expiredPhotos = Photo::onlyTrashed()
            ->where('deleted_at', '<', now()->subDays(60))
            ->get();
        
        if ($expiredPhotos->isEmpty()) {
            $this->info('✅ Không có ảnh/video nào cần xóa.');
            return 0;
        }
        
        $this->info("📊 Tìm thấy {$expiredPhotos->count()} ảnh/video đã hết hạn.");
        
        $deletedCount = 0;
        $errorCount = 0;
        
        DB::beginTransaction();
        
        try {
            foreach ($expiredPhotos as $photo) {
                $this->line("  • Đang xóa: {$photo->original_filename}");
                
                try {
                    // 1. Xóa file vật lý
                    if (Storage::disk('public')->exists($photo->stored_filename)) {
                        Storage::disk('public')->delete($photo->stored_filename);
                    }
                    
                    // 2. Xóa thumbnail nếu có
                    if ($photo->thumbnail_filename && Storage::disk('public')->exists($photo->thumbnail_filename)) {
                        Storage::disk('public')->delete($photo->thumbnail_filename);
                    }
                    
                    // 3. Xóa quan hệ với albums (CASCADE sẽ tự động xóa)
                    // Không cần gọi detach() vì ON DELETE CASCADE
                    
                    // 4. Xóa vĩnh viễn khỏi database
                    $photo->forceDelete();
                    
                    $deletedCount++;
                } catch (\Exception $e) {
                    $this->error("    ❌ Lỗi: {$e->getMessage()}");
                    $errorCount++;
                }
            }
            
            DB::commit();
            
            $this->newLine();
            $this->info("✅ Hoàn thành!");
            $this->info("   📦 Đã xóa: {$deletedCount} ảnh/video");
            
            if ($errorCount > 0) {
                $this->warn("   ⚠️  Lỗi: {$errorCount} ảnh/video");
            }
            
            return 0;
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("❌ Lỗi nghiêm trọng: {$e->getMessage()}");
            return 1;
        }
    }
}
