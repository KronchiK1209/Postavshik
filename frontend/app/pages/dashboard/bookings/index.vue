<template>
  <div class="page fade-in">
    <header class="page-header glass-panel">
      <div>
        <h1>Мои заявки</h1>
        <p>Следите за статусом заявок и отменяйте ненужные слоты в пару кликов.</p>
      </div>
      <button class="cta" @click="navigateTo('/dashboard/bookings/new')">Новая заявка</button>
    </header>

    <section class="glass-panel filters">
      <div class="filter-group">
        <label>Статус</label>
        <select v-model="statusFilter">
          <option value="all">Все</option>
          <option value="pending">На подтверждении</option>
          <option value="approved">Подтверждённые</option>
          <option value="cancelled">Отменённые</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Дата</label>
        <input type="date" v-model="dateFilter" />
      </div>
      <button class="ghost" @click="resetFilters">Сбросить</button>
    </section>

    <BookingsTable
      title="Заявки"
      subtitle="Нажмите на строку, чтобы посмотреть детали."
      :bookings="filteredBookings"
      @select="selectBooking"
    >
      <template #actions>
        <button class="ghost" @click="refresh">Обновить</button>
      </template>
    </BookingsTable>

    <AppModal v-if="selected" :open="true" title="Заявка" @close="selected = null">
      <template v-if="selected">
        <p><strong>Дата:</strong> {{ formatDate(selected.timeslot.startAt) }}</p>
        <p>
          <strong>Время:</strong>
          {{ formatTime(selected.timeslot.startAt) }} — {{ formatTime(selected.timeslot.endAt) }}
        </p>
        <p><strong>Док:</strong> {{ selected.timeslot.dockId }}</p>
        <p><strong>Транспорт:</strong> {{ selected.vehicle.numberPlate }}</p>
        <p><strong>Статус:</strong> {{ statusLabel(selected.status) }}</p>
        <p><strong>Комментарий:</strong> {{ selected.comment || '—' }}</p>
      </template>
      <template #footer>
        <button class="ghost" @click="selected = null">Закрыть</button>
        <button
          v-if="selected?.status !== 'cancelled'"
          class="cta"
          @click="cancel(selected.id)"
        >
          Отменить заявку
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import BookingsTable from '~/components/BookingsTable.vue';
import AppModal from '~/components/AppModal.vue';
import type { BookingDto } from '~/types/api';
import { useApiFetch } from '~/composables/useApiFetch';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true,
});

const auth = useAuthStore();
await auth.hydrate();

const statusFilter = ref<'all' | BookingDto['status']>('all');
const dateFilter = ref('');

const { data, refresh } = await useAsyncData('bookings-list', () => useApiFetch<BookingDto[]>('/bookings/my'));

const bookings = computed(() => data.value ?? []);

const filteredBookings = computed(() => {
  return bookings.value.filter((booking) => {
    const matchesStatus = statusFilter.value === 'all' || booking.status === statusFilter.value;
    const matchesDate = !dateFilter.value || dayjs(booking.timeslot.startAt).isSame(dayjs(dateFilter.value), 'day');
    return matchesStatus && matchesDate;
  });
});

const selected = ref<BookingDto | null>(null);

function selectBooking(booking: BookingDto) {
  selected.value = booking;
}

function resetFilters() {
  statusFilter.value = 'all';
  dateFilter.value = '';
}

function formatDate(value: string) {
  return dayjs(value).format('DD MMMM YYYY');
}

function formatTime(value: string) {
  return dayjs(value).format('HH:mm');
}

function statusLabel(status: BookingDto['status']) {
  switch (status) {
    case 'approved':
      return 'Подтверждена';
    case 'cancelled':
      return 'Отменена';
    default:
      return 'На подтверждении';
  }
}

async function cancel(id: number) {
  try {
    await useApiFetch(`/bookings/${id}`, { method: 'DELETE' });
    selected.value = null;
    await refresh();
  } catch (error: any) {
    console.error(error);
  }
}
</script>

<style scoped>
.page {
  display: grid;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: clamp(24px, 3vw, 36px);
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: clamp(28px, 4vw, 36px);
}

.page-header p {
  margin: 0;
  color: var(--text-muted);
}

.filters {
  display: flex;
  gap: 18px;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 20px clamp(20px, 3vw, 32px);
}

.filter-group {
  display: grid;
  gap: 6px;
}

label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

select,
input[type='date'] {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.6);
  color: #fff;
}

select:focus,
input[type='date']:focus {
  outline: none;
  border-color: rgba(56, 189, 248, 0.5);
}
</style>
