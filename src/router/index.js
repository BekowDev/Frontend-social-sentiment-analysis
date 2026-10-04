import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { isMockEnabled } from '@/mocks/mockSentiment';

const routes = [
    {
        path: '/',
        name: 'Landing',
        component: () => import('@/views/Landing.vue'),
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/history',
        name: 'History',
        component: () => import('@/views/History.vue'),
        meta: { requiresAuth: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();
    if (to.meta.requiresAuth && !auth.isLoggedIn) {
        if (isMockEnabled()) {
            auth.enterDemoSession();
            next();
            return;
        }
        next({ name: 'Login' });
        return;
    }

    const isAuthPage = to.name === 'Login';
    if (auth.isLoggedIn && isAuthPage) {
        next({ name: 'Dashboard' });
        return;
    }

    next();
});

export default router;
