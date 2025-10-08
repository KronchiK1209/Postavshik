<template>
  <div class="page fade-in">
    <header class="page-header glass-panel">
      <div>
        <h1>Новая заявка</h1>
        <p>Выберите доступный слот и заполните данные транспортного средства.</p>
      </div>
      <button class="ghost" @click="navigateTo('/dashboard/bookings')">Мои заявки</button>
    </header>

    <section class="layout">
      <TimeslotMatrix
        v-if="docks.length"
        v-model="selectedDate"
        :timeslots="timeslots"
        :bookings="bookings"
        :docks="docks"
        @select="selectSlot"
        @busy="busySlot = $event"
      />

      <form class="glass-panel form" @submit.prevent="submit">
        <h2>Данные заявки</h2>
        <div v-if="selectedSlot" class="slot-summary">
          <p>
            <strong>Выбранный слот:</strong>
            {{ formatDate(selectedSlot.startAt) }}, {{ formatTime(selectedSlot.startAt) }} —
            {{ formatTime(selectedSlot.endAt) }}, док #{{ selectedSlot.dockId }}
          </p>
        </div>
        <div v-else class="slot-summary warning">
          <p>Выберите свободный слот в календаре, чтобы продолжить.</p>
        </div>

        <label>Госномер</label>
        <input v-model="vehicle.numberPlate" type="text" placeholder="AA-123-BB" required />

        <label>Тип кузова</label>
        <input v-model="vehicle.type" type="text" placeholder="тент / реф / фургон" />

        <label>Грузоподъёмность, т</label>
        <input v-model.number="vehicle.capacity" type="number" min="0" step="0.1" />

        <label>Комментарий</label>
        <textarea v-model="comment" rows="3" placeholder="Особые условия, требования к разгрузке" />

        <button class="cta" type="submit" :disabled="submitting || !selectedSlot">
          <span v-if="submitting">Создаём заявку...</span>
          <span v-else>Забронировать слот</span>
        </button>
      </form>
    </section>

    <AppModal v-if="busySlot" :open="true" title="Слот занят" @close="busySlot = null">
      <template v-if="busySlot">
        <p>Выбранный слот уже занят. Попробуйте другое время или док.</p>
      </template>
      <template #footer>
        <button class="cta" @click="busySlot = null">Понятно</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';
import TimeslotMatrix from '~/components/TimeslotMatrix.vue';
import AppModal from '~/components/AppModal.vue';
import type { BookingDto, TimeslotSummaryDto } from '~/types/api';
import { useApiFetch } from '~/composables/useApiFetch';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true,
});

const auth = useAuthStore();
await auth.hydrate();

const route = useRoute();
const selectedDate = ref((route.query.date as string) || dayjs().format('YYYY-MM-DD'));
const selectedSlot = ref<TimeslotSummaryDto | null>(null);
const busySlot = ref<TimeslotSummaryDto | null>(null);
const submitting = ref(false);
const vehicle = ref({ numberPlate: '', type: '', capacity: null as number | null });
const comment = ref('');

const { data: bookingsData, refresh: refreshBookings } = await useAsyncData('booking-form-my', () =>
  useApiFetch<BookingDto[]>('/bookings/my'),
);

const { data: docksData } = await useAsyncData('booking-form-docks', () => useApiFetch<{ id: number; title: string }[]>('/docks'));

const { data: timeslotsData, refresh: refreshTimeslots } = await useAsyncData(
  'booking-form-timeslots',
  () => useApiFetch<TimeslotSummaryDto[]>(`/timeslots?date=${selectedDate.value}`),
  { watch: [selectedDate] },
);

const bookings = computed(() => bookingsData.value ?? []);
const docks = computed(() => docksData.value ?? []);
const timeslots = computed(() => timeslotsData.value ?? []);

watch(
  () => route.query.timeslotId,
  (id) => {
    if (!id) return;
    const slot = timeslots.value.find((item) => item.id === Number(id));
    if (slot) {
      selectedSlot.value = slot;
    }
  },
  { immediate: true },
);

function selectSlot(slot: TimeslotSummaryDto) {
  selectedSlot.value = slot;
}

function formatDate(value: string) {
  return dayjs(value).format('DD MMMM YYYY');
}

function formatTime(value: string) {
  return dayjs(value).format('HH:mm');
}

async function submit() {
  if (!selectedSlot.value) return;
  submitting.value = true;
  try {
    await useApiFetch('/bookings', {
      method: 'POST',
      body: {
        timeslotId: selectedSlot.value.id,
        comment: comment.value,
        vehicle: {
          numberPlate: vehicle.value.numberPlate,
          type: vehicle.value.type,
          capacity: vehicle.value.capacity ?? undefined,
        },
      },
    });
    await Promise.all([refreshBookings(), refreshTimeslots()]);
    navigateTo('/dashboard/bookings');
  } catch (error: any) {
    console.error(error);
  } finally {
    submitting.value = false;
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
  align-items: center;
  gap: 16px;
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

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 24px;
}

.form {
  display: grid;
  gap: 16px;
  padding: clamp(24px, 3vw, 36px);
}

.form h2 {
  margin: 0;
}

.slot-summary {
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(56, 189, 248, 0.12);
  color: #e0f2ff;
}

.slot-summary.warning {
  background: rgba(248, 113, 113, 0.12);
  color: #fecaca;
}

label {
  font-size: 14px;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.6);
  color: #fff;
}

textarea {
  resize: vertical;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.18);
}

button.cta[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
