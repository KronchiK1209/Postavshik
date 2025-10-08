<template>
  <div class="auth-screen">
    <section class="auth-card glass-panel fade-in">
      <div class="auth-header">
        <h1>Вход в портал</h1>
        <p>Введите логин или email и пароль, чтобы перейти к управлению заявками.</p>
      </div>

      <Form :validation-schema="schema" @submit="handleSubmit" class="auth-form">
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <Field name="identifier" v-slot="{ field, errorMessage }">
          <label>Логин или email</label>
          <input v-bind="field" type="text" placeholder="supplier@dockflow.io" />
          <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
        </Field>

        <Field name="password" v-slot="{ field, errorMessage }">
          <label>Пароль</label>
          <input v-bind="field" type="password" placeholder="••••••••" />
          <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
        </Field>

        <button class="cta" type="submit" :disabled="auth.loading">
          <span v-if="auth.loading">Входим...</span>
          <span v-else>Войти</span>
        </button>
      </Form>

      <footer class="auth-footer">
        <span>Нет аккаунта?</span>
        <NuxtLink to="/auth/register">Зарегистрироваться</NuxtLink>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Form, Field } from 'vee-validate';
import { object, string } from 'yup';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();

definePageMeta({
  middleware: ['auth'],
});

const schema = object({
  identifier: string().required('Укажите логин или email'),
  password: string().min(6, 'Минимум 6 символов').required('Введите пароль'),
});

const route = useRoute();
const formError = ref('');

async function handleSubmit(values: { identifier: string; password: string }) {
  formError.value = '';
  try {
    await auth.login(values);
    const redirect = (route.query.redirect as string) || '/dashboard';
    await navigateTo(redirect);
  } catch (error: any) {
    formError.value = error?.data?.message || 'Не удалось войти. Проверьте данные.';
  }
}
</script>

<style scoped>
.auth-screen {
  display: grid;
  place-items: center;
  padding: clamp(32px, 6vw, 80px) 16px;
}

.auth-card {
  max-width: 460px;
  width: 100%;
  padding: clamp(32px, 5vw, 48px);
  display: grid;
  gap: 24px;
}

.auth-header h1 {
  margin: 0;
  font-size: clamp(28px, 3vw, 34px);
}

.auth-header p {
  margin: 0;
  color: var(--text-muted);
}

.auth-form {
  display: grid;
  gap: 18px;
}

.form-error {
  margin: 0;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(248, 113, 113, 0.14);
  color: #fecaca;
  font-size: 14px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
}

input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.6);
  color: #fff;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: rgba(56, 189, 248, 0.55);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.18);
}

.error {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #f87171;
}

button.cta {
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-muted);
}

.auth-footer a {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
