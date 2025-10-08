<template>
  <div class="dashboard fade-in">
    <section class="welcome glass-panel">
      <div>
        <h1>Добро пожаловать, {{ auth.user?.username }}!</h1>
        <p v-if="auth.supplier">
          Компания <strong>{{ auth.supplier.title }}</strong> активно участвует в расписании. Проверьте ближайшие брони и
          доступные окна на сегодня.
        </p>
        <p v-else>Вы вошли как администратор. Управляйте расписанием и заявками в админ-панели.</p>
      </div>
      <div class="welcome-actions">
        <button class="cta" @click="navigateTo('/dashboard/bookings/new')">Новая заявка</button>
        <button class="ghost" @click="refreshData">Обновить данные</button>
      </div>
    </section>

    <section class="stats-grid">
      <DashboardStatCard
        label="Активных заявок"
        :value="bookings.length.toString()"
        description="Заявки со статусом pending или approved"
      >
        <template #icon>📦</template>
      </DashboardStatCard>
      <DashboardStatCard
        label="Подтверждено"
        :value="approvedCount.toString()"
        description="Подтверждённые слоты на ближайшие дни"
        tone="green"
      >
        <template #icon>✅</template>
      </DashboardStatCard>
      <DashboardStatCard
        label="Свободных сегодня"
        :value="availableToday.toString()"
        description="Слоты с доступной вместимостью"
        tone="blue"
      >
        <template #icon>🕒</template>
      </DashboardStatCard>
    </section>

    <section class="grid">
      <BookingsTable
        title="Ближайшие заявки"
        subtitle="Дважды кликните по записи, чтобы открыть детали"
        :bookings="upcomingBookings"
        @select="openBookingModal"
      >
        <template #actions>
          <button class="ghost" @click="navigateTo('/dashboard/bookings')">Все заявки</button>
        </template>
      </BookingsTable>

      <TimeslotMatrix
        v-if="docks.length"
        v-model="selectedDate"
        :timeslots="timeslots"
        :bookings="bookings"
        :docks="docks"
        @select="openTimeslotModal"
        @busy="openBusyModal"
      />
    </section>

    <AppModal v-if="showBooking" :open="true" title="Детали заявки" @close="showBooking = null">
      <template v-if="showBooking">
        <p>
          <strong>Время:</strong>
          {{ formatDate(showBooking.timeslot.startAt) }} ·
          {{ formatTime(showBooking.timeslot.startAt) }} — {{ formatTime(showBooking.timeslot.endAt) }}
        </p>
        <p><strong>Док:</strong> {{ showBooking.timeslot.dockId }}</p>
        <p><strong>Транспорт:</strong> {{ showBooking.vehicle.numberPlate }} ({{ showBooking.vehicle.type || 'не указано' }})</p>
        <p><strong>Статус:</strong> {{ statusLabel(showBooking.status) }}</p>
        <p><strong>Комментарий:</strong> {{ showBooking.comment || '—' }}</p>
      </template>
      <template #footer>
        <button class="ghost" @click="showBooking = null">Закрыть</button>
        <button v-if="showBooking?.status === 'pending'" class="cta" @click="navigateTo('/dashboard/bookings')">
          Управлять заявкой
        </button>
      </template>
    </AppModal>

    <AppModal
      v-if="showTimeslot"
      :open="true"
      title="Слот доступен"
      @close="showTimeslot = null"
    >
      <template v-if="showTimeslot">
        <p>
          Слот {{ formatTime(showTimeslot.startAt) }} — {{ formatTime(showTimeslot.endAt) }} в доке #
          {{ showTimeslot.dockId }} свободен.
        </p>
        <p>Вместимость: {{ showTimeslot.availableCapacity }} из {{ showTimeslot.capacity }}.</p>
        <p>Нажмите «Создать заявку», чтобы перейти к оформлению.</p>
      </template>
      <template #footer>
        <button class="ghost" @click="showTimeslot = null">Позже</button>
        <button class="cta" @click="goToBooking(showTimeslot?.id)">Создать заявку</button>
      </template>
    </AppModal>

    <AppModal
      v-if="busySlot"
      :open="true"
      title="Слот уже занят"
      @close="busySlot = null"
    >
      <template v-if="busySlot">
        <p>
          Слот {{ formatTime(busySlot.startAt) }} — {{ formatTime(busySlot.endAt) }} уже заполнен. Попробуйте выбрать
          другое время или док.
        </p>
        <ul>
          <li v-for="booking in busySlot.bookings" :key="booking.id">
            {{ booking.supplier.title }} · {{ statusLabel(booking.status) }}
          </li>
        </ul>
      </template>
      <template #footer>
        <button class="cta" @click="busySlot = null">Понятно</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import DashboardStatCard from '~/components/DashboardStatCard.vue';
