<template>
  <div class="matrix glass-panel">
    <header class="matrix-header">
      <div class="header-info">
        <h3>Матрица доступных слотов</h3>
        <p>Выберите дату и кликните по свободной ячейке, чтобы забронировать слот.</p>
      </div>
      <input type="date" :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    </header>

    <div class="legend">
      <span><span class="legend-dot available" /> свободно</span>
      <span><span class="legend-dot busy" /> занято</span>
      <span><span class="legend-dot mine" /> моя бронь</span>
    </div>

    <div class="matrix-grid">
      <div class="times">
        <span v-for="slotTime in timeSlots" :key="slotTime">{{ slotTime }}</span>
      </div>
      <div class="columns">
        <div v-for="dock in docks" :key="dock.id" class="column">
          <h4>{{ dock.title }}</h4>
          <button
            v-for="slot in slotsByDock[dock.id] || []"
            :key="slot.id"
            :class="['slot', { full: slot.isFull, mine: isMine(slot.id) }]"
            @click="handleSelect(slot)"
          >
            <span class="slot-time">{{ formatTime(slot.startAt) }}</span>
            <span class="slot-capacity">{{ slot.availableCapacity }}/{{ slot.capacity }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import type { TimeslotSummaryDto, BookingDto } from '~/types/api';

const props = defineProps<{
  modelValue: string;
  timeslots: TimeslotSummaryDto[];
  bookings: BookingDto[];
  docks: { id: number; title: string }[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', slot: TimeslotSummaryDto): void;
  (e: 'busy', slot: TimeslotSummaryDto): void;
}>();

const timeSlots = computed(() => {
  const unique = new Set<string>();
  props.timeslots.forEach((slot) => {
    unique.add(formatTime(slot.startAt));
  });
  return Array.from(unique).sort();
});

const slotsByDock = computed(() => {
  const grouped: Record<number, TimeslotSummaryDto[]> = {};
  props.timeslots.forEach((slot) => {
    if (!grouped[slot.dockId]) grouped[slot.dockId] = [];
    grouped[slot.dockId].push(slot);
  });
  Object.values(grouped).forEach((list) =>
    list.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
  );
  return grouped;
});

const myBookingIds = computed(() => new Set(props.bookings.map((booking) => booking.timeslotId)));

function isMine(timeslotId: number) {
  return myBookingIds.value.has(timeslotId);
}

function formatTime(value: string) {
  return dayjs(value).format('HH:mm');
}

function handleSelect(slot: TimeslotSummaryDto) {
  if (slot.isFull && !isMine(slot.id)) {
    emit('busy', slot);
    return;
  }
  emit('select', slot);
}
</script>

<style scoped>
.matrix {
  display: grid;
  gap: 24px;
  padding: clamp(24px, 3vw, 36px);
}

.matrix-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.header-info h3 {
  margin: 0;
  font-size: 22px;
}

.header-info p {
  margin: 4px 0 0;
  color: var(--text-muted);
}

input[type='date'] {
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.7);
  color: #fff;
}

.legend {
  display: flex;
  gap: 16px;
  color: var(--text-muted);
  font-size: 14px;
  flex-wrap: wrap;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
  margin-right: 6px;
}

.legend-dot.available {
  background: rgba(34, 197, 94, 0.8);
}

.legend-dot.busy {
  background: rgba(248, 113, 113, 0.8);
}

.legend-dot.mine {
  background: rgba(59, 130, 246, 0.8);
}

.matrix-grid {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 18px;
}

.times {
  display: grid;
  gap: 12px;
  color: var(--text-muted);
  font-size: 14px;
}

.columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.column {
  display: grid;
  gap: 12px;
}

.column h4 {
  margin: 0;
  font-size: 16px;
}

.slot {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.6);
  color: inherit;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.slot:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.45);
}

.slot.full {
  border-color: rgba(248, 113, 113, 0.4);
  opacity: 0.6;
}

.slot.mine {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.slot-time {
  font-weight: 600;
}

.slot-capacity {
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .matrix-grid {
    grid-template-columns: 1fr;
  }

  .times {
    display: none;
  }
}
</style>
