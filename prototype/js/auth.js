/* ==========================================================================
   LockNBook Authentication & User State
   Handles login/register modal, user session persistence, and avatar state
   ========================================================================== */

(function (window) {
  'use strict';

  const STORAGE_KEY_USER = 'locknbook_current_user_v1';

  class AuthController {
    constructor() {
      this.currentUser = this.loadUser();
      this.initUI();
    }

    loadUser() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_USER)) || null;
      } catch (e) {
        return null;
      }
    }

    saveUser(user) {
      this.currentUser = user;
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
      this.updateNavbarUser();
    }

    initUI() {
      const authBtn = document.getElementById('authNavBtn');
      const modal = document.getElementById('authModal');
      const closeBtn = document.getElementById('closeAuthModalBtn');
      const authForm = document.getElementById('authForm');
      const demoLoginBtn = document.getElementById('demoLoginBtn');

      if (authBtn) {
        authBtn.addEventListener('click', () => {
          if (this.currentUser) {
            // Already logged in - show logout option
            if (confirm(`Logged in as ${this.currentUser.name} (${this.currentUser.email}). Sign out?`)) {
              this.logout();
            }
          } else {
            this.openModal();
          }
        });
      }

      if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => this.closeModal());
      }

      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) this.closeModal();
        });
      }

      if (authForm) {
        authForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('authNameInput').value.trim() || 'Alex Morgan';
          const email = document.getElementById('authEmailInput').value.trim() || 'alex@locknbook.dev';
          this.login({ name, email });
        });
      }

      if (demoLoginBtn) {
        demoLoginBtn.addEventListener('click', () => {
          this.login({
            name: 'Alex Morgan',
            email: 'alex.morgan@locknbook.dev',
            phone: '+1 (555) 234-5678'
          });
        });
      }

      this.updateNavbarUser();
    }

    openModal() {
      const modal = document.getElementById('authModal');
      if (modal) modal.classList.add('open');
    }

    closeModal() {
      const modal = document.getElementById('authModal');
      if (modal) modal.classList.remove('open');
    }

    login(userData) {
      this.saveUser(userData);
      this.closeModal();
      if (window.showToast) {
        window.showToast(`👋 Welcome back, ${userData.name}!`, 'success');
      }

      // Pre-fill checkout form if open
      const nameInput = document.getElementById('checkoutCustomerName');
      const emailInput = document.getElementById('checkoutCustomerEmail');
      const phoneInput = document.getElementById('checkoutCustomerPhone');
      if (nameInput) nameInput.value = userData.name;
      if (emailInput) emailInput.value = userData.email;
      if (phoneInput && userData.phone) phoneInput.value = userData.phone;
    }

    logout() {
      this.saveUser(null);
      if (window.showToast) {
        window.showToast('Signed out successfully.', 'info');
      }
    }

    updateNavbarUser() {
      const authBtn = document.getElementById('authNavBtn');
      if (!authBtn) return;

      if (this.currentUser) {
        authBtn.innerHTML = `
          <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #fff; font-weight: 700;">
            ${this.currentUser.name.charAt(0)}
          </div>
          <span style="font-size: 0.85rem; font-weight: 600;">${this.currentUser.name.split(' ')[0]}</span>
        `;
      } else {
        authBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span>Sign In</span>
        `;
      }
    }
  }

  window.AuthController = new AuthController();
})(window);
