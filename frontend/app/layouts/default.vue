<template>
  <div class="layout">
    <AppNavbar />
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '~/components/AppNavbar.vue';
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1 1 auto;
  padding: 32px clamp(16px, 4vw, 64px) 64px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

@media (max-width: 768px) {
  .content {
    padding: 24px 16px 48px;
  }
}
</style>
