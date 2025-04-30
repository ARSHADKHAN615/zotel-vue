<template>
  <div
    class="absolute inset-0 m-1 p-2 bg-blue-100 rounded cursor-move"
    draggable="true"
    @dragstart="handleDragStart"
    @click="openEditModal"
  >
    <div class="text-sm font-semibold truncate">{{ booking.guest_name }}</div>
    <div class="text-xs text-gray-600">
      {{ formatDateRange(booking.check_in, booking.check_out) }}
    </div>
  </div>

  <!-- Edit Modal -->
  <DialogModal :show="isModalOpen" @close="closeModal">
    <template #title>
      Edit Booking
    </template>
    <template #content>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Guest Name</label>
          <input
            type="text"
            v-model="editForm.guest_name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Check In</label>
          <input
            type="date"
            v-model="editForm.check_in"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Check Out</label>
          <input
            type="date"
            v-model="editForm.check_out"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Room</label>
          <select
            v-model="editForm.room_id"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              Room {{ room.room_number }}
            </option>
          </select>
        </div>
      </div>
    </template>
    <template #footer>
      <SecondaryButton @click="closeModal">Cancel</SecondaryButton>
      <PrimaryButton class="ml-3" @click="saveChanges">Save Changes</PrimaryButton>
    </template>
  </DialogModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useBookingStore } from '@/stores/bookingStore';
import DialogModal from '@/Components/DialogModal.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import SecondaryButton from '@/Components/SecondaryButton.vue';

const store = useBookingStore();
const rooms = computed(() => store.rooms);

const props = defineProps({
  booking: {
    type: Object,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

const emit = defineEmits(['update']);

const isModalOpen = ref(false);
const editForm = ref({});

const formatDateRange = (start, end) => {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  return `${formatDate(start)} - ${formatDate(end)}`;
};

const handleDragStart = (event) => {
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

  await emit('update', props.booking.id, editForm.value);
  closeModal();
};
</script>