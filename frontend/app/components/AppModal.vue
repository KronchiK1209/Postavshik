<template>
  <Transition appear name="modal">
    <Dialog v-if="open" class="modal" @close="$emit('close')">
      <div class="backdrop" aria-hidden="true" />
      <div class="container">
        <DialogPanel class="panel glass-panel">
          <header class="panel-header">
            <DialogTitle class="panel-title">{{ title }}</DialogTitle>
            <button class="close" @click="$emit('close')">×</button>
          </header>
          <div class="panel-body">
            <slot />
          </div>
          <footer class="panel-footer">
            <slot name="footer">
              <button class="ghost" @click="$emit('close')">Закрыть</button>
            </slot>
          </footer>
        </DialogPanel>
      </div>
    </Dialog>
  </Transition>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';

defineProps<{ open: boolean; title: string }>();

defineEmits<{ (e: 'close'): void }>();
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(8px);
}

.container {
  position: relative;
  margin: auto;
  width: min(560px, 92vw);
}

.panel {
  padding: 28px;
  display: grid;
  gap: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: 22px;
  font-weight: 700;
}

.close {
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
}

.panel-body {
  color: var(--text-muted);
  display: grid;
  gap: 12px;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
