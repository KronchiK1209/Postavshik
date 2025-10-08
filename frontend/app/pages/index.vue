<template>
  <div class="landing">
    <section class="hero glass-panel">
      <div class="hero-content">
        <span class="badge">MVP демо</span>
        <h1>Управляйте окнами разгрузки в одном окне</h1>
        <p>
          DockFlow помогает поставщикам и команде склада синхронно планировать поставки, контролировать загрузку доков
          и сокращать простои транспорта.
        </p>
        <div class="actions">
          <button class="cta" @click="navigateTo('/auth/register')">Зарегистрироваться</button>
          <button class="ghost" @click="navigateTo('/auth/login')">У меня есть аккаунт</button>
        </div>
        <ul class="highlights">
          <li><CheckIcon /> Бронирование слотов в 2 клика</li>
          <li><CheckIcon /> Мгновенные уведомления и статус заявок</li>
          <li><CheckIcon /> Мини-аналитика по загрузке доков</li>
        </ul>
      </div>
      <div class="hero-preview">
        <div class="preview-card">
          <header>
            <span>Ближайшие поставки</span>
            <SparklesIcon />
          </header>
          <ul>
            <li v-for="slot in demoSlots" :key="slot.id">
              <div>
                <strong>{{ slot.supplier }}</strong>
                <small>{{ slot.dock }}</small>
              </div>
              <span>{{ slot.time }}</span>
            </li>
          </ul>
          <footer>
            <span>Свободных слотов сегодня: <strong>5</strong></span>
            <button class="ghost" @click="navigateTo('/dashboard/bookings/new')">Забронировать</button>
          </footer>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="feature glass-panel" v-for="feature in features" :key="feature.title">
        <div class="icon">{{ feature.icon }}</div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
        <ul>
          <li v-for="item in feature.points" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="cta-section glass-panel">
      <h2>Готовы вывести логистику на новый уровень?</h2>
      <p>
        Настройте расписание разгрузки, приглашайте коллег и управляйте потоком поставок из единого окна. С демоданными
        можно экспериментировать без ограничений.
      </p>
      <div class="actions">
        <button class="cta" @click="navigateTo('/auth/register')">Начать работу</button>
        <button class="ghost" @click="navigateTo('/dashboard')">Посмотреть дашборд</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon, SparklesIcon } from '@heroicons/vue/24/solid';

const demoSlots = [
  { id: 1, supplier: 'FreshMarket B.V.', dock: 'Док #1', time: '10:00 — 10:30' },
  { id: 2, supplier: 'Nordic Fruits', dock: 'Док #2', time: '11:00 — 11:30' },
  { id: 3, supplier: 'LogiTrans NL', dock: 'Док #1', time: '13:30 — 14:00' },
];

const features = [
  {
    icon: '📅',
    title: 'Умный календарь',
    description: 'Интерактивная матрица слотов с подсветкой занятых времён.',
    points: ['Перетягивайте слоты мышкой', 'Мгновенная проверка ограничений', 'Совместный доступ для команды'],
  },
  {
    icon: '🛰️',
    title: 'Прозрачность статусов',
    description: 'Все заявки и их статусы — в одном месте для поставщиков и склада.',
    points: ['Цветовое кодирование статусов', 'История изменений', 'Уведомления для перевозчиков'],
  },
  {
    icon: '📊',
    title: 'Живая аналитика',
    description: 'Микродашборды по загрузке доков и эффективности поставок.',
    points: ['Пиковые часы и дельты', 'Прогноз доступности', 'Экспорт в CSV/Excel'],
  },
];
</script>

<style scoped>
.landing {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  padding: clamp(24px, 4vw, 48px);
  position: relative;
  overflow: hidden;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.12), transparent 50%);
  pointer-events: none;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
  z-index: 1;
}

.hero-content h1 {
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.1;
  margin: 0;
}

.hero-content p {
  margin: 0;
  color: var(--text-muted);
  font-size: 18px;
  max-width: 520px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

button.ghost {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: #fff;
  border-radius: 999px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

button.ghost:hover {
  background: rgba(148, 163, 184, 0.16);
}

.highlights {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 10px;
  color: var(--text-muted);
}

.highlights li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.highlights svg {
  width: 20px;
  height: 20px;
  color: var(--success);
}

.hero-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-card {
  width: min(360px, 90%);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 28px 40px rgba(15, 23, 42, 0.35);
}

.preview-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.preview-card header svg {
  width: 24px;
  height: 24px;
  color: var(--secondary);
}

.preview-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 16px;
}

.preview-card li {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-card li strong {
  display: block;
}

.preview-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-muted);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.feature {
  padding: 32px clamp(20px, 3vw, 32px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.feature .icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 24px;
  background: rgba(56, 189, 248, 0.16);
}

.feature ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
  color: var(--text-muted);
}

.cta-section {
  text-align: center;
  padding: clamp(32px, 5vw, 48px);
  display: grid;
  gap: 16px;
}

.cta-section h2 {
  font-size: clamp(28px, 3vw, 36px);
  margin: 0;
}

.cta-section p {
  margin: 0;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .hero {
    padding: 24px;
  }

  .preview-card {
    margin-top: 8px;
  }
}
</style>
