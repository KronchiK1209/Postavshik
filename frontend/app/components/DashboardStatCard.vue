<template>
  <article class="stat-card glass-panel">
    <header>
      <div class="icon" :style="{ background: iconBackground }">
        <slot name="icon" />
      </div>
      <span class="label">{{ label }}</span>
    </header>
    <div class="value">{{ value }}</div>
    <p class="description">{{ description }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ label: string; value: string; description: string; tone?: 'blue' | 'purple' | 'green' }>();

const iconBackground = computed(() => {
  switch (props.tone) {
    case 'green':
      return 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.4))';
    case 'purple':
      return 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.4))';
    default:
      return 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(56,189,248,0.4))';
  }
});
</script>

<style scoped>
.stat-card {
  padding: 24px;
  display: grid;
  gap: 12px;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 20px;
}

.label {
  color: var(--text-muted);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.value {
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 700;
}

.description {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
