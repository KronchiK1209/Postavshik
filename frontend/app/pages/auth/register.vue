<template>
  <div class="auth-screen">
    <section class="auth-card glass-panel fade-in">
      <div class="auth-header">
        <h1>Регистрация поставщика</h1>
        <p>Создайте аккаунт компании, чтобы бронировать окна разгрузки и отслеживать заявки онлайн.</p>
      </div>

      <Form :validation-schema="schema" @submit="handleSubmit" class="auth-form">
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="form-grid">
          <Field name="supplierTitle" v-slot="{ field, errorMessage }">
            <label>Название компании</label>
            <input v-bind="field" type="text" placeholder="ООО «Логистик Плюс»" />
            <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
          </Field>

          <Field name="inn" v-slot="{ field, errorMessage }">
            <label>ИНН</label>
            <input v-bind="field" type="text" placeholder="7730000000" />
            <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
          </Field>

          <Field name="kpp" v-slot="{ field, errorMessage }">
            <label>КПП</label>
            <input v-bind="field" type="text" placeholder="773001001" />
            <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
          </Field>

          <Field name="address" v-slot="{ field, errorMessage }">
            <label>Адрес</label>
            <input v-bind="field" type="text" placeholder="Амстердам, Teststraat 1" />
            <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
          </Field>

          <Field name="email" v-slot="{ field, errorMessage }">
            <label>Email для уведомлений</label>
            <input v-bind="field" type="email" placeholder="office@company.io" />
            <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
          </Field>

          <Field name="phone" v-slot="{ field, errorMessage }">
            <label>Телефон</label>
            <input v-bind="field" type="tel" placeholder="+7 900 000-00-00" />
            <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
          </Field>
        </div>

        <div class="form-grid">
          <Field name="username" v-slot="{ field, errorMessage }">
            <label>Имя пользователя</label>
            <input v-bind="field" type="text" placeholder="logist.maria" />
            <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
          </Field>

          <Field name="accountEmail" v-slot="{ field, errorMessage }">
            <label>Email для входа</label>
            <input v-bind="field" type="email" placeholder="maria@company.io" />
            <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
          </Field>

          <Field name="accountPhone" v-slot="{ field, errorMessage }">
            <label>Мобильный телефон</label>
            <input v-bind="field" type="tel" placeholder="+31 6 0000 0000" />
            <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
          </Field>

          <Field name="password" v-slot="{ field, errorMessage }">
            <label>Пароль</label>
            <input v-bind="field" type="password" placeholder="Минимум 8 символов" />
            <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
          </Field>
        </div>

        <Field name="acceptTerms" type="checkbox" v-slot="{ field, errorMessage }">
          <label class="checkbox">
            <input v-bind="field" type="checkbox" />
            <span>Я принимаю условия обработки данных</span>
          </label>
          <span class="error" v-if="errorMessage">{{ errorMessage }}</span>
        </Field>

        <button class="cta" type="submit" :disabled="auth.loading">
          <span v-if="auth.loading">Создаём аккаунт...</span>
          <span v-else>Зарегистрироваться</span>
        </button>
      </Form>

      <footer class="auth-footer">
        <span>Уже зарегистрированы?</span>
        <NuxtLink to="/auth/login">Войти</NuxtLink>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Form, Field } from 'vee-validate';
import { object, string, boolean } from 'yup';
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();

definePageMeta({
  middleware: ['auth'],
});

const schema = object({
  supplierTitle: string().required('Заполните название компании'),
  inn: string().optional(),
  kpp: string().optional(),
  address: string().optional(),
  email: string().email('Некорректный email').required('Укажите email'),
  phone: string().optional(),
  username: string().min(3, 'Минимум 3 символа').required('Укажите имя пользователя'),
  accountEmail: string().email('Некорректный email').required('Введите email для входа'),
  accountPhone: string().optional(),
  password: string()
    .min(8, 'Минимум 8 символов')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).+$/, 'Пароль должен содержать буквы, цифры и спецсимволы')
    .required('Введите пароль'),
  acceptTerms: boolean().oneOf([true], 'Необходимо принять условия'),
});

const formError = ref('');

async function handleSubmit(values: any) {
  formError.value = '';
  try {
    await auth.register(values);
    await navigateTo('/dashboard');
  } catch (error: any) {
    formError.value = error?.data?.message || 'Не удалось создать аккаунт. Попробуйте ещё раз.';
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
  max-width: 960px;
  width: 100%;
  padding: clamp(32px, 4vw, 56px);
  display: grid;
  gap: 28px;
}

.auth-header h1 {
  margin: 0;
  font-size: clamp(30px, 4vw, 40px);
}

.auth-header p {
  margin: 0;
  color: var(--text-muted);
  max-width: 520px;
}

.auth-form {
  display: grid;
  gap: 24px;
}

.form-error {
  margin: 0;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(248, 113, 113, 0.14);
  color: #fecaca;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px 24px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
}

input[type='text'],
input[type='email'],
input[type='tel'],
input[type='password'] {
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

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-muted);
  cursor: pointer;
}

.checkbox input {
  width: 18px;
  height: 18px;
  accent-color: #38bdf8;
}

.error {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #f87171;
}

button.cta {
  justify-content: center;
  display: flex;
  align-items: center;
  gap: 8px;
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

@media (max-width: 768px) {
  .auth-card {
    padding: 24px 20px;
  }
}
</style>
