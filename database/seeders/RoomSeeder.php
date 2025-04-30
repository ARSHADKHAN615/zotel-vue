<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rooms = [
            ['room_number' => '101', 'type' => 'deluxe'],
            ['room_number' => '102', 'type' => 'deluxe'],
            ['room_number' => '103', 'type' => 'deluxe'],
            ['room_number' => '104', 'type' => 'deluxe'],
            ['room_number' => '105', 'type' => 'deluxe'],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}
