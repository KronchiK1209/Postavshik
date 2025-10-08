import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  const { isAuthenticated, isAdmin, initialized } = storeToRefs(auth);

  if (!initialized.value) {
    await auth.hydrate();
  }

  if (to.path.startsWith('/auth') && isAuthenticated.value) {
    return navigateTo('/dashboard');
  }

  const requiresAuth = Boolean(to.meta.requiresAuth);
  if (requiresAuth && !isAuthenticated.value) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } });
  }

  const requiredRoles = (to.meta.roles as string[] | undefined) ?? [];
  if (requiredRoles.length && !requiredRoles.some((role) => (role === 'admin' ? isAdmin.value : role === auth.user?.role))) {
    return navigateTo('/dashboard');
  }
});
