<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Photo;
use App\Models\User;
use Carbon\Carbon;

class PhotoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy user đầu tiên hoặc tạo mới nếu chưa có
        $user = User::first();
        
        if (!$user) {
            $user = User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Tạo một số ảnh mẫu
        $samplePhotos = [
            [
                'original_filename' => 'sample_image_1.jpg',
                'mime_type' => 'image/jpeg',
                'taken_at' => Carbon::now(), // Hôm nay
                'file_path' => 'https://picsum.photos/800/600?random=1',
            ],
            [
                'original_filename' => 'sample_image_2.jpg',
                'mime_type' => 'image/jpeg',
                'taken_at' => Carbon::now(), // Hôm nay
                'file_path' => 'https://picsum.photos/800/600?random=2',
            ],
            [
                'original_filename' => 'sample_video_1.mp4',
                'mime_type' => 'video/mp4',
                'taken_at' => Carbon::now()->subDay(), // Hôm qua
                'file_path' => 'https://www.w3schools.com/html/mov_bbb.mp4',
            ],
            [
                'original_filename' => 'sample_image_3.jpg',
                'mime_type' => 'image/jpeg',
                'taken_at' => Carbon::now()->subDay(), // Hôm qua
                'file_path' => 'https://picsum.photos/800/600?random=3',
            ],
            [
                'original_filename' => 'sample_image_4.jpg',
                'mime_type' => 'image/jpeg',
                'taken_at' => Carbon::now()->subDays(5), // 5 ngày trước
                'file_path' => 'https://picsum.photos/800/600?random=4',
            ],
            [
                'original_filename' => 'sample_video_2.mp4',
                'mime_type' => 'video/mp4',
                'taken_at' => Carbon::now()->subDays(10), // 10 ngày trước
                'file_path' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            ],
        ];

        foreach ($samplePhotos as $index => $photoData) {
            $storedFilename = uniqid() . '_' . $photoData['original_filename'];
            
            Photo::create([
                'user_id' => $user->id,
                'original_filename' => $photoData['original_filename'],
                'stored_filename' => $storedFilename,
                'file_path' => $photoData['file_path'], // Sử dụng URL trực tiếp cho demo
                'thumbnail_path' => null,
                'file_size' => rand(100000, 5000000), // Random file size
                'mime_type' => $photoData['mime_type'],
                'width' => $photoData['mime_type'] === 'video/mp4' ? null : 1920,
                'height' => $photoData['mime_type'] === 'video/mp4' ? null : 1080,
                'taken_at' => $photoData['taken_at'],
                'camera_make' => 'Sample Camera',
                'camera_model' => 'Model X',
                'latitude' => null,
                'longitude' => null,
                'location_name' => null,
                'is_favorite' => $index === 0, // Đánh dấu ảnh đầu tiên là yêu thích
                'is_archived' => false,
                'deleted_at' => null,
                'uploaded_at' => now(),
            ]);
        }

        $this->command->info('Đã tạo ' . count($samplePhotos) . ' photos mẫu cho user: ' . $user->email);
        $this->command->info('Bao gồm: ' . count(array_filter($samplePhotos, fn($p) => Carbon::parse($p['taken_at'])->isToday())) . ' ảnh hôm nay, ' . count(array_filter($samplePhotos, fn($p) => Carbon::parse($p['taken_at'])->isYesterday())) . ' ảnh hôm qua');
    }
}
