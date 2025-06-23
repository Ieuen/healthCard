<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <div class="admin-main">
      <!-- Top Navigation -->
      <header class="admin-header">
        <div class="admin-header-inner">
          <div class="admin-header-title-group">
            <button class="admin-header-btn" @click="goBack">
              <ArrowLeft class="admin-header-icon" />
            </button>
            <h1 class="admin-title">Member Profile</h1>
          </div>
          <div class="admin-header-actions">
            <button class="admin-header-btn admin-header-btn--notif">
              <Bell class="admin-header-icon" />
            </button>
            <button class="admin-header-btn">
              <Sun class="admin-header-icon" />
            </button>
            <div class="admin-header-profile">
              <div class="admin-header-avatar"></div>
              <span class="admin-header-name">{{ adminName }}</span>
            </div>
            <button class="admin-header-btn" @click="handleLogout" title="Logout">
              <LogOut class="admin-header-icon" />
            </button>
          </div>
        </div>
      </header>

      <!-- Profile Content -->
      <main class="admin-content">
        <div class="admin-profile-container">
          <!-- Member Info Card -->
          <div v-if="member" class="admin-card admin-profile-card">
            <div class="admin-profile-header">
              <div class="admin-profile-main">
                <img v-if="member.idPictureUrl" :src="member.idPictureUrl" alt="ID Picture" class="admin-profile-avatar" />
                <div class="admin-profile-details">
                  <h2 class="admin-profile-name">
                    {{ member.lastName }}, {{ member.firstName }} {{ member.middleName }}
                  </h2>
                  <div class="admin-profile-info-list">
                    <div><span class="admin-profile-label">ID Number:</span> {{ member.idNumber }}</div>
                    <div><span class="admin-profile-label">Reference Number:</span> {{ member.referenceNumber }}</div>
                    <div><span class="admin-profile-label">Maiden Name:</span> {{ member.maidenName }}</div>
                    <div><span class="admin-profile-label">Barangay:</span> {{ member.barangay }}</div>
                    <div><span class="admin-profile-label">Gender:</span> {{ member.gender }}</div>
                    <div><span class="admin-profile-label">Date of Birth:</span> {{ member.dob }}</div>
                    <div><span class="admin-profile-label">Civil Status:</span> {{ member.civilStatus }}</div>
                    <div><span class="admin-profile-label">Phone Number:</span> {{ member.phoneNumber }}</div>
                    <div><span class="admin-profile-label">Balance:</span> ₱{{ member.balance ? member.balance.toLocaleString() : '0' }}</div>
                    <div><span class="admin-profile-label">Registered:</span> {{ formatDate(member.createdAt) }}</div>
                    <div><span class="admin-profile-label">Expiry Date:</span> {{ formatDate(member.expiryDate) }}</div>
                    <div><span class="admin-profile-label">Complete Address:</span> {{ member.completeAddress }}</div>
                    <div>
                      <span class="admin-profile-label">Status:</span>
                      <span
                        class="admin-status-badge"
                        :class="isActive(member) ? 'admin-status-badge--active' : 'admin-status-badge--expired'"
                      >
                        {{ isActive(member) ? 'Active' : 'Expired' }}
                      </span>
                    </div>
                  </div>
                </div>
                <img v-if="member.signatureUrl" :src="member.signatureUrl" alt="E-Signature" class="admin-profile-signature" />
              </div>
              <button class="admin-btn admin-btn--primary admin-profile-update-btn" @click="showUpdateModal = true">
                <Edit class="admin-btn-icon" /> Update Profile
              </button>
            </div>
            <div v-if="member.qrCodeUrl" class="admin-profile-qr">
              <img :src="member.qrCodeUrl" alt="QR Code" class="admin-profile-qr-img" />
            </div>
          </div>

          <!-- Beneficiaries Table -->
          <div class="admin-card">
            <div class="admin-card-header">
              <h3 class="admin-card-title">Registered Beneficiaries</h3>
              <button class="admin-btn admin-btn--success" @click="showBeneficiaryModal = true">
                Add Beneficiary
              </button>
            </div>
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Relationship</th>
                    <th>Date of Birth</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="beneficiaries.length === 0">
                    <td colspan="5" style="text-align:center;">No beneficiaries found.</td>
                  </tr>
                  <tr v-for="b in beneficiaries" :key="b.id">
                    <td>{{ b.lastName }}, {{ b.firstName }} {{ b.middleName }}</td>
                    <td>{{ b.age }}</td>
                    <td>{{ b.gender }}</td>
                    <td>{{ b.relationship }}</td>
                    <td>{{ b.dob }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Service History Table -->
          <div class="admin-card">
            <div class="admin-card-header">
              <h3 class="admin-card-title">Service History</h3>
              <button class="admin-btn admin-btn--purple" @click="showServiceModal = true">Add Service</button>
            </div>
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Institution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="claimedServices.length === 0">
                    <td colspan="5" style="text-align:center;">No claimed services found.</td>
                  </tr>
                  <tr v-for="s in claimedServices" :key="s.id">
                    <td>
                      <span class="admin-status-badge admin-status-badge--claimed">Claimed</span>
                    </td>
                    <td>{{ s.serviceType }}</td>
                    <td>{{ s.date }}</td>
                    <td>₱{{ s.amount }}</td>
                    <td>{{ s.institution }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Update Modal -->
        <div v-if="showUpdateModal" class="admin-modal-overlay">
          <div class="admin-modal">
            <h3 class="admin-modal-title">Update Member Information</h3>
            <form class="admin-modal-form" @submit="handleUpdateProfile">
              <div>
                <label class="admin-label">Civil Status</label>
                <select v-model="form.civilStatus" class="admin-input">
                  <option value="married">Married</option>
                  <option value="single">Single</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label class="admin-label">Last Name</label>
                <input type="text" v-model="form.lastName" class="admin-input" />
              </div>
              <div>
                <label class="admin-label">First Name</label>
                <input type="text" v-model="form.firstName" class="admin-input" />
              </div>
              <div>
                <label class="admin-label">Middle Name</label>
                <input type="text" v-model="form.middleName" class="admin-input" />
              </div>
              <div>
                <label class="admin-label">Maiden Name</label>
                <input type="text" v-model="form.maidenName" class="admin-input" />
              </div>
              <div class="admin-modal-actions">
                <button type="button" class="admin-btn" @click="showUpdateModal = false">Cancel</button>
                <button type="submit" class="admin-btn admin-btn--primary">Update</button>
              </div>
              <div v-if="updateError" class="admin-error">{{ updateError }}</div>
              <div v-if="updateSuccess" class="admin-success">{{ updateSuccess }}</div>
            </form>
          </div>
        </div>

        <!-- Beneficiary Modal -->
        <div v-if="showBeneficiaryModal" class="admin-modal-overlay">
          <div class="admin-modal">
            <h3 class="admin-modal-title">Add Beneficiary</h3>
            <form class="admin-modal-form" @submit="handleAddBeneficiary">
              <div>
                <label class="admin-label">Last Name</label>
                <input type="text" v-model="beneficiaryForm.lastName" class="admin-input" required />
              </div>
              <div>
                <label class="admin-label">First Name</label>
                <input type="text" v-model="beneficiaryForm.firstName" class="admin-input" required />
              </div>
              <div>
                <label class="admin-label">Middle Name</label>
                <input type="text" v-model="beneficiaryForm.middleName" class="admin-input" />
              </div>
              <div>
                <label class="admin-label">Gender</label>
                <select v-model="beneficiaryForm.gender" class="admin-input" required>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label class="admin-label">Age</label>
                <input type="number" v-model="beneficiaryForm.age" class="admin-input" min="0" max="21" required />
              </div>
              <div>
                <label class="admin-label">Date of Birth</label>
                <input type="date" v-model="beneficiaryForm.dob" class="admin-input" required />
              </div>
              <div>
                <label class="admin-label">Relationship</label>
                <input type="text" v-model="beneficiaryForm.relationship" class="admin-input" required />
              </div>
              <div class="admin-modal-actions">
                <button type="button" class="admin-btn" @click="showBeneficiaryModal = false">Cancel</button>
                <button type="submit" class="admin-btn admin-btn--primary">Add</button>
              </div>
              <div v-if="beneficiaryError" class="admin-error">{{ beneficiaryError }}</div>
              <div v-if="beneficiarySuccess" class="admin-success">{{ beneficiarySuccess }}</div>
            </form>
          </div>
        </div>

        <!-- Service Claim Modal -->
        <div v-if="showServiceModal" class="admin-modal-overlay">
          <div class="admin-modal">
            <h3 class="admin-modal-title">Add Claimed Service</h3>
            <form class="admin-modal-form" @submit="handleAddService">
              <div>
                <label class="admin-label">Category</label>
                <select v-model="serviceForm.category" class="admin-input">
                  <option value="outpatient">Outpatient</option>
                  <option value="inpatient">Inpatient</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div v-if="serviceForm.category === 'outpatient'">
                <label class="admin-label">Service Type</label>
                <select v-model="serviceForm.serviceType" class="admin-input" required>
                  <option value="">Select service</option>
                  <option v-for="s in outpatientServices" :key="s.name" :value="s.name" :disabled="s.max !== null && claimedAmounts[s.name] >= s.max">
                    {{ s.name }} ({{ s.max ? `₱${s.max}` : 'No Limit' }}) 
                    <span v-if="s.max !== null && claimedAmounts[s.name]">- Claimed: ₱{{ claimedAmounts[s.name] || 0 }}</span>
                  </option>
                </select>
              </div>
              <div v-else-if="serviceForm.category === 'other'">
                <label class="admin-label">Service Type</label>
                <select v-model="serviceForm.serviceType" class="admin-input" required>
                  <option value="">Select service</option>
                  <option v-for="s in otherServices" :key="s.name" :value="s.name" :disabled="s.max !== null && claimedAmounts[s.name] >= s.max">
                    {{ s.name }} (₱{{ s.max }})
                    <span v-if="s.max !== null && claimedAmounts[s.name]">- Claimed: ₱{{ claimedAmounts[s.name] || 0 }}</span>
                  </option>
                </select>
              </div>
              <div v-else>
                <label class="admin-label">Service Type</label>
                <input type="text" v-model="serviceForm.serviceType" class="admin-input" style="text-transform:uppercase" @input="serviceForm.serviceType = serviceForm.serviceType.toUpperCase()" required />
              </div>
              <div>
                <label class="admin-label">Institution Name</label>
                <input type="text" v-model="serviceForm.institution" class="admin-input" required />
              </div>
              <div>
                <label class="admin-label">Amount</label>
                <input type="number" v-model="serviceForm.amount" class="admin-input" min="1" required />
              </div>
              <div>
                <label class="admin-label">Date</label>
                <input type="date" v-model="serviceForm.date" class="admin-input" required />
              </div>
              <div class="admin-modal-actions">
                <button type="button" class="admin-btn" @click="showServiceModal = false">Cancel</button>
                <button type="submit" class="admin-btn admin-btn--primary">Add</button>
              </div>
              <div v-if="serviceError" class="admin-error">{{ serviceError }}</div>
              <div v-if="serviceSuccess" class="admin-success">{{ serviceSuccess }}</div>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '../../services/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { logout } from '../../services/auth'
import {
  HeartHandshake, LayoutDashboard, FileText, UserPlus, Users, QrCode, Bell, Sun, LogOut,
  ArrowLeft, User, Edit, Stethoscope, Camera, PenTool
} from 'lucide-vue-next'
import AdminSidebar from '@/components/AdminSidebar.vue'

const adminName = ref('')
onAuthStateChanged(auth, (user) => {
  if (user) {
    adminName.value = user.email ? user.email.split('@')[0] : 'Admin'
  }
})

const router = useRouter()
const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const route = useRoute()
const memberId = route.params.id
const member = ref(null)
const showUpdateModal = ref(false)
const updateError = ref('')
const updateSuccess = ref('')

// Editable form state
const form = ref({
  lastName: '',
  firstName: '',
  middleName: '',
  maidenName: '',
  civilStatus: '',
})

// When member data is loaded, sync form fields
watch([member, showUpdateModal], ([m, modalOpen]) => {
  if (m && modalOpen) {
    form.value.lastName = m.lastName || ''
    form.value.firstName = m.firstName || ''
    form.value.middleName = m.middleName || ''
    form.value.maidenName = m.maidenName || ''
    form.value.civilStatus = m.civilStatus || ''
  }
})

onMounted(async () => {
  if (memberId) {
    const docRef = doc(db, 'members', memberId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      member.value = docSnap.data()
    }
  }
})

function formatDate(date) {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function isActive(member) {
  if (!member.expiryDate) return false
  const expiry = member.expiryDate.toDate ? member.expiryDate.toDate() : new Date(member.expiryDate)
  return expiry > new Date()
}

// Handle update profile form submit
async function handleUpdateProfile(e) {
  e.preventDefault()
  updateError.value = ''
  updateSuccess.value = ''
  try {
    const docRef = doc(db, 'members', memberId)
    await updateDoc(docRef, {
      lastName: form.value.lastName,
      firstName: form.value.firstName,
      middleName: form.value.middleName,
      maidenName: form.value.maidenName,
      civilStatus: form.value.civilStatus,
    })
    // Update local member data
    member.value = {
      ...member.value,
      ...form.value,
    }
    updateSuccess.value = 'Profile updated successfully!'
    showUpdateModal.value = false
  } catch (err) {
    updateError.value = err.message
  }
}

// Beneficiary modal state
const showBeneficiaryModal = ref(false)
const beneficiaryForm = ref({
  lastName: '',
  firstName: '',
  middleName: '',
  gender: '',
  age: '',
  dob: '',
  relationship: ''
})
const beneficiaryError = ref('')
const beneficiarySuccess = ref('')

// Reset beneficiary form
function resetBeneficiaryForm() {
  beneficiaryForm.value = {
    lastName: '',
    firstName: '',
    middleName: '',
    gender: '',
    age: '',
    dob: '',
    relationship: ''
  }
  beneficiaryError.value = ''
  beneficiarySuccess.value = ''
}

// Validate and submit beneficiary
async function handleAddBeneficiary(e) {
  e.preventDefault()
  beneficiaryError.value = ''
  beneficiarySuccess.value = ''

  if (!member.value || !member.value.idNumber || !member.value.referenceNumber) {
    beneficiaryError.value = 'Member data not loaded. Please try again.'
    return
  }

  // Validation
  if (
    !beneficiaryForm.value.lastName ||
    !beneficiaryForm.value.firstName ||
    !beneficiaryForm.value.gender ||
    !beneficiaryForm.value.age ||
    !beneficiaryForm.value.dob ||
    !beneficiaryForm.value.relationship
  ) {
    beneficiaryError.value = 'Please fill in all required fields.'
    return
  }
  if (parseInt(beneficiaryForm.value.age) > 21) {
    beneficiaryError.value = 'Age must not exceed 21.'
    return
  }
  try {
    await addDoc(collection(db, 'MembersBeneficiary'), {
      ...beneficiaryForm.value,
      age: parseInt(beneficiaryForm.value.age),
      memberIdNumber: member.value.idNumber,
      memberReferenceNumber: member.value.referenceNumber,
      createdAt: new Date()
    })
    beneficiarySuccess.value = 'Beneficiary added successfully!'
    resetBeneficiaryForm()
    showBeneficiaryModal.value = false
    await fetchBeneficiaries() // Refresh list after adding
  } catch (err) {
    beneficiaryError.value = err.message
  }
}

const beneficiaries = ref([])

async function fetchBeneficiaries() {
  if (!member.value || !member.value.idNumber || !member.value.referenceNumber) {
    beneficiaries.value = []
    return
  }
  const q = query(
    collection(db, 'MembersBeneficiary'),
    where('memberIdNumber', '==', member.value.idNumber),
    where('memberReferenceNumber', '==', member.value.referenceNumber)
  )
  const snapshot = await getDocs(q)
  beneficiaries.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Fetch beneficiaries when member is loaded
watch(member, (m) => {
  if (m && m.idNumber && m.referenceNumber) {
    fetchBeneficiaries()
  }
})


// Service modal state
const showServiceModal = ref(false)
const serviceForm = ref({
  category: 'outpatient',
  serviceType: '',
  institution: '',
  amount: '',
  date: '',
})
const serviceError = ref('')
const serviceSuccess = ref('')

// Outpatient services with max amounts
const outpatientServices = [
  { name: 'CT-SCAN', max: 6500 },
  { name: 'CT-SCAN W/ CONTRAST', max: 5000 },
  { name: '2D-ECHO', max: 3000 },
  { name: 'ULTRASOUND', max: 1200 },
  { name: 'CHEMO', max: 6000 },
  { name: 'MRI', max: 6000 },
  { name: 'DIALYSIS', max: 7000 },
  { name: 'BLOOD CHEM', max: null },
  { name: 'X-RAY', max: null },
  { name: 'EEG', max: null },
  { name: 'MAMOGRAM', max: null },
  { name: 'FT4', max: 1500 },
  { name: 'FT3', max: 1500 },
  { name: 'TSH', max: 1500 }
]
const otherServices = [
  { name: 'EYE GLASSES', max: 1200 }
]

// Track claimed amounts for disabling
const claimedAmounts = ref({})

// Fetch claimed amounts for this member
async function fetchClaimedAmounts() {
  if (!member.value) return
  const q = query(
    collection(db, 'ClaimedServices'),
    where('memberIdNumber', '==', member.value.idNumber),
    where('memberReferenceNumber', '==', member.value.referenceNumber)
  )
  const snapshot = await getDocs(q)
  const amounts = {}
  snapshot.docs.forEach(doc => {
    const data = doc.data()
    const type = (data.serviceType || '').toUpperCase()
    if (!amounts[type]) amounts[type] = 0
    amounts[type] += Number(data.amount) || 0
  })
  claimedAmounts.value = amounts
}

// Reset form
function resetServiceForm() {
  serviceForm.value = {
    category: 'outpatient',
    serviceType: '',
    institution: '',
    amount: '',
    date: '',
  }
  serviceError.value = ''
  serviceSuccess.value = ''
}

// Validate and submit
async function handleAddService(e) {
  e.preventDefault()
  serviceError.value = ''
  serviceSuccess.value = ''
  if (!member.value || !member.value.idNumber || !member.value.referenceNumber) {
    serviceError.value = 'Member data not loaded.'
    return
  }
  if (!serviceForm.value.serviceType || !serviceForm.value.institution || !serviceForm.value.amount || !serviceForm.value.date) {
    serviceError.value = 'Please fill in all required fields.'
    return
  }

  // Check max claim logic
  let max = null
  let type = serviceForm.value.serviceType.toUpperCase()
  if (serviceForm.value.category === 'outpatient') {
    const found = outpatientServices.find(s => s.name === type)
    if (found && found.max) max = found.max
  }
  if (serviceForm.value.category === 'other') {
    const found = otherServices.find(s => s.name === type)
    if (found && found.max) max = found.max
  }
  if (max !== null) {
    const alreadyClaimed = claimedAmounts.value[type] || 0
    if (alreadyClaimed + Number(serviceForm.value.amount) > max) {
      serviceError.value = `Maximum claim for ${type} is ₱${max}. Already claimed: ₱${alreadyClaimed}.`
      return
    }
  }

  // Check member balance
  const claimAmount = Number(serviceForm.value.amount)
  const currentBalance = Number(member.value.balance) || 0
  if (claimAmount > currentBalance) {
    serviceError.value = 'Insufficient balance. The member cannot claim this service.'
    // Optionally, notify admin here (e.g., show a pop-up or send an email)
    alert('The member has insufficient balance to claim this service!')
    return
  }
  if (currentBalance === 0) {
    serviceError.value = 'Member balance is already zero. Cannot claim more services.'
    alert('The member\'s balance is already zero. No further claims allowed!')
    return
  }

  try {
    // Add claimed service
    await addDoc(collection(db, 'ClaimedServices'), {
      ...serviceForm.value,
      serviceType: type,
      amount: claimAmount,
      memberIdNumber: member.value.idNumber,
      memberReferenceNumber: member.value.referenceNumber,
      createdAt: new Date()
    })

    // Update member balance in Firestore
    const newBalance = Math.max(currentBalance - claimAmount, 0)
    const memberDocRef = doc(db, 'members', memberId)
    await updateDoc(memberDocRef, { balance: newBalance })

    // Update local member object
    member.value.balance = newBalance

    serviceSuccess.value = 'Service claimed successfully!'
    resetServiceForm()
    showServiceModal.value = false
    await fetchClaimedAmounts()
    await fetchServices()
  } catch (err) {
    serviceError.value = err.message
  }
}

// Fetch claimed amounts when member loads or modal opens
watch([member, showServiceModal], ([m, modalOpen]) => {
  if (m && (modalOpen || !Object.keys(claimedAmounts.value).length)) {
    fetchClaimedAmounts()
  }
})

// (Optional) Fetch claimed services for the table
const claimedServices = ref([])
async function fetchServices() {
  if (!member.value) return
  const q = query(
    collection(db, 'ClaimedServices'),
    where('memberIdNumber', '==', member.value.idNumber),
    where('memberReferenceNumber', '==', member.value.referenceNumber)
  )
  const snapshot = await getDocs(q)
  claimedServices.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
watch(member, (m) => { if (m) fetchServices() })

function goBack() {
  router.back()
}
</script>

<style>
.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 256px;
  background-color: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.admin-sidebar-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-logo {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.admin-logo-icon {
  width: 32px;
  height: 32px;
  background-color: #2563eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.admin-logo-svg {
  width: 20px;
  height: 20px;
  color: #fff;
}

.admin-logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.admin-nav {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.admin-nav-link:hover {
  background-color: #f3f4f6;
}

.admin-nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.admin-nav-link--active {
  background-color: #2563eb;
  color: #fff;
}

.admin-main {
  margin-left: 256px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header-inner {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header-title-group {
  display: flex;
  align-items: center;
}

.admin-header-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.admin-header-icon {
  width: 24px;
  height: 24px;
  color: #374151;
}

.admin-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-left: 8px;
}

.admin-header-actions {
  display: flex;
  align-items: center;
}

.admin-header-profile {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.admin-header-avatar {
  width: 32px;
  height: 32px;
  background-color: #e5e7eb;
  border-radius: 50%;
  margin-right: 8px;
}

.admin-header-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.admin-card {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.admin-profile-card {
  position: relative;
}

.admin-profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.admin-profile-main {
  display: flex;
  align-items: center;
}

.admin-profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-right: 16px;
}

.admin-profile-details {
  flex: 1;
}

.admin-profile-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.admin-profile-info-list {
  font-size: 14px;
  color: #6b7280;
}

.admin-profile-label {
  font-weight: 500;
  color: #374151;
}

.admin-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
}

.admin-status-badge--active {
  background-color: #d1fae5;
  color: #065f46;
}

.admin-status-badge--expired {
  background-color: #fee2e2;
  color: #991b1b;
}

.admin-profile-signature {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-left: 16px;
}

.admin-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.admin-btn--primary {
  background-color: #2563eb;
  color: #fff;
}

.admin-btn--primary:hover {
  background-color: #1d4ed8;
}

.admin-btn--success {
  background-color: #22c55e;
  color: #fff;
}

.admin-btn--success:hover {
  background-color: #16a34a;
}

.admin-btn--purple {
  background-color: #8b5cf6;
  color: #fff;
}

.admin-btn--purple:hover {
  background-color: #6d28d9;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 12px;
  text-align: left;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.admin-table th {
  background-color: #f3f4f6;
  font-weight: 500;
  text-transform: uppercase;
}

.admin-table tr:hover {
  background-color: #f9fafb;
}

.admin-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.admin-modal {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
}

.admin-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.admin-modal-form {
  display: flex;
  flex-direction: column;
}

.admin-modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.admin-modal-actions .admin-btn {
  margin-left: 8px;
}

.admin-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.admin-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #fff;
  color: #374151;
  font-size: 14px;
  transition: border-color 0.2s;
}

.admin-input:focus {
  border-color: #2563eb;
  outline: none;
}

.admin-error {
  margin-top: 12px;
  font-size: 14px;
  color: #991b1b;
}

.admin-success {
  margin-top: 12px;
  font-size: 14px;
  color: #065f46;
}
</style>