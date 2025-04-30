<template>
  <div class="overflow-x-auto">
    <div class="grid grid-cols-[200px_repeat(14,_100px)] gap-1">
      <!-- Header with dates -->
      <div class="font-bold p-2 bg-gray-100">Room</div>
      <div v-for="date in dates" :key="date" class="font-bold p-2 bg-gray-100 text-sm">
        {{ formatDate(date) }}
      </div>

      <!-- Room rows -->
      <template v-for="room in rooms" :key="room.id">
        <div class="p-2 bg-gray-50">{{ room.room_number }}</div>
        <template v-for="date in dates" :key="date">
          <div 
            class="relative h-16 border border-gray-200"
            @dragover.prevent
            @drop="handleDrop($event, room.id, date)"
          >
            <BookingCell
              v-if="getBookingForDate(room.id, date)"
              :booking="getBookingForDate(room.id, date)"
              :date="date"
              @update="handleBookingUpdate"
            />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useBookingStore } from '@/stores/bookingStore';
import BookingCell from './BookingCell.vue';

const store = useBookingStore();

const props = defineProps({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
});

const dates = computed(() => {
  const dates = [];
  const current = new Date(props.startDate);
  while (current <= props.endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
});

const rooms = computed(() => store.rooms);
const bookingsByRoom = computed(() => store.bookingsByRoom);

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const getBookingForDate = (roomId, date) => {
  const dateStr = date.toISOString().split('T')[0];
  return bookingsByRoom.value[roomId]?.find(booking => {
    const checkIn = new Date(booking.check_in).toISOString().split('T')[0];
    const checkOut = new Date(booking.check_out).toISOString().split('T')[0];
    return dateStr >= checkIn && dateStr <= checkOut;
  });
};

const handleBookingUpdate = async (bookingId, updates) => {
  await store.updateBooking(bookingId, updates);
};

const handleDrop = (event, roomId, date) => {
  const bookingId = event.dataTransfer.getData('bookingId');
  if (bookingId) {
    handleBookingUpdate(bookingId, {
      room_id: roomId,
      check_in: date.toISOString()
    });
  }
};

onMounted(async () => {
  await store.fetchRooms();
  await store.fetchBookings();
});
</script>