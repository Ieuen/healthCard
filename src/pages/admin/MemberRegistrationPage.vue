<template>
  <div class="admin-root">
    <!-- Alert Pop-up -->
    <transition name="fade">
      <div
        v-if="success || error"
        class="alert-popup"
        :class="success ? 'alert-success' : 'alert-error'"
      >
        <span>{{ success || error }}</span>
        <button class="alert-close" @click="closeAlert">&times;</button>
      </div>
    </transition>
    <!-- Sidebar -->
    <AdminSidebar />
    <!-- Main Content -->
    <div class="admin-main">
      <!-- Top Navigation -->
      <header class="admin-header">
        <div class="admin-header-inner">
          <h1 class="admin-title">Member Registration</h1>
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
      <!-- Loader Overlay (place here, before main content) -->
      <div v-if="isLoading" class="loader-overlay">
        <div class="wrapper">
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="shadow"></div>
          <div class="shadow"></div>
          <div class="shadow"></div>
        </div>
        <div class="loader-text">Registering member, please wait...</div>
      </div>
      <!-- Registration Form -->
      <main class="admin-content">
        <!-- (Remove the old inline alerts here) -->
        <div class="admin-form-container">
          <div class="admin-card">
            <form class="admin-form" @submit="handleRegisterMember" :style="{ pointerEvents: isLoading ? 'none' : 'auto', opacity: isLoading ? 0.5 : 1 }">
              <!-- Personal Information -->
              <div>
                <h3 class="admin-section-title">Personal Information</h3>
                <div class="admin-grid admin-grid--3">
                  <div>
                    <label class="admin-label">ID Number *</label>
                    <input
                      type="text"
                      v-model="idNumber"
                      required
                      @input="onIdNumberInput"
                      class="admin-input"
                      placeholder="Enter member ID number"
                    />
                    <p class="admin-input-helper">Assigned by admin</p>
                  </div>
                  <div>
                    <label class="admin-label">Last Name *</label>
                    <input
                      type="text"
                      v-model="lastName"
                      class="admin-input"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label class="admin-label">First Name *</label>
                    <input
                      type="text"
                      v-model="firstName"
                      placeholder="Enter first name"
                      title="First Name"
                      class="admin-input"
                    />
                  </div>
                  <div>
                    <label class="admin-label">Middle Name *</label>
                    <input
                      type="text"
                      v-model="middleName"
                      class="admin-input"
                      placeholder="Enter middle name"
                    />
                  </div>
                  <div>
                    <label class="admin-label">Maiden Name</label>
                    <input
                      type="text"
                      v-model="maidenName"
                      class="admin-input"
                      placeholder="Enter maiden name (optional)"
                    />
                  </div>
                  <div>
                    <label class="admin-label">Reference Number</label>
                    <input
                      type="text"
                      :value="referenceNumber"
                      readonly
                      class="admin-input admin-input--readonly"
                      @focus="generateAndSetReferenceNumber"
                      placeholder="Reference number will be generated"
                    />
                    <p class="admin-input-helper">System-generated after assigning ID number</p>
                  </div>
                </div>
              </div>
              <!-- Address Information -->
              <div>
                <h3 class="admin-section-title">Address Information</h3>
                <div class="admin-grid admin-grid--2">
                  <div>
                    <label class="admin-label">House Number/Street</label>
                    <input
                      type="text"
                      v-model="houseStreet"
                      class="admin-input"
                      placeholder="Enter house number/street (optional)"
                    />
                  </div>
                  <div>
                    <label class="admin-label">Barangay *</label>
                    <select v-model="barangay" required class="admin-input" title="Barangay">
                      <option value="">Select Barangay</option>
                      <option v-for="b in barangays" :key="b" :value="b">{{ b }}</option>
                    </select>
                  </div>
                  <div class="admin-grid-item-full">
                    <label class="admin-label">Complete Address</label>
                    <input
                      type="text"
                      :value="completeAddress"
                      readonly
                      class="admin-input admin-input--readonly"
                    />
                    <p class="admin-input-helper">Auto-generated from above fields</p>
                  </div>
                </div>
              </div>
              <!-- Demographics -->
              <div>
                <h3 class="admin-section-title">Demographics</h3>
                <div class="admin-grid admin-grid--3">
                  <div>
                    <label class="admin-label">Gender *</label>
                    <select v-model="gender" class="admin-input">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label class="admin-label">Date of Birth *</label>
                    <input
                      type="date"
                      v-model="dob"
                      class="admin-input"
                    />
                  </div>
                  <div>
                    <label class="admin-label">Civil Status *</label>
                    <select v-model="civilStatus" class="admin-input">
                      <option value="">Select civil status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                </div>
              </div>
              <!-- Contact Information -->
              <div>
                <h3 class="admin-section-title">Contact Information</h3>
                <div>
                  <label class="admin-label">Phone Number *</label>
                  <input
                    type="tel"
                    v-model="phoneNumber"
                    class="admin-input"
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
              </div>
              <!-- File Uploads -->
              <div>
                <h3 class="admin-section-title">Required Documents</h3>
                <div class="admin-grid admin-grid--2">
                  <div>
                    <label class="block cursor-pointer">
                      <div class="admin-file-upload">
                        <Camera class="admin-file-icon" />
                        <p class="admin-file-text">Click to upload ID picture</p>
                        <p class="admin-file-helper">PNG, JPG up to 5MB</p>
                        <input type="file" @change="handleIdPictureChange" accept="image/*" required class="hidden" />
                      </div>
                    </label>
                    <span v-if="idPictureFile" class="admin-file-selected">Selected: {{ idPictureFile.name }}</span>
                  </div>
                  <div>
                    <label class="block cursor-pointer">
                      <div class="admin-file-upload">
                        <PenTool class="admin-file-icon" />
                        <p class="admin-file-text">Click to upload e-signature</p>
                        <p class="admin-file-helper">PNG, JPG up to 2MB</p>
                        <input type="file" @change="handleSignatureChange" accept="image/*" required class="hidden" />
                      </div>
                    </label>
                    <span v-if="signatureFile" class="admin-file-selected">Selected: {{ signatureFile.name }}</span>
                  </div>
                </div>
              </div>
              <!-- QR Code Generation Button -->
              <div class="admin-form-actions" style="justify-content: flex-start;">
                <button
                  type="button"
                  class="admin-btn admin-btn--secondary"
                  :disabled="!canGenerateQR"
                  @click="openQrModal"
                >
                  Generate QR Code
                </button>
              </div>
              <!-- Membership Information -->
              <div>
                <h3 class="admin-section-title">Membership Information</h3>
                <div class="admin-card admin-card--info">
                  <div class="admin-grid admin-grid--3">
                    <div>
                      <span class="admin-info-label">Initial Balance:</span>
                      <span class="admin-info-value">₱7,000</span>
                    </div>
                    <div>
                      <span class="admin-info-label">Membership Duration:</span>
                      <span class="admin-info-value">1 Year</span>
                    </div>
                    <div>
                      <span class="admin-info-label">Expiry Date:</span>
                      <span class="admin-info-value">{{ expiryDateDisplay }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Action Buttons -->
              <div class="admin-form-actions">
                <button type="button" class="admin-btn">Cancel</button>
                <button type="submit" class="admin-btn admin-btn--primary">Register Member</button>
              </div>
            </form>
          </div>
        </div>
        <!-- QR Code Modal -->
        <div v-if="showQrModal" class="qr-modal-overlay">
          <div class="qr-modal">
            <h2>Generated QR Code</h2>
            <div v-if="qrCodeDataUrl" class="qr-modal-img">
              <img :src="qrCodeDataUrl" alt="QR Code" style="width: 200px; height: 200px;" />
            </div>
            <div class="qr-modal-actions">
              <button class="admin-btn" @click="downloadQr('png')">Save as PNG</button>
              <button class="admin-btn" @click="downloadQr('jpeg')">Save as JPEG</button>
              <button class="admin-btn" @click="downloadQr('svg')">Save as SVG</button>
              <button class="admin-btn admin-btn--secondary" @click="closeQrModal">Close</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { db, storage, auth } from '../../services/firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { onAuthStateChanged } from 'firebase/auth'
import { 
  HeartHandshake, LayoutDashboard, FileText, UserPlus, Users, QrCode, Bell, Sun, LogOut, Camera, PenTool
} from 'lucide-vue-next'
import QRCode from 'qrcode'
import { logout } from '../../services/auth'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'
import { saveAs } from 'file-saver'

const router = useRouter()

const lastName = ref('')
const firstName = ref('')
const middleName = ref('')
const maidenName = ref('')
const barangay = ref('')
const gender = ref('')
const dob = ref('')
const civilStatus = ref('')
const phoneNumber = ref('')
const idPictureFile = ref(null)
const signatureFile = ref(null)
const error = ref('')
const success = ref('')
const adminUid = ref('')
const adminName = ref('')

const referenceNumber = ref('')
const idNumber = ref('')
const houseStreet = ref('')

// QR Code
const qrCodeDataUrl = ref('')
const qrCodeValue = ref('')

// Sidebar and Header
const showSidebar = ref(true)
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// Get current admin UID for ID Number
onAuthStateChanged(auth, (user) => {
  if (user) {
    adminName.value = user.email ? user.email.split('@')[0] : 'Admin'
    adminUid.value = user.uid
  }
})

// Generate a unique reference number
const generateUniqueReferenceNumber = async () => {
  let unique = false
  let refNum = ''
  while (!unique) {
    // Example: REF-YYYYMMDD-HHMMSS-4DIGITS
    const now = new Date()
    const dateStr = now.toISOString().slice(0,10).replace(/-/g,'')
    const timeStr = now.toTimeString().slice(0,8).replace(/:/g,'')
    const rand = Math.floor(1000 + Math.random() * 9000)
    refNum = `REF-${dateStr}-${timeStr}-${rand}`

    // Check Firestore for existing reference number
    const q = query(collection(db, 'members'), where('referenceNumber', '==', refNum))
    const snapshot = await getDocs(q)
    if (snapshot.empty) unique = true
  }
  return refNum
}

const handleIdPictureChange = (e) => {
  idPictureFile.value = e.target.files[0]
}
const handleSignatureChange = (e) => {
  signatureFile.value = e.target.files[0]
}

const showQrModal = ref(false)
const canGenerateQR = computed(() =>
  idNumber.value && referenceNumber.value && lastName.value && firstName.value && middleName.value && barangay.value && gender.value && dob.value && civilStatus.value && phoneNumber.value
)

const openQrModal = async () => {
  // Use your actual deployed domain in production!
  const publicUrl = `${window.location.origin}/scan?ref=${referenceNumber.value}`
  qrCodeValue.value = publicUrl
  qrCodeDataUrl.value = await QRCode.toDataURL(qrCodeValue.value, { type: 'image/png' })
  showQrModal.value = true
}

const closeQrModal = () => {
  showQrModal.value = false
}

// Download QR as PNG, JPEG, or SVG
const getMemberFileName = () => {
  // Use Lastname_Firstname_Middlename as filename, fallback to referenceNumber if empty
  let name = `${lastName.value}_${firstName.value}_${middleName.value}`.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
  if (!lastName.value || !firstName.value || !middleName.value) {
    name = referenceNumber.value || 'member'
  }
  return name
}

const downloadQr = async (format) => {
  let dataUrl
  const fileName = getMemberFileName()
  if (format === 'svg') {
    dataUrl = await QRCode.toString(qrCodeValue.value, { type: 'svg' })
    const blob = new Blob([dataUrl], { type: 'image/svg+xml' })
    saveAs(blob, `${fileName}.svg`)
  } else {
    dataUrl = await QRCode.toDataURL(qrCodeValue.value, { type: `image/${format}` })
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    saveAs(blob, `${fileName}.${format}`)
  }
}

// Save QR code image to Firebase Storage and Firestore
const uploadQrToStorage = async () => {
  const publicUrl = `${window.location.origin}/scan?ref=${referenceNumber.value}`
  const pngDataUrl = await QRCode.toDataURL(publicUrl, { type: 'image/png' })
  const byteString = atob(pngDataUrl.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
  const file = new Blob([ab], { type: 'image/png' })
  const qrRef = storageRef(storage, `members/qr_codes/${Date.now()}_${referenceNumber.value}.png`)
  await uploadBytes(qrRef, file)
  return await getDownloadURL(qrRef)
}

const handleRegisterMember = async (e) => {
  e.preventDefault()
  error.value = ''
  success.value = ''
  isLoading.value = true // Start loader

  if (!auth.currentUser) {
    error.value = 'You are not authenticated! Please log in again.'
    isLoading.value = false
    return
  }

  try {
    let idPictureUrl = ''
    let signatureUrl = ''
    let qrCodeUrl = ''

    // Upload ID Picture
    if (idPictureFile.value) {
      const idPicRef = storageRef(storage, `members/id_pictures/${Date.now()}_${idPictureFile.value.name}`)
      await uploadBytes(idPicRef, idPictureFile.value)
      idPictureUrl = await getDownloadURL(idPicRef)
    }

    // Upload Signature
    if (signatureFile.value) {
      const sigRef = storageRef(storage, `members/signatures/${Date.now()}_${signatureFile.value.name}`)
      await uploadBytes(sigRef, signatureFile.value)
      signatureUrl = await getDownloadURL(sigRef)
    }

    // Generate unique reference number if not set
    if (!referenceNumber.value) {
      referenceNumber.value = await generateUniqueReferenceNumber()
    }

    // Set expiry date
    const now = new Date()
    const expiryDate = new Date(now)
    expiryDate.setFullYear(now.getFullYear() + 1)

    // Generate QR code value and upload to storage
    qrCodeValue.value = JSON.stringify({
      ref: referenceNumber.value,
      id: idNumber.value,
      type: 'member'
    })
    qrCodeUrl = await uploadQrToStorage()

    // Save member data to Firestore
    await addDoc(collection(db, 'members'), {
      idNumber: idNumber.value,
      lastName: lastName.value,
      firstName: firstName.value,
      middleName: middleName.value,
      maidenName: maidenName.value,
      referenceNumber: referenceNumber.value,
      barangay: barangay.value,
      gender: gender.value,
      dob: dob.value,
      civilStatus: civilStatus.value,
      phoneNumber: phoneNumber.value,
      idPictureUrl: idPictureUrl,
      signatureUrl: signatureUrl,
      qrCodeUrl: qrCodeUrl, // Save QR code URL
      createdAt: now,
      expiryDate: expiryDate,
      completeAddress: completeAddress.value,
      balance: 7000 // Initial balance
    })

    success.value = 'Member registered successfully!'

    // Clear all fields after successful registration
    idNumber.value = ''
    lastName.value = ''
    firstName.value = ''
    middleName.value = ''
    maidenName.value = ''
    referenceNumber.value = ''
    barangay.value = ''
    gender.value = ''
    dob.value = ''
    civilStatus.value = ''
    phoneNumber.value = ''
    idPictureFile.value = null
    signatureFile.value = null
    houseStreet.value = ''
    qrCodeDataUrl.value = ''
    qrCodeValue.value = ''
    // Optionally, close the QR modal if open
    showQrModal.value = false

  } catch (err) {
    error.value = err.message
  }
  isLoading.value = false // Stop loader
}

const generateAndSetReferenceNumber = async () => {
  if (!idNumber.value) {
    referenceNumber.value = ''
    return
  }
  if (!referenceNumber.value) {
    referenceNumber.value = await generateUniqueReferenceNumber()
  }
}

const onIdNumberInput = async () => {
  if (idNumber.value && !referenceNumber.value) {
    referenceNumber.value = await generateUniqueReferenceNumber()
  }
  if (!idNumber.value) {
    referenceNumber.value = ''
  }
}

const completeAddress = computed(() =>
  [houseStreet.value, barangay.value, 'Calapan City'].filter(Boolean).join(', ')
)

const barangays = [
  "Balingayan","Balite","Baruyan","Batino","Bayanan I","Bayanan II","Biga","Bondoc","Bucayao","Buhuan","Bulusan","Calero","Camansihan","Camilmil","Canubing I","Canubing II","Comunal","Guinobatan","Gulod","Gutad","Ibaba East","Ibaba West","Ilaya","Lalud","Lazareto","Libis","Lumangbayan","Mahal Na Pangalan","Maidlang","Malad","Malamig","Managpi","Masipit","Nag-Iba I","Nag-Iba II","Navotas","Pachoca","Palhi","Panggalaan","Parang","Patas","Personas","Putingtubig","San Antonio","San Raphael (formerly Salong)","San Vicente Central","San Vicente East","San Vicente North","San Vicente South","San Vicente West","Sapul","Silonay","Sta. Cruz","Sta. Isabel","Sta. Maria Village","Sta. Rita","Sto. Niño (formerly Nacoco)","Suqui","Tawagan","Tawiran","Tibag","Wawa"
]

const expiryDate = computed(() => {
  const now = new Date()
  now.setFullYear(now.getFullYear() + 1)
  return now
})
const expiryDateDisplay = computed(() =>
  expiryDate.value.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
)

// QR Code generation on successful registration
watch(success, async (val) => {
  if (val && referenceNumber.value) {
    qrCodeValue.value = referenceNumber.value
    qrCodeDataUrl.value = await QRCode.toDataURL(qrCodeValue.value, { type: 'image/png' })
  }
})

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

// Auto-hide alert after 3 seconds
const closeAlert = () => {
  error.value = ''
  success.value = ''
}
watch([success, error], ([s, e]) => {
  if (s || e) {
    setTimeout(() => {
      closeAlert()
    }, 3000)
  }
})

const isLoading = ref(false)
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  padding: 12px;
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
  margin-right: 12px;
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
  font-weight: 600;
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
  cursor: pointer;
  padding: 8px;
  color: #374151;
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

.admin-header-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.admin-content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-form-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.admin-card {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.admin-grid--2 {
  grid-template-columns: repeat(2, 1fr);
}

.admin-grid--3 {
  grid-template-columns: repeat(3, 1fr);
}

.admin-label {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 8px;
}

.admin-input {
  padding: 12px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  color: #111827;
  transition: border-color 0.2s;
}

.admin-input:focus {
  border-color: #2563eb;
  outline: none;
}

.admin-input-helper {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.admin-input--readonly {
  background-color: #f1f5f9;
}

.admin-file-upload {
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: background-color 0.2s;
}

.admin-file-upload:hover {
  background-color: #f9fafb;
}

.admin-file-icon {
  width: 32px;
  height: 32px;
  color: #2563eb;
  margin-bottom: 8px;
}

.admin-file-text {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.admin-file-helper {
  font-size: 12px;
  color: #6b7280;
}

.admin-file-selected {
  font-size: 12px;
  color: #4caf50;
  margin-top: 4px;
}

.admin-card--info {
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  padding: 16px;
}

.admin-info-label {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.admin-info-value {
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
}

.admin-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.admin-btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background-color: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.admin-btn:hover {
  background-color: #4f46e5;
}

.qr-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-modal {
  background: #fff;
  border-radius: 12px;
  padding: 32px 24px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.12);
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
}
.qr-modal-img {
  margin: 24px 0;
}
.qr-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}
.admin-btn--secondary {
  background: #fff;
  color: #2563eb;
  border: 1px solid #2563eb;
}
.admin-btn--secondary:hover {
  background: #f1f5f9;
}

.alert {
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 500;
}
.alert-success {
  background: #e6f9ed;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.alert-error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.alert-popup {
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  min-width: 320px;
  max-width: 90vw;
  padding: 16px 32px 16px 20px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
}
.alert-close {
  background: none;
  border: none;
  font-size: 22px;
  color: inherit;
  margin-left: 18px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

/* Loader Styles */
.loader-overlay {
  position: fixed;
  top: 0;
  left: 256px; /* width of your sidebar */
  right: 0;
  bottom: 0;
  background: rgba(33,33,33,0.5); /* #212121 with 50% opacity */
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.wrapper {
  width: 200px;
  height: 60px;
  position: relative;
  z-index: 1;
}

.circle {
  width: 20px;
  height: 20px;
  position: absolute;
  border-radius: 50%;
  background-color: #fff;
  left: 15%;
  transform-origin: 50%;
  animation: circle7124 .5s alternate infinite ease;
}

@keyframes circle7124 {
  0% {
    top: 60px;
    height: 5px;
    border-radius: 50px 50px 25px 25px;
    transform: scaleX(1.7);
  }
  40% {
    height: 20px;
    border-radius: 50%;
    transform: scaleX(1);
  }
  100% {
    top: 0%;
  }
}

.circle:nth-child(2) {
  left: 45%;
  animation-delay: .2s;
}

.circle:nth-child(3) {
  left: auto;
  right: 15%;
  animation-delay: .3s;
}

.shadow {
  width: 20px;
  height: 4px;
  border-radius: 50%;
  background-color: rgba(0,0,0,0.9);
  position: absolute;
  top: 62px;
  transform-origin: 50%;
  z-index: -1;
  left: 15%;
  filter: blur(1px);
  animation: shadow046 .5s alternate infinite ease;
}

@keyframes shadow046 {
  0% {
    transform: scaleX(1.5);
  }
  40% {
    transform: scaleX(1);
    opacity: .7;
  }
  100% {
    transform: scaleX(.2);
    opacity: .4;
  }
}

.shadow:nth-child(4) {
  left: 45%;
  animation-delay: .2s
}

.shadow:nth-child(5) {
  left: auto;
  right: 15%;
  animation-delay: .3s;
}

.loader-text {
  margin-top: 24px;
  font-size: 16px;
  color: #fff;
  font-weight: 500;
}
</style>

