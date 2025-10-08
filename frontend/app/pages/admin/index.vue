<template>
  <div class="admin-page fade-in">
    <header class="page-header glass-panel">
      <div>
        <h1>Админ-панель</h1>
        <p>Утверждайте заявки, управляйте слотовыми расписаниями и следите за загрузкой доков.</p>
      </div>
      <button class="ghost" @click="refresh">Обновить</button>
    </header>

    <section class="grid">
      <BookingsTable
        title="Все заявки"
        subtitle="Доступно только администраторам"
        :bookings="bookings"
        @select="selectBooking"
      >
        <template #actions>
          <button class="ghost" @click="refresh">Обновить</button>
        </template>
      </BookingsTable>

      <div class="glass-panel actions">
        <h2>Генерация слотов</h2>
        <p>Создайте расписание слотов на несколько дней вперёд. Текущие слоты сохраняются.</p>
        <label>Дата начала</label>
        <input type="date" v-model="generateForm.start" />
        <label>Количество дней</label>
        <input type="number" min="1" max="60" v-model.number="generateForm.days" />
        <button class="cta" @click="generate">Сгенерировать</button>
      </div>
    </section>

    <AppModal v-if="selected" :open="true" title="Управление заявкой" @close="selected = null">
      <template v-if="selected">
        <p><strong>Поставщик:</strong> {{ selected.supplier.title }}</p>
        <p>
          <strong>Время:</strong>
          {{ formatDate(selected.timeslot.startAt) }} · {{ formatTime(selected.timeslot.startAt) }} —
          {{ formatTime(selected.timeslot.endAt) }}
        </p>
        <p><strong>Транспорт:</strong> {{ selected.vehicle.numberPlate }}</p>
        <p><strong>Статус:</strong> {{ statusLabel(selected.status) }}</p>
      </template>
      <template #footer>
        <button class="ghost" @click="selected = null">Закрыть</button>
        <button class="ghost" @click="updateStatus(selected?.id, 'cancelled')">Отменить</button>
        <button class="cta" @click="updateStatus(selected?.id, 'approved')">Подтвердить</button>
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
  roles: ['admin'],
});

const auth = useAuthStore();
await auth.hydrate();

const { data, refresh } = await useAsyncData('admin-bookings', () => useApiFetch<BookingDto[]>('/admin/bookings'));

const bookings = computed(() => data.value ?? []);
const selected = ref<BookingDto | null>(null);
const generateForm = ref({ start: dayjs().format('YYYY-MM-DD'), days: 14 });

function selectBooking(booking: BookingDto) {
  selected.value = booking;
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

async function updateStatus(id?: number, status?: BookingDto['status']) {
  if (!id || !status) return;
  await useApiFetch(`/admin/bookings/${id}/${status === 'approved' ? 'approve' : 'cancel'}`, { method: 'POST' });
  selected.value = null;
  await refresh();
}

async function generate() {
  await useApiFetch('/admin/timeslots/generate', {
    method: 'POST',
    body: {
      start: generateForm.value.start,
      days: generateForm.value.days,
    },
  });
  await refresh();
}
</script>

<style scoped>
.admin-page {
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

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
  gap: 24px;
}

.actions {
  display: grid;
  gap: 12px;
  padding: clamp(24px, 3vw, 36px);
}

.actions h2 {
  margin: 0;
}

label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

input[type='date'],
input[type='number'] {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.6);
  color: #fff;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
