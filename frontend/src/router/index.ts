import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OwnerGateView from '../views/OwnerGateView.vue'
import BuyerView from '../views/BuyerView.vue'
import OrderView from '../views/OrderView.vue'
import HistoryView from '../views/HistoryView.vue'
import DashboardView from '../views/DashboardView.vue'
import CustomerNewView from '../views/CustomerNewView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { bare: true } },
    { path: '/yang-punya', name: 'owner-gate', component: OwnerGateView, meta: { bare: true } },
    { path: '/yang-beli', name: 'buyer', component: BuyerView, meta: { bare: true } },
    { path: '/owner', name: 'order', component: OrderView, meta: { requiresOwner: true } },
    {
      path: '/owner/history',
      name: 'history',
      component: HistoryView,
      meta: { requiresOwner: true },
    },
    {
      path: '/owner/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresOwner: true },
    },
    {
      path: '/owner/customers/new',
      name: 'customer-new',
      component: CustomerNewView,
      meta: { requiresOwner: true },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresOwner && localStorage.getItem('mmdg-unlocked') !== '1') {
    return '/yang-punya'
  }
})

export default router
