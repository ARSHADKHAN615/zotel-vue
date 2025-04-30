<template>
  <div class="overflow-x-auto">
    <div class="grid grid-cols-[200px_repeat(14,_100px)] gap-0 min-w-full">
      <!-- Header with dates -->
      <div class="font-bold p-3 bg-gray-100 sticky left-0 z-10 border-b border-r border-gray-200">Room</div>
      <div v-for="date in dates" :key="date" 
        class="font-bold p-3 bg-gray-100 text-sm border-b border-r border-gray-200 text-center"
        :class="{'bg-gray-200': isToday(date)}"
      >
        <div class="font-medium">{{ formatDateHeader(date) }}</div>
        <div class="text-xs text-gray-600">{{ formatDayName(date) }}</div>
      </div>

      <!-- Room rows -->
      <template v-for="room in rooms" :key="room.id">
        <div class="p-3 bg-gray-50 sticky left-0 z-10 font-medium border-b border-r border-gray-200">
          Room {{ room.room_number }}
        </div>
        <template v-for="(date, dateIndex) in dates" :key="date">
          <div 
            class="relative h-20 border-b border-r border-gray-200 transition-colors duration-150"
            :class="{
              'bg-gray-50': isToday(date),
              'hover:bg-blue-50': !getBookingForDate(room.id, date)
            }"
            @dragover.prevent
            @drop="handleDrop($event, room.id, date)"
          >
            <BookingCell
              v-if="shouldRenderBooking(room.id, date, dateIndex)"
              :booking="getBookingForDate(room.id, date)"
              :date="date"
              :spanDays="getBookingSpan(room.id, date)"
              @update="handleBookingUpdate"
            />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useBookingStore } from '@/stores/bookingStore';
import BookingCell from './BookingCell.vue';

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

const store = useBookingStore();
const rooms = computed(() => store.rooms);
const bookings = computed(() => store.bookings);

const dates = computed(() => {
  const dates = [];
  const current = new Date(props.startDate);
  while (current <= props.endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
});

const formatDateHeader = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
};

const formatDayName = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short'
  });
};

const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const getBookingForDate = (roomId, date) => {
  return bookings.value.find(booking => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const currentDate = new Date(date);
    return booking.room_id === roomId && 
           currentDate >= checkIn && 
           currentDate <= checkOut;
  });
};

const shouldRenderBooking = (roomId, date, dateIndex) => {
  const booking = getBookingForDate(roomId, date);
  if (!booking) return false;
  
  // Only render on the first day of the booking that's visible in our date range
  const bookingStart = new Date(booking.check_in);
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  
  return !getBookingForDate(roomId, prevDate) || 
         bookingStart.toISOString().split('T')[0] === date.toISOString().split('T')[0];
};

const getBookingSpan = (roomId, date) => {
  const booking = getBookingForDate(roomId, date);
  if (!booking) return 1;

  const start = new Date(Math.max(new Date(booking.check_in), new Date(date)));
  const end = new Date(Math.min(new Date(booking.check_out), props.endDate));
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // Don't span beyond our visible range
  const daysUntilEnd = Math.ceil((props.endDate - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(days, daysUntilEnd);
};

const handleBookingUpdate = async (bookingId, updates) => {
  console.log('Updating booking:', bookingId, updates);
  await store.updateBooking(bookingId, updates);
};

const handleDrop = async (event, roomId, date) => {
  const bookingId = event.dataTransfer.getData('bookingId');
  if (bookingId) {
    // Find the existing booking to get its data
    const existingBooking = bookings.value.find(b => b.id.toString() === bookingId);
    if (!existingBooking) return;

    // Calculate the duration of the original booking
    const oldCheckIn = new Date(existingBooking.check_in);
    const oldCheckOut = new Date(existingBooking.check_out);
    const duration = Math.ceil((oldCheckOut - oldCheckIn) / (1000 * 60 * 60 * 24));

    // Calculate new check-out date based on the same duration
    const newCheckIn = new Date(date);
    const newCheckOut = new Date(date);
    newCheckOut.setDate(newCheckIn.getDate() + duration);

    const updates = {
      room_id: roomId,
      guest_name: existingBooking.guest_name,
      check_in: newCheckIn.toISOString().split('T')[0],
      check_out: newCheckOut.toISOString().split('T')[0]
    };

    try {
      // The store will handle optimistic updates
      await store.updateBooking(bookingId, updates);
    } catch (error) {
      // The store will handle rolling back on error
      alert(error.response?.data?.message || 'Failed to update booking');
    }
  }
};

// Refresh bookings when date range changes
watch(
  [() => props.startDate, () => props.endDate],
  async () => {
    await store.fetchBookings();
  }
);

onMounted(async () => {
  await store.fetchRooms();
  await store.fetchBookings();
});
</script>