import BookingsTable from '~/components/BookingsTable.vue';
import TimeslotMatrix from '~/components/TimeslotMatrix.vue';
import AppModal from '~/components/AppModal.vue';
import type { BookingDto, TimeslotSummaryDto } from '~/types/api';
import { useAuthStore } from '~/stores/auth';
import { useApiFetch } from '~/composables/useApiFetch';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true,
});

const auth = useAuthStore();
await auth.hydrate();

const selectedDate = ref(dayjs().format('YYYY-MM-DD'));

const { data: bookingsData, refresh: refreshBookings } = await useAsyncData('my-bookings', () =>
  useApiFetch<BookingDto[]>('/bookings/my'),
);

const { data: docksData } = await useAsyncData('docks', () => useApiFetch<{ id: number; title: string }[]>('/docks'));

const { data: timeslotsData, refresh: refreshTimeslots } = await useAsyncData(
  'timeslots-by-date',
  () => useApiFetch<TimeslotSummaryDto[]>(`/timeslots?date=${selectedDate.value}`),
  { watch: [selectedDate] },
);

const bookings = computed(() => bookingsData.value ?? []);
const docks = computed(() => docksData.value ?? []);
const timeslots = computed(() => timeslotsData.value ?? []);

const approvedCount = computed(
  () => bookings.value.filter((booking) => booking.status === 'approved').length,
);

const availableToday = computed(() =>
  timeslots.value.filter((slot) => !slot.isFull).length,
);

const upcomingBookings = computed(() =>
  bookings.value
    .filter((booking) => booking.status !== 'cancelled')
    .sort(
      (a, b) =>
        dayjs(a.timeslot.startAt).valueOf() - dayjs(b.timeslot.startAt).valueOf(),
    )
    .slice(0, 6),
);

const showBooking = ref<BookingDto | null>(null);
const showTimeslot = ref<TimeslotSummaryDto | null>(null);
const busySlot = ref<TimeslotSummaryDto | null>(null);

function openBookingModal(booking: BookingDto) {
  showBooking.value = booking;
}

function openTimeslotModal(slot: TimeslotSummaryDto) {
  showTimeslot.value = slot;
}

function openBusyModal(slot: TimeslotSummaryDto) {
  busySlot.value = slot;
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

async function refreshData() {
  await Promise.all([refreshBookings(), refreshTimeslots()]);
}

function goToBooking(timeslotId?: number | null) {
  if (!timeslotId) {
    navigateTo('/dashboard/bookings/new');
    return;
  }
  navigateTo({
    path: '/dashboard/bookings/new',
    query: { timeslotId: String(timeslotId), date: selectedDate.value },
  });
}
</script>

<style scoped>
.dashboard {
  display: grid;
  gap: 32px;
}

.welcome {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  align-items: center;
  padding: clamp(24px, 3vw, 36px);
}

.welcome h1 {
  margin: 0 0 8px;
  font-size: clamp(28px, 4vw, 36px);
}

.welcome p {
  margin: 0;
  color: var(--text-muted);
}

.welcome-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
