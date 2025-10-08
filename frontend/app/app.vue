<template>
  <div class="app-shell">
    <div class="aurora aurora--primary" />
    <div class="aurora aurora--secondary" />
    <NuxtLoadingIndicator color="var(--primary)" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  background: var(--bg-gradient);
}

.aurora {
  position: absolute;
  filter: blur(120px);
  opacity: 0.45;
  transform: translate(-50%, -50%);
  pointer-events: none;
  mix-blend-mode: screen;
  animation: float 12s ease-in-out infinite;
}

.aurora--primary {
  top: 20%;
  left: 30%;
  width: 38vw;
  height: 38vw;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.8), transparent 70%);
}

.aurora--secondary {
  top: 70%;
  left: 70%;
  width: 40vw;
  height: 40vw;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.7), transparent 70%);
  animation-delay: -4s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-48%, -52%) scale(1.05);
  }
}
</style>
