<template>
    <Modal :show="show" @close="$emit('close')">
        <div class="p-6">
            <h2 class="text-lg font-medium mb-4">New Booking</h2>
            
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Guest Name</label>
                    <input
                        type="text"
                        v-model="form.guest_name"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Room</label>
                    <select
                        v-model="form.room_id"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    >
                        <option value="">Select a room</option>
                        <option v-for="room in rooms" :key="room.id" :value="room.id">
                            Room {{ room.room_number }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Check In</label>
                    <input
                        type="date"
                        v-model="form.check_in"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Check Out</label>
                    <input
                        type="date"
                        v-model="form.check_out"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        class="px-4 py-2 border rounded hover:bg-gray-50"
                        @click="$emit('close')"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        :disabled="isSubmitting"
                    >
                        Create Booking
                    </button>
                </div>
            </form>
        </div>
    </Modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useBookingStore } from '@/stores/bookingStore';
import Modal from './Modal.vue';

const props = defineProps({
    show: Boolean
});

const emit = defineEmits(['close', 'created']);
const store = useBookingStore();
const rooms = computed(() => store.rooms);
const isSubmitting = ref(false);

const form = ref({
    guest_name: '',
    room_id: '',
    check_in: '',
    check_out: ''
});

const handleSubmit = async () => {
    if (new Date(form.value.check_out) <= new Date(form.value.check_in)) {
        alert('Check-out date must be after check-in date');
        return;
    }

    try {
        isSubmitting.value = true;
        const booking = await store.createBooking(form.value);
        emit('created', booking);
        emit('close');
        form.value = {
            guest_name: '',
            room_id: '',
            check_in: '',
            check_out: ''
        };
    } catch (error) {
        if (error.response?.data?.message) {
            alert(error.response.data.message);
        } else {
            alert('An error occurred while creating the booking');
        }
    } finally {
        isSubmitting.value = false;
    }
};
</script>