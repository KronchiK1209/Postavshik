import { ref, computed } from 'vue';
import { useApiFetch } from '~/composables/useApiFetch';
import type { AuthSessionDto, PortalUser, ProfileResponseDto, SupplierDto } from '~/types/api';

type LoginPayload = {
  identifier: string;
  password: string;
};

type RegisterPayload = {
  supplierTitle: string;
  inn?: string;
  kpp?: string;
  address?: string;
  email: string;
  phone?: string;
  username: string;
  accountEmail: string;
  accountPhone?: string;
  password: string;
  acceptTerms: boolean;
};

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PortalUser | null>(null);
  const supplier = ref<SupplierDto | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value));
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setSession(session: AuthSessionDto | ProfileResponseDto | null) {
    if (!session) {
      user.value = null;
      supplier.value = null;
      return;
    }

    if ('user' in session) {
      user.value = session.user;
      supplier.value = session.supplier;
    } else {
      user.value = {
        id: session.id,
        username: session.username,
        email: session.email,
        role: session.role,
        supplierId: session.supplier?.id ?? null,
      };
      supplier.value = session.supplier ?? null;
    }
  }

  async function hydrate() {
    if (initialized.value) {
      return;
    }
    try {
      loading.value = true;
      const profile = await useApiFetch<ProfileResponseDto>('/me');
      setSession(profile);
    } catch (error) {
      setSession(null);
    } finally {
      initialized.value = true;
      loading.value = false;
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true;
    try {
      const session = await useApiFetch<AuthSessionDto>('/auth/login', {
        method: 'POST',
        body: payload,
      });
      setSession(session);
      return session;
    } finally {
      loading.value = false;
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true;
    try {
      const session = await useApiFetch<AuthSessionDto>('/auth/register', {
        method: 'POST',
        body: payload,
      });
      setSession(session);
      return session;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    await useApiFetch('/auth/logout', { method: 'POST' });
    setSession(null);
    initialized.value = false;
  }

  return {
    user,
    supplier,
    loading,
    initialized,
    isAuthenticated,
    isAdmin,
    hydrate,
    login,
    register,
    logout,
    setSession,
  };
});
