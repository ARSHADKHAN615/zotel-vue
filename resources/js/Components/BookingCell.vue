<template>
  <div class="absolute inset-0 m-1 p-2 rounded-md shadow-sm transform transition-all duration-150 group" :class="{
    'bg-blue-100 hover:bg-blue-200': isUpcoming,
    'bg-green-100 hover:bg-green-200': isActive,
    'bg-gray-100 hover:bg-gray-200': isPast
  }" :style="{
    width: `calc(${spanDays * 100}px - 2px)`,
    zIndex: isResizing || isDragging || isHovered ? 10 : 1,
    cursor: isResizing ? 'ew-resize' : 'move'
  }" draggable="true" @dragstart="handleDragStart" @mouseenter="isHovered = true" @mouseleave="isHovered = false">

    <div class="absolute top-0 right-0 p-1 cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-gray-300/20"
      @click.stop="openEditModal">
      <!--edit icon -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    </div> <!-- Added closing tag for the div -->
    <!-- Left resize handle -->
    <div
      class="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-gray-300/20"
      @mousedown="startResize('left', $event)"></div>

    <!-- Right resize handle -->
    <div
      class="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-gray-300/20"
      @mousedown="startResize('right', $event)"></div>

    <div class="flex flex-col h-full pointer-events-none">
      <div class="text-sm font-medium truncate">{{ booking.guest_name }}</div>
      <div class="text-xs text-gray-600 mt-1">
        {{ formatDateRange(booking.check_in, booking.check_out) }}
      </div>
      <div class="text-xs mt-auto" :class="{
        'text-blue-600': isUpcoming,
        'text-green-600': isActive,
        'text-gray-600': isPast
      }">
        {{ getDurationText }}
      </div>
    </div>
  </div>

  <Modal :show="isModalOpen" @close="closeModal">
    <div class="p-6">
      <h2 class="text-lg font-medium mb-4">Edit Booking</h2>

      <form @submit.prevent="saveChanges" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Guest Name</label>
          <input type="text" v-model="editForm.guest_name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Check In</label>
          <input type="date" v-model="editForm.check_in"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Check Out</label>
          <input type="date" v-model="editForm.check_out"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Room</label>
          <select v-model="editForm.room_id"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              Room {{ room.room_number }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button type="button" class="px-4 py-2 border rounded hover:bg-gray-50" @click="closeModal">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useBookingStore } from '@/stores/bookingStore';
import Modal from './Modal.vue';

const props = defineProps({
  booking: {
    type: Object,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  spanDays: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['update']);
const store = useBookingStore();
const rooms = computed(() => store.rooms);

const isModalOpen = ref(false);
const editForm = ref({});
const isHovered = ref(false);
const isResizing = ref(false);
const isDragging = ref(false);
const resizeDirection = ref(null);
const startX = ref(0);
const startDate = ref(null);
const startDays = ref(0);
const pendingUpdate = ref(null);

const formatDateRange = (start, end) => {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  return `${formatDate(start)} - ${formatDate(end)}`;
};

const isUpcoming = computed(() => {
  const today = new Date();
  const checkIn = new Date(props.booking.check_in);
  return checkIn > today;
});

const isActive = computed(() => {
  const today = new Date();
  const checkIn = new Date(props.booking.check_in);
  const checkOut = new Date(props.booking.check_out);
  return today >= checkIn && today <= checkOut;
});

const isPast = computed(() => {
  const today = new Date();
  const checkOut = new Date(props.booking.check_out);
  return checkOut < today;
});

const getDurationText = computed(() => {
  const checkIn = new Date(props.booking.check_in);
  const checkOut = new Date(props.booking.check_out);
  const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return `${days} ${days === 1 ? 'night' : 'nights'}`;
});

const startResize = (direction, event) => {
  event.preventDefault();
  event.stopPropagation();

  isResizing.value = true;
  resizeDirection.value = direction;
  startX.value = event.clientX;
  startDate.value = new Date(direction === 'left' ? props.booking.check_in : props.booking.check_out);
  startDays.value = props.spanDays;

  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', endResize);
};

const handleResize = (event) => {
  if (!isResizing.value) return;

  const deltaX = event.clientX - startX.value;
  const dayDelta = Math.round(deltaX / 100); // Each day cell is 100px wide

  const newDates = calculateNewDates(dayDelta);
  if (newDates && isValidDateRange(newDates.checkIn, newDates.checkOut)) {
    // Store the pending update instead of sending it immediately
    pendingUpdate.value = {
      ...props.booking,
      check_in: newDates.checkIn.toISOString().split('T')[0],
      check_out: newDates.checkOut.toISOString().split('T')[0]
    };

    // Update the visual state through the store's optimistic update
    store.updateBookingOptimistically(props.booking.id, pendingUpdate.value);
  }
};

const calculateNewDates = (dayDelta) => {
  const checkIn = new Date(props.booking.check_in);
  const checkOut = new Date(props.booking.check_out);

  if (resizeDirection.value === 'left') {
    const newCheckIn = new Date(startDate.value);
    newCheckIn.setDate(newCheckIn.getDate() + dayDelta);
    if (newCheckIn >= checkOut) return null;
    return { checkIn: newCheckIn, checkOut };
  } else {
    const newCheckOut = new Date(startDate.value);
    newCheckOut.setDate(newCheckOut.getDate() + dayDelta);
    if (newCheckOut <= checkIn) return null;
    return { checkIn, checkOut: newCheckOut };
  }
};

const isValidDateRange = (checkIn, checkOut) => {
  return checkIn < checkOut && checkOut > checkIn;
};

const endResize = async () => {
  if (isResizing.value && pendingUpdate.value) {
    try {
      // Only make the API call when the resize is complete
      await emit('update', props.booking.id, pendingUpdate.value);
    } catch (error) {
      console.error('Failed to update booking:', error);
    } finally {
      pendingUpdate.value = null;
    }
  }

  isResizing.value = false;
  resizeDirection.value = null;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', endResize);
};

const handleDragStart = (event) => {
  isDragging.value = true;
  event.dataTransfer.setData('bookingId', props.booking.id);
};

const openEditModal = () => {
  editForm.value = {
    guest_name: props.booking.guest_name,
    check_in: new Date(props.booking.check_in).toISOString().split('T')[0],
    check_out: new Date(props.booking.check_out).toISOString().split('T')[0],
    room_id: props.booking.room_id
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveChanges = async () => {
  if (new Date(editForm.value.check_out) <= new Date(editForm.value.check_in)) {
    alert('Check-out date must be after check-in date');
    return;
  }

  try {
    await emit('update', props.booking.id, editForm.value);
    closeModal();
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to update booking');
  }
};

onUnmounted(() => {
  if (isResizing.value) {
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', endResize);
  }
});
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.absolute {
  position: absolute;
}
</style>