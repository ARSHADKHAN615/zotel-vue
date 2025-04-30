<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">Room Bookings</h2>
      <div class="flex gap-4">
        <button 
          @click="showNewBookingModal = true"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Booking
        </button>
        <button 
          @click="previousTwoWeeks" 
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Previous
        </button>
        <button 
          @click="nextTwoWeeks" 
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </div>
    
    <CalendarGrid 
      :startDate="startDate" 
      :endDate="endDate" 
    />

    <NewBookingModal
      :show="showNewBookingModal"
      @close="showNewBookingModal = false"
      @created="handleBookingCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CalendarGrid from './CalendarGrid.vue';
import NewBookingModal from './NewBookingModal.vue';
import { useBookingStore } from '@/stores/bookingStore';

const store = useBookingStore();
const showNewBookingModal = ref(false);
const startDate = ref(new Date());
const endDate = computed(() => {
  const end = new Date(startDate.value);
  end.setDate(end.getDate() + 13); // 14 days total
  return end;
});

const previousTwoWeeks = () => {
  const newStart = new Date(startDate.value);
  newStart.setDate(newStart.getDate() - 14);
  startDate.value = newStart;
};

const nextTwoWeeks = () => {
  const newStart = new Date(startDate.value);
  newStart.setDate(newStart.getDate() + 14);
  startDate.value = newStart;
};

const handleBookingCreated = () => {
  // Refresh bookings after creation
  store.fetchBookings();
};
</script>