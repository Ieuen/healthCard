<template>
  <div class="admin-root">
    <AdminSidebar />
    <div class="admin-main">
      <!-- Top Navigation -->
      <header class="admin-header">
        <div class="admin-header-inner">
          <h1 class="admin-title">Dashboard</h1>
          <div class="admin-header-actions">
            <!-- Notifications -->
            <button
              class="admin-header-btn admin-header-btn--notif"
              @click="showNotifModal = true"
            >
              <Bell class="admin-header-icon" />
              <span class="admin-header-notif-dot"></span>
            </button>
            <!-- Theme Toggle -->
            <button class="admin-header-btn">
              <Sun class="admin-header-icon" />
            </button>
            <!-- Profile -->
            <div class="admin-header-profile">
              <div class="admin-header-avatar"></div>
              <span class="admin-header-name">{{ adminName }}</span>
            </div>
            <!-- Logout -->
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

      <!-- Notification Modal -->
      <div v-if="showNotifModal" class="notif-modal-overlay" @click.self="showNotifModal = false">
        <div class="notif-modal">
          <div class="notif-modal-header">
            <h2>Notifications</h2>
            <button class="notif-modal-close" @click="showNotifModal = false">&times;</button>
          </div>
          <div class="notif-modal-body">
            <div v-if="loadingNotifications" class="text-slate-500">Loading...</div>
            <div v-else>
              <div v-if="notifications.length === 0" class="text-slate-500 text-sm">
                No notifications.
              </div>
              <ul v-else>
                <li v-for="notif in notifications" :key="notif.id" class="notif-item">
                  <div :class="['notif-dot', notif.type === 'expired' ? 'notif-dot--red' : 'notif-dot--yellow']"></div>
                  <div>
                    <div class="notif-title">{{ notif.title }}</div>
                    <div class="notif-meta">{{ notif.message }}</div>
                    <div class="notif-date">{{ formatDate(notif.createdAt) }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <!-- End Notification Modal -->

      <!-- Dashboard Content -->
      <main class="admin-content">
        <!-- Stats Cards -->
        <div class="admin-stats">
          <div class="admin-stat-card">
            <div class="admin-stat-card-inner">
              <div>
                <p class="admin-stat-label">Total Members</p>
                <p class="admin-stat-value">{{ totalMembers }}</p>
              </div>
              <div class="admin-stat-icon admin-stat-icon--blue">
                <Users class="admin-stat-svg admin-stat-svg--blue" />
              </div>
            </div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-card-inner">
              <div>
                <p class="admin-stat-label">Active Members</p>
                <p class="admin-stat-value">{{ activeMembers }}</p>
              </div>
              <div class="admin-stat-icon admin-stat-icon--green">
                <UserCheck class="admin-stat-svg admin-stat-svg--green" />
              </div>
            </div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-card-inner">
              <div>
                <p class="admin-stat-label">Expired Members</p>
                <p class="admin-stat-value">{{ expiredMembers }}</p>
              </div>
              <div class="admin-stat-icon admin-stat-icon--yellow">
                <AlertTriangle class="admin-stat-svg admin-stat-svg--yellow" />
              </div>
            </div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-card-inner">
              <div>
                <p class="admin-stat-label">Total Claims</p>
                <p class="admin-stat-value">₱{{ totalClaims.toLocaleString() }}</p>
              </div>
              <div class="admin-stat-icon admin-stat-icon--purple">
                <PhilippinePeso class="admin-stat-svg admin-stat-svg--purple" />
              </div>
            </div>
          </div>
        </div>

        <!-- Charts and Recent Activity -->
        <div class="admin-charts-activity">
          <!-- Looker Studio Dashboard -->
          <div class="admin-card">
            <h3 class="admin-card-title">Analytics Dashboard</h3>
            <div class="admin-card-chart" style="padding:0; height:auto; min-height:650px;">
              <iframe
                width="100%"
                height="650"
                src="https://lookerstudio.google.com/embed/reporting/73cb7b06-bb74-4d47-ae30-4a4d593a02c8/page/gtsOF"
                frameborder="0"
                style="border:0; width:100%; min-height:650px; display:block;"
                allowfullscreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              ></iframe>
            </div>
          </div>

          <!-- Recent Activities -->
          <div class="admin-card">
            <h3 class="admin-card-title">Recent Activities</h3>
            <div class="admin-activity-list">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="admin-activity-item"
              >
                <div :class="['admin-activity-dot', activity.colorClass]"></div>
                <div class="admin-activity-info">
                  <p class="admin-activity-title">{{ activity.title }}</p>
                  <p class="admin-activity-meta">{{ activity.meta }}</p>
                </div>
              </div>
              <div v-if="recentActivities.length === 0" class="text-slate-500 text-sm">
                No recent activities.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  Bell, 
  Sun, 
  LogOut, 
  UserCheck, 
  AlertTriangle, 
  PhilippinePeso, 
  BarChart3, 
  Users 
} from 'lucide-vue-next'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../services/firebase'
import { logout } from '../../services/auth'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { collection, getDocs, query, orderBy, addDoc, where } from 'firebase/firestore'

