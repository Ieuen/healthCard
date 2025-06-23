<template>
  <div class="auth-root">
    <div class="auth-container">
      <!-- Header -->
      <div class="auth-header">
        <div class="auth-logo">
          <UserPlus class="auth-logo-icon" />
        </div>
        <h1 class="auth-title">Admin Registration</h1>
        <p class="auth-desc">Create your administrator account</p>
      </div>

      <!-- Registration Form -->
      <div class="auth-card">
        <form class="auth-form" @submit="handleRegister">
          <!-- Personal Information -->
          <div>
            <h3 class="auth-section-title">Personal Information</h3>
            <div class="auth-grid">
              <div>
                <label class="auth-label">First Name *</label>
                <input
                  type="text"
                  class="auth-input"
                  placeholder="Enter first name"
                  v-model="firstName"
                  required
                />
              </div>
              <div>
                <label class="auth-label">Last Name *</label>
                <input
                  type="text"
                  class="auth-input"
                  placeholder="Enter last name"
                  v-model="lastName"
                  required
                />
              </div>
              <div>
                <label class="auth-label">Middle Name</label>
                <input
                  type="text"
                  class="auth-input"
                  placeholder="Enter middle name"
                  v-model="middleName"
                />
              </div>
              <div>
                <label class="auth-label">Date of Birth *</label>
                <input
                  type="date"
                  class="auth-input"
                  v-model="dob"
                  required
                />
              </div>
              <div>
                <label class="auth-label">Gender *</label>
                <select
                  class="auth-input"
                  v-model="gender"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label class="auth-label">Contact Number *</label>
                <input
                  type="tel"
                  class="auth-input"
                  placeholder="+63 9XX XXX XXXX"
                  v-model="contactNumber"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Account Information -->
          <div>
            <h3 class="auth-section-title">Account Information</h3>
            <div class="auth-grid">
              <div>
                <label class="auth-label">Username *</label>
                <input
                  type="text"
                  class="auth-input"
                  placeholder="Choose a username"
                  v-model="username"
                  required
                />
              </div>
              <div>
                <label class="auth-label">Email *</label>
                <input
                  type="email"
                  class="auth-input"
                  placeholder="Enter email address"
                  v-model="email"
                  required
                />
              </div>
              <div>
                <label class="auth-label">Password *</label>
                <input
                  type="password"
                  class="auth-input"
                  placeholder="Create a strong password"
                  v-model="password"
                  required
                />
                <div class="auth-password-requirements">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </div>
              </div>
              <div>
                <label class="auth-label">Confirm Password *</label>
                <input
                  type="password"
                  class="auth-input"
                  placeholder="Confirm your password"
                  v-model="confirmPassword"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Role Selection -->
          <div>
            <label class="auth-label">Role *</label>
            <select
              class="auth-input"
              v-model="role"
              required
            >
              <option value="">Select role</option>
              <option value="head_admin">Head Administrator</option>
              <option value="admin_assistant">Administrative Assistant</option>
            </select>
          </div>

          <!-- Terms and Conditions -->
          <div class="auth-terms">
            <input type="checkbox" class="auth-checkbox" />
            <div class="auth-terms-text">
              <span>
                I agree to the
                <button type="button" class="auth-link">
                  Terms and Conditions
                </button>
                and
                <button type="button" class="auth-link">
                  Privacy Policy
                </button>
              </span>
            </div>
          </div>

          <!-- reCAPTCHA -->
          <div class="auth-recaptcha">
            <div class="auth-recaptcha-content">
              <input type="checkbox" class="auth-recaptcha-checkbox" />
              <span>I'm not a robot</span>
              <Shield class="auth-recaptcha-icon" />
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="auth-error">
            {{ error }}
          </div>

          <!-- Success Message -->
          <div v-if="success" class="auth-success">
            {{ success }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="auth-btn-primary"
          >
            Create Account
          </button>
        </form>
        <div class="auth-footer">
          <p>
            Already have an account?
            <router-link to="/login" class="auth-link">Sign in here</router-link>
          </p>
        </div>
      </div>

      <!-- Modal Alert -->
      <div v-if="showModal" class="auth-modal">
        <div class="auth-modal-content">
          <div :class="modalType === 'success' ? 'auth-modal-success' : 'auth-modal-error'">
            <span v-if="modalType === 'success'">✔️</span>
            <span v-else>❌</span>
          </div>
          <div class="auth-modal-message">{{ modalMessage }}</div>
          <button @click="closeModal" class="auth-modal-btn">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { registerWithEmail } from '../../services/auth'
import { sendEmailVerification } from 'firebase/auth'
import { UserPlus, Shield } from 'lucide-vue-next'
import { db } from '../../services/firebase'
import { doc, setDoc } from 'firebase/firestore'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')

// Add v-model fields for all form inputs
const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const dob = ref('')
const gender = ref('')
const contactNumber = ref('')
const username = ref('')
const role = ref('')

// Modal state
const showModal = ref(false)
const modalMessage = ref('')
const modalType = ref('success') // or 'error'

function openModal(message, type = 'success') {
  modalMessage.value = message
  modalType.value = type
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

const handleRegister = async (e) => {
  e.preventDefault()
  error.value = ''
  success.value = ''
  if (password.value !== confirmPassword.value) {
    openModal('Passwords do not match', 'error')
    return
  }
  let user = null
  try {
    // 1. Register user
    const userCredential = await registerWithEmail(email.value, password.value)
    user = userCredential.user

    // 2. Store user data in Firestore
    await setDoc(doc(db, 'admins', user.uid), {
      uid: user.uid,
      email: email.value,
      username: username.value,
      firstName: firstName.value,
      lastName: lastName.value,
      middleName: middleName.value,
      dob: dob.value,
      gender: gender.value,
      contactNumber: contactNumber.value,
      role: role.value,
      isAdmin: true,
      createdAt: new Date()
    })
    console.log('User data written to Firestore for UID:', user.uid)

    // 3. Send email verification
    await sendEmailVerification(user)
    openModal('Registration successful! Please check your email for verification.', 'success')
    clearForm()
  } catch (err) {
    if (user) {
      try { await user.delete() } catch (_) {}
    }
    openModal(err.message, 'error')
    console.error('Registration error:', err)
  }
}

function clearForm() {
  firstName.value = ''
  lastName.value = ''
  middleName.value = ''
  dob.value = ''
  gender.value = ''
  contactNumber.value = ''
  username.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  role.value = ''
}
</script>

<style scoped>
.auth-root {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem 1rem;
}

.auth-container {
  max-width: 40rem;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  width: 4rem;
  height: 4rem;
  background-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-logo-icon {
  width: 2rem;
  height: 2rem;
  color: #fff;
}

.auth-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.auth-desc {
  color: #6b7280;
}

.auth-card {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.auth-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.auth-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .auth-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.auth-label {
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
  display: block;
}

.auth-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #fff;
  color: #111827;
  transition: border-color 0.2s;
}

.auth-input:focus {
  border-color: #2563eb;
  outline: none;
}

.auth-password-requirements {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.auth-terms {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.auth-checkbox {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  appearance: none;
  display: inline-block;
  position: relative;
}

.auth-checkbox:checked {
  background-color: #2563eb;
  border-color: #2563eb;
}

.auth-checkbox:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.375rem;
  height: 0.375rem;
  background-color: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.auth-terms-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.auth-link {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}

.auth-recaptcha {
  background-color: #f1f5f9;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 1rem;
  text-align: center;
}

.auth-recaptcha-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.auth-recaptcha-checkbox {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  appearance: none;
  display: inline-block;
  position: relative;
}

.auth-recaptcha-checkbox:checked {
  background-color: #2563eb;
  border-color: #2563eb;
}

.auth-recaptcha-checkbox:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.375rem;
  height: 0.375rem;
  background-color: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.auth-recaptcha-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.auth-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.auth-success {
  color: #16a34a;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.auth-btn-primary {
  width: 100%;
  background-color: #2563eb;
  color: #fff;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.auth-btn-primary:hover {
  background-color: #1d4ed8;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.auth-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
}

.auth-modal-content {
  background-color: #fff;
  border-radius: 0.5rem;
  padding: 2rem;
  max-width: 20rem;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.auth-modal-success {
  color: #16a34a;
}

.auth-modal-error {
  color: #dc2626;
}

.auth-modal-message {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.auth-modal-btn {
  background-color: #2563eb;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.auth-modal-btn:hover {
  background-color: #1d4ed8;
}
</style>
