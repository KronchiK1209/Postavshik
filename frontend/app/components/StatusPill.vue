<template>
  <span class="pill" :class="statusClass">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ status: 'pending' | 'approved' | 'cancelled' }>();

const statusClass = computed(() => {
  switch (props.status) {
    case 'approved':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'warning';
  }
});
</script>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.pill.success {
  background: rgba(52, 211, 153, 0.18);
  color: #34d399;
}

.pill.warning {
  background: rgba(250, 204, 21, 0.2);
  color: #facc15;
}

.pill.danger {
  background: rgba(248, 113, 113, 0.18);
  color: #f87171;
}
</style>
