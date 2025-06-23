<template>
  <div class="admin-root">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <div class="admin-main">
      <!-- Top Navigation -->
      <header class="admin-header">
        <div class="admin-header-inner">
          <h1 class="admin-title">Reports</h1>
          <div class="admin-header-actions">
            <button class="admin-header-btn admin-header-btn--notif">
              <Bell class="admin-header-icon" />
              <span class="admin-header-notif-dot"></span>
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

      <!-- Reports Content -->
      <main class="admin-content">
        <!-- Filters -->
        <div class="admin-card admin-card--filters">
          <h3 class="admin-card-title">Search & Filters</h3>
          <div class="admin-filters-grid">
            <div>
              <label class="admin-label">Search</label>
              <div class="admin-input-icon-wrap">
                <Search class="admin-input-icon" />
                <input
                  v-model="search"
                  type="text"
                  placeholder="ID Number, Reference Number, or Last Name"
                  class="admin-input admin-input--with-icon"
                />
              </div>
            </div>
            <div>
              <label class="admin-label">Status Filter</label>
              <select v-model="statusFilter" class="admin-input">
                <option value="">All Members</option>
                <option value="active">Funded Members</option>
                <option value="expired">Expired Membership</option>
                <option value="low_balance">Low Balance</option>
                <option value="exhausted">Exhausted Balance</option>
              </select>
            </div>
            <div>
              <label class="admin-label">Date Range</label>
              <input v-model="dateFilter" type="date" class="admin-input" />
            </div>
          </div>
          <div class="admin-filters-actions">
            <button class="admin-btn admin-btn--primary" @click="applyFilters">
              Apply Filters
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="admin-summary-cards">
          <div class="admin-summary-card admin-summary-card--expired">
            <div>
              <p class="admin-summary-label">Expired Members</p>
              <p class="admin-summary-value admin-summary-value--red">{{ expiredCount }}</p>
            </div>
            <AlertTriangle class="admin-summary-icon admin-summary-icon--red" />
          </div>
          <div class="admin-summary-card admin-summary-card--low">
            <div>
              <p class="admin-summary-label">Low Balance</p>
              <p class="admin-summary-value admin-summary-value--yellow">{{ lowBalanceCount }}</p>
            </div>
            <AlertCircle class="admin-summary-icon admin-summary-icon--yellow" />
          </div>
          <div class="admin-summary-card admin-summary-card--exhausted">
            <div>
              <p class="admin-summary-label">Exhausted Balance</p>
              <p class="admin-summary-value admin-summary-value--red">{{ exhaustedCount }}</p>
            </div>
            <XCircle class="admin-summary-icon admin-summary-icon--red" />
          </div>
          <div class="admin-summary-card admin-summary-card--active">
            <div>
              <p class="admin-summary-label">Funded Members</p>
              <p class="admin-summary-value admin-summary-value--green">{{ activeCount }}</p>
            </div>
            <CheckCircle class="admin-summary-icon admin-summary-icon--green" />
          </div>
        </div>

        <!-- Reports Table -->
        <div class="admin-card">
          <div class="admin-card-header">
            <h3 class="admin-card-title">Member Reports</h3>
            <button class="admin-btn admin-btn--success" @click="exportCSV">
              <Download class="admin-btn-icon" />
              Export CSV
            </button>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Member Info</th>
                  <th>Status</th>
                  <th>Balance</th>
                  <th>Membership</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in paginatedMembers" :key="m.id">
                  <td>
                    <div>
                      <div class="admin-table-member-name">{{ m.lastName }}, {{ m.firstName }} {{ m.middleName }}</div>
                      <div class="admin-table-member-id">ID: {{ m.idNumber }}</div>
                      <div class="admin-table-member-id">Ref: {{ m.referenceNumber }}</div>
                    </div>
                  </td>
                  <td>
                    <span v-if="isExpired(m.expiryDate)" class="admin-status-badge admin-status-badge--expired">
                      Expired
                    </span>
                    <span v-else-if="m.balance === 0" class="admin-status-badge admin-status-badge--expired">
                      Exhausted
                    </span>
                    <span v-else-if="m.balance > 0 && m.balance <= 1000" class="admin-status-badge admin-status-badge--low">
                      Low Balance
                    </span>
                    <span v-else class="admin-status-badge admin-status-badge--active">
                      Funded
                    </span>
                  </td>
                  <td>₱{{ m.balance?.toLocaleString() ?? '0' }}</td>
                  <td>
                    <span v-if="isExpired(m.expiryDate)">
                      Expired: {{ formatDate(m.expiryDate) }}
                    </span>
                    <span v-else>
                      Expires: {{ formatDate(m.expiryDate) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="paginatedMembers.length === 0">
                  <td colspan="4" class="text-center py-6 text-slate-500 dark:text-slate-400">No members found.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="admin-table-pagination">
            <div class="admin-table-pagination-info">
              Showing {{ startItem + 1 }} to {{ endItem }} of {{ filteredMembers.length }} results
            </div>
            <div class="admin-table-pagination-controls">
              <button class="admin-btn admin-btn--pagination" :disabled="currentPage === 1" @click="prevPage">Previous</button>
              <button
                v-for="page in totalPages"
                :key="page"
                class="admin-btn admin-btn--pagination"
                :class="{ 'admin-btn--active': currentPage === page }"
                @click="goToPage(page)"
              >{{ page }}</button>
              <button class="admin-btn admin-btn--pagination" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { 
  Bell, 
  Sun, 
  LogOut, 
  Search,
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle,
  Download
} from 'lucide-vue-next'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../services/firebase'
import { logout } from '../../services/auth'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { collection, getDocs } from 'firebase/firestore'

const adminName = ref('')
onAuthStateChanged(auth, (user) => {
  if (user) {
    adminName.value = user.email ? user.email.split('@')[0] : 'Admin'
  }
})

const router = useRouter()
const members = ref([])
const search = ref('')
const statusFilter = ref('')
const dateFilter = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

const fetchMembers = async () => {
  const snapshot = await getDocs(collection(db, 'members'))
  members.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  updateSummaryCounts()
}

function isExpired(expiryDate) {
  if (!expiryDate) return false
  const now = new Date()
  const exp = expiryDate.seconds
    ? new Date(expiryDate.seconds * 1000)
    : new Date(expiryDate)
  return exp < now
}

function formatDate(expiryDate) {
  if (!expiryDate) return ''
  const date = expiryDate.seconds
    ? new Date(expiryDate.seconds * 1000)
    : new Date(expiryDate)
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

const expiredCount = ref(0)
const lowBalanceCount = ref(0)
const exhaustedCount = ref(0)
const activeCount = ref(0)

function updateSummaryCounts() {
  expiredCount.value = members.value.filter(m => isExpired(m.expiryDate)).length
  lowBalanceCount.value = members.value.filter(m => m.balance > 0 && m.balance <= 1000 && !isExpired(m.expiryDate)).length
  exhaustedCount.value = members.value.filter(m => m.balance === 0 && !isExpired(m.expiryDate)).length
  activeCount.value = members.value.filter(m => !isExpired(m.expiryDate) && m.balance > 1000).length
}

const filteredMembers = computed(() => {
  let filtered = members.value
  if (search.value) {
    const s = search.value.toLowerCase()
    filtered = filtered.filter(m =>
      (m.idNumber && m.idNumber.toLowerCase().includes(s)) ||
      (m.referenceNumber && m.referenceNumber.toLowerCase().includes(s)) ||
      (m.lastName && m.lastName.toLowerCase().includes(s))
    )
  }
  if (statusFilter.value) {
    if (statusFilter.value === 'active') {
      filtered = filtered.filter(m => !isExpired(m.expiryDate) && m.balance > 1000)
    } else if (statusFilter.value === 'expired') {
      filtered = filtered.filter(m => isExpired(m.expiryDate))
    } else if (statusFilter.value === 'low_balance') {
      filtered = filtered.filter(m => m.balance > 0 && m.balance <= 1000 && !isExpired(m.expiryDate))
    } else if (statusFilter.value === 'exhausted') {
      filtered = filtered.filter(m => m.balance === 0 && !isExpired(m.expiryDate))
    }
  }
  if (dateFilter.value) {
    filtered = filtered.filter(m => {
      const date = m.expiryDate?.seconds
        ? new Date(m.expiryDate.seconds * 1000)
        : new Date(m.expiryDate)
      return date.toISOString().slice(0, 10) === dateFilter.value
    })
  }
  return filtered
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage))
const startItem = computed(() => (currentPage.value - 1) * itemsPerPage)
const endItem = computed(() => Math.min(startItem.value + itemsPerPage, filteredMembers.value.length))
const paginatedMembers = computed(() =>
  filteredMembers.value.slice(startItem.value, endItem.value)
)

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function goToPage(page) {
  currentPage.value = page
}

function applyFilters() {
  currentPage.value = 1
  updateSummaryCounts()
}

// CSV Export
function exportCSV() {
  const rows = [
    ['Last Name', 'First Name', 'Middle Name', 'ID Number', 'Reference Number', 'Balance', 'Expiry Date', 'Status'],
    ...filteredMembers.value.map(m => [
      m.lastName,
      m.firstName,
      m.middleName,
      m.idNumber,
      m.referenceNumber,
      m.balance,
      formatDate(m.expiryDate),
      isExpired(m.expiryDate)
        ? 'Expired'
        : m.balance === 0
        ? 'Exhausted'
        : m.balance > 0 && m.balance <= 1000
        ? 'Low Balance'
        : 'Active'
    ])
  ]
  const csvContent = rows.map(e => e.map(a => `"${a ?? ''}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'member-reports.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

onMounted(fetchMembers)
</script>

<style scoped>
.admin-root {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.admin-sidebar {
  width: 256px;
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
  padding: 24px 16px;
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
  color: #374151;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.admin-nav-link:hover {
  background-color: #f1f5f9;
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
  font-size: 24px;
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
  position: relative;
}

.admin-header-btn--notif .admin-header-icon {
  position: relative;
}

.admin-header-notif-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
}

.admin-header-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-header-avatar {
  width: 32px;
  height: 32px;
  background-color: #d1d5db;
  border-radius: 50%;
}

.admin-header-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.admin-content {
  padding: 24px;
  flex: 1;
}

.admin-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  margin-bottom: 16px;
}

.admin-card--filters {
  border-top: 4px solid #2563eb;
}

.admin-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.admin-filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .admin-filters-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.admin-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.admin-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  color: #111827;
  font-size: 14px;
}

.admin-input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.admin-input--with-icon {
  padding-left: 40px;
}

.admin-filters-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.admin-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
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

.admin-summary-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .admin-summary-cards {
    grid-template-columns: repeat(4, 1fr);
  }
}

.admin-summary-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-summary-card--expired {
  border-top: 4px solid #ef4444;
}

.admin-summary-card--low {
  border-top: 4px solid #f59e0b;
}

.admin-summary-card--exhausted {
  border-top: 4px solid #ef4444;
}

.admin-summary-card--active {
  border-top: 4px solid #22c55e;
}

.admin-summary-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.admin-summary-value {
  font-size: 24px;
  font-weight: 700;
}

.admin-summary-value--red {
  color: #ef4444;
}

.admin-summary-value--yellow {
  color: #f59e0b;
}

.admin-summary-value--green {
  color: #22c55e;
}

.admin-summary-icon {
  width: 32px;
  height: 32px;
}

.admin-table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background-color: #f9fafb;
}

.admin-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #111827;
  border-top: 1px solid #e5e7eb;
}

.admin-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.admin-status-badge--expired {
  background-color: #fee2e2;
  color: #ef4444;
}

.admin-status-badge--low {
  background-color: #fef9c3;
  color: #f59e0b;
}

.admin-status-badge--active {
  background-color: #d1fae5;
  color: #22c55e;
}

.admin-link {
  font-size: 14px;
  font-weight: 500;
  color: #2563eb;
  cursor: pointer;
  transition: color 0.2s;
}

.admin-link:hover {
  color: #1d4ed8;
}

.admin-btn-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.admin-table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.admin-table-pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.admin-table-pagination-controls {
  display: flex;
  gap: 8px;
}

.admin-btn--pagination {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #2563eb;
  background-color: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.admin-btn--pagination:hover {
  background-color: #e2e8f0;
}

.admin-btn--active {
  background-color: #2563eb;
  color: #fff;
}
</style>