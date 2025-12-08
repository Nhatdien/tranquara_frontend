/**
 * Auth Middleware
 * Protects routes that require authentication
 */

import { useAuthStore } from '~/stores/stores/auth_store';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password'];

  // Check if the route requires authentication
  const isPublicRoute = publicRoutes.some(route => to.path.startsWith(route));

  // If not authenticated and trying to access protected route, redirect to login
  if (!isPublicRoute && !authStore.isAuthenticated) {
    return navigateTo('/login');
  }

  // NOTE: Removed auto-redirect from login/register when authenticated
  // This allows manual token clearing on those pages
});
