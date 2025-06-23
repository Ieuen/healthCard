<template>
  <div class="admin-root">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <div class="admin-main">
      <!-- Top Navigation -->
      <header class="admin-header">
        <div class="admin-header-inner">
          <h1 class="admin-title">Registered Members</h1>
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
            <button
              class="admin-header-btn"
              @click="handleLogout"
              title="Logout"
            >
              <LogOut class="admin-header-icon" />
            </button>
          </div>
        </div>
      </header>

      <!-- Members Content -->
      <main class="admin-content">
        <!-- Filters -->
        <div class="admin-card admin-card--filters">
          <div class="admin-filters-grid admin-filters-grid--4">
            <div>
              <label class="admin-label">Search Members</label>
              <div class="admin-input-icon-wrap">
                <Search class="admin-input-icon" />
                <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Search by name or ID number"
                  class="admin-input admin-input--with-icon"
                />
              </div>
            </div>
            <div>
              <label class="admin-label">Filter by Barangay</label>
              <select v-model="filterBarangay" class="admin-input">
                <option value="">All Barangays</option>
                <option v-for="b in barangayOptions" :key="b" :value="b">{{ b }}</option>
              </select>
            </div>
            <div>
              <label class="admin-label">Registration Year</label>
              <select v-model="filterYear" class="admin-input">
                <option value="">All Years</option>
                <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
            <div>
              <label class="admin-label">Registration Month</label>
              <select v-model="filterMonth" class="admin-input">
                <option value="">All Months</option>
                <option v-for="m in monthOptions" :key="m" :value="m">
                  {{ m ? new Date(0, m-1).toLocaleString('default', { month: 'long' }) : 'All Months' }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Members Grid -->
        <div class="admin-members-grid">
          <div
            v-for="member in pagedMembers"
            :key="member.id"
            class="admin-member-card"
          >
            <div class="admin-member-card-header">
              <div>
                <h3 class="admin-member-name">
                  {{ member.lastName }}, {{ member.firstName }} {{ member.middleName }}
                </h3>
                <p class="admin-member-id">{{ member.idNumber }}</p>
              </div>
              <span
                class="admin-status-badge"
                :class="isActive(member) ? 'admin-status-badge--active' : 'admin-status-badge--expired'"
              >
                {{ isActive(member) ? 'Active' : 'Expired' }}
              </span>
            </div>
            <div class="admin-member-info">
              <div class="admin-member-info-row">
                <span>Balance:</span>
                <span class="admin-member-balance">{{ member.balance ? `₱${member.balance.toLocaleString()}` : '₱0' }}</span>
              </div>
              <div class="admin-member-info-row">
                <span>Barangay:</span>
                <span>{{ member.barangay }}</span>
              </div>
              <div class="admin-member-info-row">
                <span>Registered:</span>
                <span>{{ formatDate(member.createdAt) }}</span>
              </div>
              <div class="admin-member-info-row">
                <span>Expiry Date:</span>
                <span>{{ formatDate(member.expiryDate) }}</span>
              </div>
            </div>
            <div class="admin-member-card-actions">
              <button
                class="admin-btn admin-btn--primary admin-btn--block"
                @click="goToProfile(member.id)"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="admin-pagination">
          <div class="admin-pagination-info">
            Showing {{ pageStart }} to {{ pageEnd }} of {{ totalMembers }} members
          </div>
          <div class="admin-pagination-controls">
            <button
              class="admin-btn admin-btn--pagination"
              :disabled="page === 1"
              @click="goToPage(page - 1)"
            >
              Previous
            </button>
            <button
              v-for="p in totalPages"
              :key="p"
              class="admin-btn admin-btn--pagination"
              :class="{ 'admin-btn--active': p === page }"
              @click="goToPage(p)"
            >
              {{ p }}
            </button>
            <button
              class="admin-btn admin-btn--pagination"
              :disabled="page === totalPages"
              @click="goToPage(page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { 
  HeartHandshake, 
  LayoutDashboard, 
  FileText, 
  UserPlus, 
  Users, 
  QrCode, 
  Bell, 
  Sun, 
  LogOut,
  Search,
  User
} from 'lucide-vue-next'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { logout } from '../../services/auth'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../../services/firebase'
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

const members = ref([])
const filteredMembers = ref([])
const searchTerm = ref('')
const filterBarangay = ref('')
const filterMonth = ref('')
const filterYear = ref('')

// Pagination state
const page = ref(1)
const pageSize = 6

// Fetch all members on mount
const fetchMembers = async () => {
  const membersCol = collection(db, 'members')
  const q = query(membersCol, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  members.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  filterMembers()
}

function filterMembers() {
  let result = [...members.value]

  // Search by name or ID number
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.trim().toLowerCase()
    result = result.filter(m =>
      (m.lastName && m.lastName.toLowerCase().includes(term)) ||
      (m.firstName && m.firstName.toLowerCase().includes(term)) ||
      (m.middleName && m.middleName.toLowerCase().includes(term)) ||
      (m.idNumber && m.idNumber.toLowerCase().includes(term))
    )
  }

  // Filter by barangay
  if (filterBarangay.value) {
    result = result.filter(m => m.barangay === filterBarangay.value)
  }

  // Filter by year and month
  if (filterYear.value || filterMonth.value) {
    result = result.filter(m => {
      if (!m.createdAt) return false
      const date = m.createdAt.toDate ? m.createdAt.toDate() : new Date(m.createdAt)
      const yearMatch = filterYear.value ? date.getFullYear().toString() === filterYear.value : true
      const monthMatch = filterMonth.value ? (date.getMonth() + 1).toString().padStart(2, '0') === filterMonth.value : true
      return yearMatch && monthMatch
    })
  }

  filteredMembers.value = result
}

