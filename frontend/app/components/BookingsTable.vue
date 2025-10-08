<template>
  <div class="bookings-table glass-panel">
    <header>
      <div>
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </header>
    <table class="table-grid">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Время</th>
          <th>Док</th>
          <th>Транспорт</th>
          <th>Статус</th>
          <th>Комментарий</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="bookings.length === 0">
          <td colspan="6">Нет записей</td>
        </tr>
        <tr v-for="booking in bookings" :key="booking.id" @click="$emit('select', booking)">
          <td>{{ formatDate(booking.timeslot.startAt) }}</td>
          <td>{{ formatTime(booking.timeslot.startAt) }} — {{ formatTime(booking.timeslot.endAt) }}</td>
          <td>{{ booking.timeslot.dockId }}</td>
          <td>
            <strong>{{ booking.vehicle.numberPlate }}</strong>
            <div class="vehicle-meta">{{ booking.vehicle.type || 'не указан' }}</div>
          </td>
          <td>
            <StatusPill :status="booking.status">
              {{ statusLabel(booking.status) }}
            </StatusPill>
          </td>
          <td>{{ booking.comment || '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import StatusPill from '~/components/StatusPill.vue';
import type { BookingDto } from '~/types/api';

const props = defineProps<{ title: string; subtitle: string; bookings: BookingDto[] }>();

defineEmits<{ (e: 'select', booking: BookingDto): void }>();

const statusMap = {
  pending: 'На подтверждении',
  approved: 'Подтверждена',
  cancelled: 'Отменена',
};

function statusLabel(status: BookingDto['status']) {
  return statusMap[status];
}

function formatDate(value: string) {
  return dayjs(value).format('DD MMMM YYYY');
}

function formatTime(value: string) {
  return dayjs(value).format('HH:mm');
}
</script>

<style scoped>
.bookings-table {
  padding: clamp(24px, 3vw, 36px);
  display: grid;
  gap: 18px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

header h3 {
  margin: 0;
  font-size: 22px;
}

header p {
  margin: 4px 0 0;
  color: var(--text-muted);
}

tbody tr {
  cursor: pointer;
  transition: background 0.2s ease;
}

tbody tr:hover td {
  background: rgba(148, 163, 184, 0.06);
}

.vehicle-meta {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