const adminName = ref('')
onAuthStateChanged(auth, (user) => {
  if (user) {
    adminName.value = user.email ? user.email.split('@')[0] : 'Admin'
  }
})

const router = useRouter()

// Dashboard stats
const totalMembers = ref(0)
const activeMembers = ref(0)
const expiredMembers = ref(0)
const totalClaims = ref(0)
const recentActivities = ref([])

function isExpired(expiryDate) {
  if (!expiryDate) return false
  const now = new Date()
  const exp = expiryDate.seconds
    ? new Date(expiryDate.seconds * 1000)
    : new Date(expiryDate)
  return exp < now
}

function formatDate(date) {
  if (!date) return ''
  const d = date.seconds
    ? new Date(date.seconds * 1000)
    : new Date(date)
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const fetchDashboardStats = async () => {
  // Fetch members
  const membersSnap = await getDocs(collection(db, 'members'))
  const members = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  totalMembers.value = members.length
  expiredMembers.value = members.filter(m => isExpired(m.expiryDate)).length
  activeMembers.value = members.filter(m => !isExpired(m.expiryDate) && (m.balance ?? 0) > 0).length

  // Fetch total claims
  let claimsSum = 0
  let activities = []
  const claimsSnap = await getDocs(query(collection(db, 'ClaimedServices'), orderBy('date', 'desc')))
  claimsSnap.forEach(doc => {
    const data = doc.data()
    claimsSum += Number(data.amount) || 0
    // For recent activities
    activities.push({
      id: doc.id,
      type: 'claim',
      title: `Service claim processed`,
      meta: `${data.memberName || data.memberLastName || ''} - ${data.serviceType || ''} - ${formatDate(data.date)}`,
      colorClass: 'admin-activity-dot--blue'
    })
  })
  totalClaims.value = claimsSum

  // Add recent member registrations to activities
  const recentMembers = members
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 5)
    .map(m => ({
      id: m.id,
      type: 'register',
      title: 'New member registered',
      meta: `${m.firstName} ${m.lastName} - ${m.createdAt ? timeAgo(m.createdAt) : ''}`,
      colorClass: 'admin-activity-dot--green'
    }))

  // Add low balance and expired activities
  const lowBalance = members
    .filter(m => !isExpired(m.expiryDate) && m.balance > 0 && m.balance <= 1000)
    .map(m => ({
      id: m.id + '-low',
      type: 'low_balance',
      title: 'Member balance low',
      meta: `${m.firstName} ${m.lastName} - ₱${m.balance?.toLocaleString()} remaining`,
      colorClass: 'admin-activity-dot--yellow'
    }))
  const expired = members
    .filter(m => isExpired(m.expiryDate))
    .map(m => ({
      id: m.id + '-expired',
      type: 'expired',
      title: 'Membership expired',
      meta: `${m.firstName} ${m.lastName}`,
      colorClass: 'admin-activity-dot--red'
    }))

  // Combine and sort activities (latest first, max 10)
  activities = [
    ...recentMembers,
    ...activities.slice(0, 5),
    ...lowBalance.slice(0, 2),
    ...expired.slice(0, 2)
  ].sort((a, b) => (b.meta?.date || 0) - (a.meta?.date || 0)).slice(0, 10)

  recentActivities.value = activities
}