// Watch for changes
watch([searchTerm, filterBarangay, filterYear, filterMonth, members], filterMembers)

onMounted(fetchMembers)

const barangayOptions = [
  '', 'Balingayan', 'Balite', 'Baruyan', 'Batino', 'Bayanan I', 'Bayanan II', 'Biga', 'Bondoc', 'Bucayao', 'Buhuan',
  'Bulusan', 'Calero', 'Camansihan', 'Camilmil', 'Canubing I', 'Canubing II', 'Comunal', 'Guinobatan', 'Gulod', 'Gutad',
  'Ibaba East', 'Ibaba West', 'Ilaya', 'Lalud', 'Lazareto', 'Libis', 'Lumangbayan', 'Mahal Na Pangalan', 'Maidlang',
  'Malad', 'Malamig', 'Managpi', 'Masipit', 'Nag-Iba I', 'Nag-Iba II', 'Navotas', 'Pachoca', 'Palhi', 'Panggalaan',
  'Parang', 'Patas', 'Personas', 'Putingtubig', 'San Antonio', 'San Raphael (formerly Salong)', 'San Vicente Central',
  'San Vicente East', 'San Vicente North', 'San Vicente South', 'San Vicente West', 'Sapul', 'Silonay', 'Sta. Cruz',
  'Sta. Isabel', 'Sta. Maria Village', 'Sta. Rita', 'Sto. Niño (formerly Nacoco)', 'Suqui', 'Tawagan', 'Tawiran',
  'Tibag', 'Wawa'
]
const yearOptions = computed(() => {
  const years = members.value.map(m => {
    if (!m.createdAt) return null
    const date = m.createdAt.toDate ? m.createdAt.toDate() : new Date(m.createdAt)
    return date.getFullYear().toString()
  }).filter(Boolean)
  return [...new Set(years)]
})
const monthOptions = [
  '', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
]

function isActive(member) {
  if (!member.expiryDate) return false
  const expiry = member.expiryDate.toDate ? member.expiryDate.toDate() : new Date(member.expiryDate)
  return expiry > new Date()
}

function formatDate(date) {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function goToProfile(memberId) {
  router.push({ name: 'MemberProfileAdminPage', params: { id: memberId } })
}

const pagedMembers = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredMembers.value.slice(start, start + pageSize)
})

const totalMembers = computed(() => filteredMembers.value.length)
const pageStart = computed(() => totalMembers.value === 0 ? 0 : (page.value - 1) * pageSize + 1)
const pageEnd = computed(() => Math.min(page.value * pageSize, totalMembers.value))
const totalPages = computed(() => Math.ceil(totalMembers.value / pageSize))

function goToPage(p) {
  if (p >= 1 && p <= totalPages.value) page.value = p
}
</script>

<style scoped>
.admin-root {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.admin-sidebar {
  width: 256px;
  flex-shrink: 0;
  background-color: #fff;
  border-right: 1px solid #e5e7eb;
}

.admin-sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  gap: 8px;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  border-radius: 8px;
  transition: background-color 0.3s, color 0.3s;
}

.admin-nav-link:hover {
  background-color: #f1f5f9;
  color: #111827;
}

.admin-nav-link--active {
  background-color: #2563eb;
  color: #fff;
}

.admin-nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px;
}

.admin-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.admin-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-header-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.3s;
}

.admin-header-btn:hover {
  color: #111827;
}

.admin-header-btn--notif {
  position: relative;
}

.admin-header-icon {
  width: 20px;
  height: 20px;
}

.admin-header-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-header-avatar {
  width: 32px;
  height: 32px;
  background-color: #e5e7eb;
  border-radius: 50%;
}

.admin-header-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.admin-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.admin-card {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.admin-card--filters {
  border-top: 4px solid #2563eb;
}

.admin-label {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 8px;
  display: block;
}

.admin-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  color: #111827;
  font-size: 14px;
}

.admin-input-icon {
  position: absolute;
  left: 12px;
  top: 10px;
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.admin-filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.admin-members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.admin-member-card {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s;
}

.admin-member-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.admin-member-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.admin-member-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.admin-member-id {
  font-size: 14px;
  color: #6b7280;
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
  color: #15803d;
}

.admin-status-badge--expired {
  background-color: #fee2e2;
  color: #dc2626;
}

.admin-member-info {
  font-size: 14px;
  color: #111827;
  margin-bottom: 12px;
}

.admin-member-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.admin-member-balance {
  font-weight: 500;
}

.admin-member-card-actions {
  margin-top: 12px;
}

.admin-btn {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.admin-btn--primary {
  background-color: #2563eb;
  color: #fff;
}

.admin-btn--primary:hover {
  background-color: #1d4ed8;
}

.admin-btn--block {
  width: 100%;
}

.admin-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.admin-pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.admin-pagination-controls {
  display: flex;
  gap: 8px;
}

.admin-btn--pagination {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.admin-btn--pagination:hover {
  background-color: #f1f5f9;
}

.admin-btn--active {
  background-color: #2563eb;
  color: #fff;
}
</style>