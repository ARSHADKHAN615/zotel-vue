<?php

namespace Database\Seeders;

use App\Models\Booking;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $bookings = [
            [
                'room_id' => 1, // Room 101
                'guest_name' => 'John Doe',
                'check_in' => now(),
                'check_out' => now()->addDays(3),
            ],
            [
                'room_id' => 2, // Room 102
                'guest_name' => 'Jane Smith',
                'check_in' => now()->addDays(1),
                'check_out' => now()->addDays(5),
            ],
            [
                'room_id' => 3, // Room 103
                'guest_name' => 'Mike Johnson',
                'check_in' => now()->addDays(2),
                'check_out' => now()->addDays(4),
            ],
        ];

        foreach ($bookings as $booking) {
            Booking::create($booking);
        }
    }
}
