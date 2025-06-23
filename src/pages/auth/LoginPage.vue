<template>
  <div class="auth-root">
    <div class="auth-container">
      <!-- Logo/Header -->
      <div class="auth-header">
        <div class="auth-logo">
          <HeartHandshake class="auth-logo-icon" />
        </div>
        <h1 class="auth-title">Health Program</h1>
        <p class="auth-desc">Admin Portal</p>
      </div>

      <!-- Login Form -->
      <div class="auth-card">
        <form class="auth-form" @submit="handleLogin">
          <div>
            <label class="auth-label">Username or Email</label>
            <input
              v-model="email"
              type="text"
              required
              class="auth-input"
              placeholder="Enter your username or email"
            />
          </div>
          <div>
            <label class="auth-label">Password</label>
            <div class="auth-input-group">
              <input
                v-model="password"
                type="password"
                required
                class="auth-input"
                placeholder="Enter your password"
              />
              <button type="button" class="auth-input-icon-btn">
                <Eye class="auth-input-icon" />
              </button>
            </div>
          </div>
          <div class="auth-row">
            <label class="auth-checkbox-label">
              <input type="checkbox" class="auth-checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" class="auth-link">Forgot password?</a>
          </div>
          <div class="auth-recaptcha">
            <input type="checkbox" class="auth-checkbox" />
            <span>I'm not a robot</span>
            <Shield class="auth-recaptcha-icon" />
          </div>
          <button type="submit" class="auth-btn-primary">
            Sign In
          </button>
          <div v-if="error" class="auth-error">
            {{ error }}
          </div>
        </form>
        <div class="auth-footer">
          <p>
            Don't have an account?
            <router-link to="/register" class="auth-link">Register here</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { HeartHandshake, Eye, Shield } from 'lucide-vue-next'
import { loginWithEmail } from '../../services/auth'
import { useRouter } from 'vue-router'
import { getDocs, query, where, collection } from 'firebase/firestore'
import { db } from '../../services/firebase'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async (e) => {
  e.preventDefault()
  error.value = ''
  let loginEmail = email.value
  console.log('Login input:', loginEmail)

  // If input doesn't look like an email, treat as username
  if (!loginEmail.includes('@')) {
    const q = query(collection(db, 'admins'), where('username', '==', loginEmail))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      loginEmail = querySnapshot.docs[0].data().email
      console.log('Found email for username in admins:', loginEmail)
    } else {
      error.value = 'Username not found or not an admin'
      return
    }
  } else {
    // If input is an email, check if it exists in admins
    const q = query(collection(db, 'admins'), where('email', '==', loginEmail))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      error.value = 'Email not found or not an admin'
      return
    }
  }

  try {
    const userCredential = await loginWithEmail(loginEmail, password.value)
    console.log('Login success:', userCredential.user)
    if (!userCredential.user.emailVerified) {
      error.value = 'Please verify your email before logging in.'
      return
    }
    router.push('/admin/dashboard')
  } catch (err) {
    error.value = err.message
    console.error('Login error:', err)
  }
}
</script>

<style scoped>
.auth-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f8fafc;
}

.auth-container {
  max-width: 400px;
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  width: 4rem;
  height: 4rem;
  background-color: #2563eb;
  border-radius: 9999px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-logo-icon {
  width: 2rem;
  height: 2rem;
  color: white;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.auth-desc {
  color: #6b7280;
}

.auth-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.auth-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: #f9fafb;
  color: #111827;
  transition: border-color 0.2s;
}

.auth-input:focus {
  border-color: #2563eb;
  outline: none;
}

.auth-input-group {
  position: relative;
}

.auth-input-icon-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
}

.auth-input-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.auth-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auth-checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.auth-checkbox {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  accent-color: #2563eb;
}

.auth-link {
  font-size: 0.875rem;
  color: #2563eb;
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}

.auth-recaptcha {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.auth-recaptcha-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.auth-btn-primary {
  padding: 0.75rem 1rem;
  background-color: #2563eb;
  color: white;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
}

.auth-btn-primary:hover {
  background-color: #1d4ed8;
}

.auth-error {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.auth-footer p {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
