import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useBookingStore = defineStore('booking', () => {
    const rooms = ref([]);
    const bookings = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const selectedDateRange = ref({
        start: new Date(),
        end: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000), // 14 days from now
    });

    const fetchRooms = async () => {
        try {
            loading.value = true;
            error.value = null;
            const response = await axios.get('/api/rooms');
            rooms.value = response.data;
        } catch (err) {
            error.value = 'Failed to fetch rooms';
            console.error('Error fetching rooms:', err);
        } finally {
            loading.value = false;
        }
    };

    const fetchBookings = async () => {
        try {
            loading.value = true;
            error.value = null;
            const response = await axios.get('/api/bookings');
            bookings.value = response.data;
        } catch (err) {
            error.value = 'Failed to fetch bookings';
            console.error('Error fetching bookings:', err);
        } finally {
            loading.value = false;
        }
    };

    const updateBookingOptimistically = (bookingId, updates) => {
        const index = bookings.value.findIndex(b => b.id == bookingId);

        if (index !== -1) {
            // Save original booking for rollback if needed
            const originalBooking = { ...bookings.value[index] };
            
            // Update immediately for optimistic UI
            bookings.value[index] = {
                ...bookings.value[index],
                ...updates
            };
            
            return originalBooking;
        }
        console.warn(`Booking with ID ${bookingId} not found for optimistic update`);
        return null;
    };

    const createBooking = async (bookingData) => {
        try {
            loading.value = true;
            error.value = null;
            const response = await axios.post('/api/bookings', bookingData);
            bookings.value.push(response.data);
            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to create booking';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateBooking = async (bookingId, updates) => {
        const originalBooking = updateBookingOptimistically(bookingId, updates);
        
        try {
            loading.value = true;
            error.value = null;
            const response = await axios.put(`/api/bookings/${bookingId}`, updates);
            
            // Update with server response data to ensure consistency
            const index = bookings.value.findIndex(b => b.id == bookingId);
            if (index !== -1) {
                bookings.value[index] = response.data;
            }
            
            return response.data;
        } catch (err) {
            // Rollback on error
            if (originalBooking) {
                const index = bookings.value.findIndex(b => b.id == bookingId);
                if (index !== -1) {
                    bookings.value[index] = originalBooking;
                }
            }
            error.value = err.response?.data?.message || 'Failed to update booking';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const deleteBooking = async (bookingId) => {
        try {
            loading.value = true;
            error.value = null;
            await axios.delete(`/api/bookings/${bookingId}`);
            bookings.value = bookings.value.filter(b => b.id !== bookingId);
        } catch (err) {
            error.value = 'Failed to delete booking';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Computed property for bookings grouped by room
    const bookingsByRoom = computed(() => {
        const grouped = {};
        bookings.value.forEach(booking => {
            if (!grouped[booking.room_id]) {
                grouped[booking.room_id] = [];
            }
            grouped[booking.room_id].push(booking);
        });
        return grouped;
    });

    return {
        rooms,
        bookings,
        bookingsByRoom,
        loading,
        error,
        selectedDateRange,
        fetchRooms,
        fetchBookings,
        createBooking,
        updateBooking,
        deleteBooking,
    };
});