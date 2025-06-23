<!-- filepath: src/components/AdminSidebar.vue -->
<template>
  <aside class="admin-sidebar">
    <div class="admin-sidebar-inner">
      <!-- Logo -->
      <div class="admin-logo">
        <div class="admin-logo-icon">
          <HeartHandshake class="admin-logo-svg" />
        </div>
        <span class="admin-logo-text">Health Program</span>
      </div>
      <!-- Navigation -->
      <nav class="admin-nav">
        <router-link :to="{ name: 'AdminDashboard' }" class="admin-nav-link" :class="{ 'admin-nav-link--active': isActive('AdminDashboard') }">
          <LayoutDashboard class="admin-nav-icon" />
          Dashboard
        </router-link>
        <router-link :to="{ name: 'Reports' }" class="admin-nav-link" :class="{ 'admin-nav-link--active': isActive('Reports') }">
          <FileText class="admin-nav-icon" />
          Reports
        </router-link>
        <router-link :to="{ name: 'MemberRegistration' }" class="admin-nav-link" :class="{ 'admin-nav-link--active': isActive('MemberRegistration') }">
          <UserPlus class="admin-nav-icon" />
          Member Registration
        </router-link>
        <router-link :to="{ name: 'RegisteredMembers' }" class="admin-nav-link" :class="{ 'admin-nav-link--active': isActive('RegisteredMembers') }">
          <Users class="admin-nav-icon" />
          Registered Members
        </router-link>
        <router-link :to="{ name: 'QRScanner' }" class="admin-nav-link" :class="{ 'admin-nav-link--active': isActive('QRScanner') }">
          <QrCode class="admin-nav-icon" />
          QR Scanner
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { HeartHandshake, LayoutDashboard, FileText, UserPlus, Users, QrCode } from 'lucide-vue-next'

const route = useRoute()
function isActive(name) {
  return route.name === name
}
</script>