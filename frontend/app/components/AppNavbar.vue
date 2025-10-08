<template>
  <header class="navbar glass-panel fade-in">
    <NuxtLink to="/" class="brand">
      <span class="logo">🚚</span>
      <div class="brand-text">
        <strong>DockFlow</strong>
        <small>портал поставщика</small>
      </div>
    </NuxtLink>

    <nav class="nav-links" aria-label="Основная навигация">
      <NuxtLink to="/" class="nav-link" :class="{ active: isActive('/') }">Главная</NuxtLink>
      <NuxtLink to="/dashboard" class="nav-link" :class="{ active: isActive('/dashboard') }">Дашборд</NuxtLink>
      <NuxtLink
        v-if="isAdmin"
        to="/admin"
        class="nav-link"
        :class="{ active: isActive('/admin') }"
      >
        Админ</NuxtLink>
    </nav>

    <div class="nav-actions">
      <button v-if="!isAuthenticated" class="ghost" @click="navigateTo('/auth/login')">Войти</button>
      <button v-if="!isAuthenticated" class="cta" @click="navigateTo('/auth/register')">Регистрация</button>

      <Menu v-else as="div" class="profile-menu">
        <MenuButton class="profile-button">
          <div class="avatar">{{ initials }}</div>
          <div class="profile-info">
            <span>{{ user?.username }}</span>
            <small>{{ supplier?.title || 'Администратор' }}</small>
          </div>
          <ChevronDownIcon class="icon" />
        </MenuButton>
        <Transition
          enter-active-class="menu-enter"
          leave-active-class="menu-leave"
          enter-from-class="menu-from"
          leave-to-class="menu-from"
        >
          <MenuItems class="menu-items">
            <MenuItem v-slot="{ active }">
              <NuxtLink class="menu-link" :class="{ active }" to="/dashboard">Мой профиль</NuxtLink>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <NuxtLink class="menu-link" :class="{ active }" to="/dashboard/bookings">Мои заявки</NuxtLink>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <button class="menu-link" :class="{ active }" @click="handleLogout">Выйти</button>
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, Transition } from 'vue';
import { useRoute } from '#imports';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const auth = useAuthStore();
const { user, supplier, isAuthenticated, isAdmin } = storeToRefs(auth);

const initials = computed(() => (user.value?.username ?? '?').slice(0, 2).toUpperCase());

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`);
}

async function handleLogout() {
  await auth.logout();
  await navigateTo('/');
}
</script>

<style scoped>
.navbar {
  margin: 24px clamp(16px, 4vw, 64px) 0;
  padding: 18px clamp(16px, 4vw, 32px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  position: sticky;
  top: 16px;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 18px;
  font-weight: 700;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-text small {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.logo {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(148, 163, 184, 0.16);
  font-size: 24px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.28);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 18px;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #fff;
  background: rgba(56, 189, 248, 0.18);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

button.ghost {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #fff;
  border-radius: 999px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

button.ghost:hover {
  background: rgba(148, 163, 184, 0.16);
}

.profile-menu {
  position: relative;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  background: rgba(15, 23, 42, 0.55);
  padding: 10px 14px;
  border-radius: 16px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.profile-button:hover {
  transform: translateY(-1px);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.6), rgba(139, 92, 246, 0.6));
  font-weight: 700;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.profile-info span {
  font-size: 14px;
  font-weight: 600;
}

.profile-info small {
  font-size: 12px;
  color: var(--text-muted);
}

.icon {
  width: 20px;
  height: 20px;
  color: var(--text-muted);
}

.menu-items {
  position: absolute;
  right: 0;
  margin-top: 12px;
  background: rgba(15, 23, 42, 0.92);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 8px;
  min-width: 220px;
  box-shadow: 0 24px 36px rgba(15, 23, 42, 0.35);
  display: grid;
  gap: 6px;
}

.menu-link {
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border-radius: 12px;
  color: #e2e8f0;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
}

.menu-link.active,
.menu-link:hover {
  background: rgba(56, 189, 248, 0.16);
  color: #fff;
}

.menu-enter {
  transition: all 0.2s ease;
}

.menu-leave {
  transition: all 0.15s ease;
}

.menu-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

@media (max-width: 1024px) {
  .nav-links {
    display: none;
  }
}

@media (max-width: 768px) {
  .navbar {
    margin: 16px;
    padding: 14px 18px;
  }

  .nav-actions {
    gap: 10px;
  }

  button.cta {
    padding: 10px 18px;
  }
}
</style>