// Helper for "x minutes ago"
function timeAgo(date) {
  const now = new Date()
  const d = date.seconds
    ? new Date(date.seconds * 1000)
    : new Date(date)
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const showNotifModal = ref(false)
const notifications = ref([])
const loadingNotifications = ref(false)

// Helper to check if notification already exists for a member+type
async function notificationExists(memberId, type) {
  const notifSnap = await getDocs(
    query(
      collection(db, 'Notifications'),
      where('memberId', '==', memberId),
      where('type', '==', type)
    )
  )
  return !notifSnap.empty
}

// Helper to create notification
async function createNotification({ memberId, type, title, message }) {
  await addDoc(collection(db, 'Notifications'), {
    memberId,
    type,
    title,
    message,
    createdAt: new Date()
  })
}

// Check members and create notifications if needed
async function checkAndCreateMemberNotifications() {
  const membersSnap = await getDocs(collection(db, 'members'))
  const members = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  const now = new Date()

  for (const m of members) {
    // Check expired
    let expired = false
    if (m.expiryDate) {
      const exp = m.expiryDate.seconds
        ? new Date(m.expiryDate.seconds * 1000)
        : new Date(m.expiryDate)
      expired = exp < now
    }
    if (expired) {
      const exists = await notificationExists(m.id, 'expired')
      if (!exists) {
        await createNotification({
          memberId: m.id,
          type: 'expired',
          title: 'Membership Expired',
          message: `${m.firstName} ${m.lastName}'s membership has expired.`
        })
      }
    }
    // Check exhausted balance
    if ((m.balance ?? 0) <= 0) {
      const exists = await notificationExists(m.id, 'exhausted')
      if (!exists) {
        await createNotification({
          memberId: m.id,
          type: 'exhausted',
          title: 'Balance Exhausted',
          message: `${m.firstName} ${m.lastName} has exhausted their balance.`
        })
      }
    }
  }
}

// Fetch notifications from Firestore
const fetchNotifications = async () => {
  loadingNotifications.value = true
  // Step 1: Check members and create notifications if needed
  await checkAndCreateMemberNotifications()
  // Step 2: Fetch notifications
  const notifSnap = await getDocs(
    query(collection(db, 'Notifications'), orderBy('createdAt', 'desc'))
  )
  notifications.value = notifSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  loadingNotifications.value = false
}

// Watch for modal open to fetch notifications
watch(showNotifModal, (open) => {
  if (open) fetchNotifications()
})

onMounted(fetchDashboardStats)
</script>

<style scoped>
.admin-root {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #111827;
}

.admin-main {
  margin-left: 256px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding-top: 80px; /* match the header height */
}

.admin-header {
  position: fixed;
  top: 0;
  left: 256px;
  right: 0;
  height: 64px;
  z-index: 50;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  padding: 0; /* remove default padding */
}

.admin-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-left: 0.5rem; /* very minimal left space */
  padding-right: 2rem;
}


.admin-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  padding: 0;
  padding-left: 1rem; /* = 16px */

}


/* Right-side header actions */
.admin-header-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.admin-header-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  border-radius: 0.375rem;
}

.admin-header-btn:hover {
  background-color: #f3f4f6;
}

.admin-header-btn--notif {
  position: relative;
}

.admin-header-notif-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
}

/* Profile display */
.admin-header-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid #e5e7eb;
}

.admin-header-avatar {
  width: 32px;
  height: 32px;
  background-color: #d1d5db;
  border-radius: 9999px;
}

.admin-header-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}


.admin-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.admin-stat-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-stat-card-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.admin-stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.admin-stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.admin-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-stat-icon--blue {
  background-color: #eff6ff;
}

.admin-stat-icon--green {
  background-color: #f0fdf4;
}

.admin-stat-icon--yellow {
  background-color: #fefce8;
}

.admin-stat-icon--purple {
  background-color: #f5f3ff;
}

.admin-charts-activity {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.admin-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.admin-card-chart {
  height: 240px;
  background-color: #f9fafb;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-card-chart-inner {
  text-align: center;
}

.admin-card-chart-icon {
  width: 48px;
  height: 48px;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.admin-card-chart-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.admin-card-chart-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

.admin-activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.admin-activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.admin-activity-dot--green {
  background-color: #22c55e;
}

.admin-activity-dot--blue {
  background-color: #3b82f6;
}

.admin-activity-dot--yellow {
  background-color: #f59e0b;
}

.admin-activity-dot--red {
  background-color: #ef4444;
}

.admin-activity-info {
  flex: 1;
}

.admin-activity-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.admin-activity-meta {
  font-size: 0.75rem;
  color: #6b7280;
}

.notif-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.notif-modal {
  background: #fff;
  border-radius: 0.5rem;
  margin: 2rem 2rem 0 0;
  min-width: 340px;
  max-width: 400px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  padding: 1rem 0 1rem 0;
}
.notif-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem 0.5rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.notif-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
}
.notif-modal-body {
  max-height: 350px;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.notif-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 0.4rem;
}
.notif-dot--red {
  background: #ef4444;
}
.notif-dot--yellow {
  background: #f59e0b;
}
.notif-title {
  font-weight: 600;
  color: #111827;
  font-size: 0.95rem;
}
.notif-meta {
  color: #6b7280;
  font-size: 0.85rem;
}
.notif-date {
  color: #9ca3af;
  font-size: 0.75rem;
}
</style>