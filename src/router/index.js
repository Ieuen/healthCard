import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/auth/LoginPage.vue'
import RegistrationPage from '../pages/auth/RegistrationPage.vue'
import RegisteredMembersPage from '../pages/admin/RegisteredMembersPage.vue'
import ReportsPage from '../pages/admin/ReportsPage.vue'
import MemberProfileAdminPage from '../pages/admin/MemberProfileAdminPage.vue'
import QRScanner from '../pages/admin/QRScanner.vue'
import MemberRegistrationPage from '../pages/admin/MemberRegistrationPage.vue'
import { auth } from '../services/firebase'
import { getIdTokenResult } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

// Lazy load pages
// const LoginPage = () => import('../pages/auth/LoginPage.vue')
// const RegistrationPage = () => import('../pages/auth/RegistrationPage.vue')
// const AdminDashboard = () => import('../pages/admin/AdminDashboard.vue')
// const RegisteredMembersPage = () => import('../pages/admin/RegisteredMembersPage.vue')
// const ReportsPage = () => import('../pages/admin/ReportsPage.vue')
// const MemberProfileAdminPage = () => import('../pages/admin/MemberProfileAdminPage.vue')
// const QRScanner = () => import('../pages/admin/QRScanner.vue')
// const MemberProfilePublic = () => import('../pages/public/MemberProfilePublic.vue')
// const MemberRegistrationPage = () => import('../pages/admin/MemberRegistrationPage.vue')

const routes = [
  // Public QR scan route
  {
    path: '/scan',
    name: 'PublicScan',
    component: () => import('../pages/public/MemberProfilePublic.vue'),
    props: route => ({ ref: route.query.ref })
  },
  // Auth routes
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegistrationPage },
  // Admin routes (protected)
  {
    path: '/admin',
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../pages/admin/AdminDashboard.vue')
      },
      { path: 'members', name: 'RegisteredMembers', component: RegisteredMembersPage },
      { path: 'reports', name: 'Reports', component: ReportsPage },
      { path: 'member/:id', name: 'MemberProfileAdminPage', component: MemberProfileAdminPage, props: true },
      { path: 'scanner', name: 'QRScanner', component: QRScanner },
      { path: 'member-registration', name: 'MemberRegistration', component: MemberRegistrationPage }
    ]
  },
  // Fallback
  { path: '/:catchAll(.*)', redirect: '/login' } // This should be last in your routes array!
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard for Auth & Role
router.beforeEach(async (to, from, next) => {
  // Always allow login and register
  if (['/login', '/register'].includes(to.path)) return next()

  // Public scan page is always accessible
  if (to.path.startsWith('/scan')) return next()

  // Only admin routes require auth
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const user = auth.currentUser
    if (!user) {
      return next({ name: 'Login' })
    }
    // Check if user exists in admins collection
    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid))
      if (adminDoc.exists()) {
        return next()
      } else {
        // Not an admin
        return next({ name: 'Login' })
      }
    } catch (err) {
      // Firestore fetch failed
      return next({ name: 'Login' })
    }
  }
  // All other routes (login, register) are public
  return next()
})

// After login, redirect to admin dashboard if the user is an admin
/*router.afterEach((to, from) => {
  const user = auth.currentUser
  if (user && to.path === '/login') {
    getIdTokenResult(user).then(tokenResult => {
      if (tokenResult.claims.admin === true) {
        router.push('/admin/dashboard')
      }
    })
  }
})*/

export default router
