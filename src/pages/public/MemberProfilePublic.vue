<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <HeartHandshake class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Health Program Member</h1>
        <p class="text-slate-600 dark:text-slate-400">Member Profile Information</p>
      </div>

      <!-- Optional: Add a navigation button -->
      <div class="mb-6 text-center">
        <router-link to="/scan" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Back to Scan
        </router-link>
      </div>

      <!-- Member Profile Card -->
      <div class="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div class="flex items-center justify-center mb-6">
          <div class="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <User class="w-12 h-12 text-slate-500 dark:text-slate-400" />
          </div>
        </div>

        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ member?.fullName }}</h2>
          <p class="text-slate-600 dark:text-slate-400">ID: {{ member?.id }}</p>
          <p class="text-slate-600 dark:text-slate-400">Reference: {{ member?.referenceNumber }}</p>
        </div>

        <!-- Balance Display -->
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Current Balance</p>
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">₱{{ member?.balance }}</p>
          </div>
        </div>

        <!-- Member Information Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Full Name</h4>
            <p class="text-slate-900 dark:text-slate-100">{{ member?.fullName }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Maiden Name</h4>
            <p class="text-slate-900 dark:text-slate-100">{{ member?.maidenName }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Address</h4>
            <p class="text-slate-900 dark:text-slate-100">{{ member?.address }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Gender</h4>
            <p class="text-slate-900 dark:text-slate-100">{{ member?.gender }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Date of Birth</h4>
            <p class="text-slate-900 dark:text-slate-100">{{ member?.dateOfBirth }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Civil Status</h4>
            <p class="text-slate-900 dark:text-slate-100">{{ member?.civilStatus }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Phone Number</h4>
            <p class="text-slate-900 dark:text-slate-100">{{ member?.phoneNumber }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Membership Status</h4>
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="{
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': member?.membershipStatus === 'Active',
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': member?.membershipStatus === 'Inactive'
            }">
              {{ member?.membershipStatus === 'Active' ? 'Active until ' + new Date(member?.membershipExpiry).toLocaleDateString() : 'Inactive' }}
            </span>
          </div>
        </div>

        <!-- QR Code -->
        <div class="flex justify-center mb-6">
          <div>
            <h4 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 text-center">Member QR Code</h4>
            <div class="w-48 h-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center mx-auto">
              <QrCode class="w-32 h-32 text-slate-900 dark:text-slate-100" />
            </div>
          </div>
        </div>
      </div>

      <!-- Beneficiaries Section -->
      <div class="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Registered Beneficiaries</h3>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Name</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Age</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Gender</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Relationship</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">Juan Santos</td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">16</td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">Male</td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">Son</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">Ana Santos</td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">14</td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">Female</td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">Daughter</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Available Services -->
      <div class="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Available Services</h3>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Service</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">ULTRASOUND</td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Claimed
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">₱1,200</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">CT-SCAN</td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Available
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">₱6,500</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">2D-ECHO</td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Available
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">₱3,000</td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">MRI</td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Unavailable
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">₱6,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          For inquiries, please contact the Health Program Office at +63 912 345 6789
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          © {{ new Date().getFullYear() }} Health Program Management System
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '@/services/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { HeartHandshake, User, QrCode } from 'lucide-vue-next'

const route = useRoute()
const member = ref(null)
const loading = ref(true)
const error = ref('')

// Get the reference number from the query param
const referenceNumber = route.query.ref

onMounted(async () => {
  if (!referenceNumber) {
    error.value = 'No reference number provided.'
    loading.value = false
    return
  }
  try {
    const q = query(collection(db, 'members'), where('referenceNumber', '==', referenceNumber))
    const snap = await getDocs(q)
    if (!snap.empty) {
      member.value = { id: snap.docs[0].id, ...snap.docs[0].data() }
    } else {
      error.value = 'Member not found.'
    }
  } catch (e) {
    error.value = 'Error fetching member.'
  }
  loading.value = false
})
</script>