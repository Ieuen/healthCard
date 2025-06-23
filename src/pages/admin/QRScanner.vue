<template>
  <div class="qr-root">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Navigation -->
      <header class="qr-header">
        <h1 class="qr-title">QR Code Scanner</h1>
        <div class="qr-header-actions">
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
      </header>

      <!-- Scanner Content -->
      <main class="qr-content">
        <section class="qr-section qr-section--scanner">
          <h2 class="qr-section-title">Scan Member QR Code</h2>
          <p class="qr-section-desc">Position the QR code within the frame to scan</p>
          <!-- Scanner Frame -->
          <div class="qr-scanner-frame">
            <video ref="videoRef" class="qr-scanner-feed" autoplay muted playsinline></video>
          </div>
          <!-- Scanner Actions -->
          <div class="qr-scanner-actions">
            <button class="qr-btn qr-btn--primary" @click="startCamera">
              <Camera class="icon--sidebar" />
              Start Camera
            </button>
            <button class="qr-btn" @click="stopCamera">
              Stop Camera
            </button>
          </div>
          <!-- Scanner Status -->
          <div class="qr-scanner-status">
            {{ scannerStatus }}
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { 
  Bell, 
  Sun, 
  LogOut,
  Camera
} from 'lucide-vue-next'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../services/firebase'
import { logout } from '../../services/auth'
import { useRouter } from 'vue-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { ref, onUnmounted } from 'vue'
import AdminSidebar from '@/components/AdminSidebar.vue'
import QrScanner from 'qr-scanner' // npm install qr-scanner

const adminName = ref('')
onAuthStateChanged(auth, (user) => {
  if (user) {
    adminName.value = user.email ? user.email.split('@')[0] : 'Admin'
  }
})

const router = useRouter()
const scannerStatus = ref('Ready to scan. Please position a QR code in front of the camera.')

const videoRef = ref(null)
let qrScannerInstance = null

function startCamera() {
  scannerStatus.value = 'Starting camera...'
  if (qrScannerInstance) {
    qrScannerInstance.start()
    scannerStatus.value = 'Camera started. Ready to scan QR code.'
    return
  }
  if (videoRef.value) {
    qrScannerInstance = new QrScanner(
      videoRef.value,
      result => onQrScan(result),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    )
    qrScannerInstance.start()
    scannerStatus.value = 'Camera started. Ready to scan QR code.'
  }
}

function stopCamera() {
  if (qrScannerInstance) {
    qrScannerInstance.stop()
    scannerStatus.value = 'Camera stopped.'
  }
}

async function onQrScan(result) {
  scannerStatus.value = `QR Code detected: ${result.data}`
  let refValue = null

  // Try to parse as JSON first (legacy QR codes)
  try {
    const parsed = JSON.parse(result.data)
    if (parsed && parsed.ref) {
      refValue = parsed.ref
    }
  } catch (e) {
    // Not JSON, try to parse as URL
    try {
      let url
      if (result.data.startsWith('http')) {
        url = new URL(result.data)
      } else if (result.data.startsWith('/')) {
        url = new URL(window.location.origin + result.data)
      }
      if (url) {
        refValue = url.searchParams.get('ref')
      }
    } catch (err) {
      // Not a valid URL either
    }
  }

  if (refValue) {
    // Look up member by reference number
    const q = query(collection(db, 'members'), where('referenceNumber', '==', refValue))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const docId = snap.docs[0].id
      router.push({ name: 'MemberProfileAdminPage', params: { id: docId } })
      return
    } else {
      scannerStatus.value = 'No member found for this QR code.'
      return
    }
  }

  scannerStatus.value = 'Invalid QR code format or no reference number found.'
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.qr-root {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.qr-sidebar {
  width: 256px;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.qr-logo {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.qr-logo-icon {
  width: 32px;
  height: 32px;
  background-color: #2563eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.qr-logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.qr-nav {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qr-nav-link {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.qr-nav-link:hover {
  background-color: #f1f5f9;
}

.qr-nav-link--active {
  background-color: #2563eb;
  color: #ffffff;
}

.icon--sidebar {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.qr-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qr-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.qr-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-header-btn {
  background: none;
  border: none;
  color: #374151;
  cursor: pointer;
  transition: color 0.2s;
}

.admin-header-btn:hover {
  color: #2563eb;
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

.qr-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.qr-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.qr-section--scanner {
  max-width: 700px;
  min-width: 320px;
  width: 100%;
  margin: 40px auto 0 auto;
  padding: 40px 32px;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .qr-section.qr-section--scanner {
    max-width: 98vw;
    padding: 24px 8px;
    margin: 24px auto 0 auto;
  }
}

.qr-section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.qr-section-desc {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

.qr-scanner-frame {
  position: relative;
  width: 100%;
  max-width: 420px;
  min-width: 220px;
  aspect-ratio: 1 / 1;
  min-height: 220px;
  margin: 0 auto 24px;
  background: #f1f5f9;
  border-radius: 16px;
  border: 2px dashed #2563eb;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 700px) {
  .qr-scanner-frame {
    max-width: 90vw;
    min-height: 160px;
  }
}

.qr-scanner-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #f1f5f9;
  display: block;
  /* Remove border and border-radius here */
  border: none;
  border-radius: 0;
}

.qr-scan-icon {
  width: 64px;
  height: 64px;
  color: #2563eb;
  margin-bottom: 16px;
}

.qr-scan-placeholder {
  font-size: 14px;
  color: #6b7280;
}

.qr-scanner-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.qr-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.qr-btn--primary {
  background-color: #2563eb;
  color: #ffffff;
}

.qr-btn--primary:hover {
  background-color: #1d4ed8;
}

.qr-scanner-status {
  background-color: #eff6ff;
  border: 1px solid #2563eb;
  border-radius: 8px;
  padding: 12px;
  color: #2563eb;
  font-size: 14px;
}

.qr-section--recent {
  padding-top: 0;
}

.qr-section-subtitle {
  font-size: 18px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 16px;
}

.qr-recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qr-recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.qr-recent-item:hover {
  background-color: #f1f5f9;
}

.qr-recent-avatar {
  width: 40px;
  height: 40px;
  background-color: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.qr-recent-avatar-icon {
  width: 20px;
  height: 20px;
  color: #374151;
}

.qr-recent-info {
  flex: 1;
}

.qr-recent-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.qr-recent-meta {
  font-size: 12px;
  color: #6b7280;
}

.qr-recent-view {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.qr-recent-view:hover {
  color: #1d4ed8;
}
</style>