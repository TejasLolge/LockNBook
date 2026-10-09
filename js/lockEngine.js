/* ==========================================================================
   LockNBook Client Lock & TTL Countdown Engine
   Coordinates active checkout timer, lock hold UX, and auto-expiration
   ========================================================================== */

(function (window) {
  'use strict';

  class LockEngine {
    constructor() {
      this.activeLock = null;
      this.timerInterval = null;
      this.onTickCallbacks = [];
      this.onExpireCallbacks = [];
      this.restorePersistedLock();
    }

    onTick(fn) {
      this.onTickCallbacks.push(fn);
    }

    onExpire(fn) {
      this.onExpireCallbacks.push(fn);
    }

    restorePersistedLock() {
      const saved = sessionStorage.getItem('lnb_active_lock');
      if (saved) {
        try {
          const lock = JSON.parse(saved);
          if (Date.now() < lock.expiresAt) {
            this.startLock(lock, false);
          } else {
            sessionStorage.removeItem('lnb_active_lock');
          }
        } catch (e) {
          sessionStorage.removeItem('lnb_active_lock');
        }
      }
    }

    startLock(lockData, saveSession = true) {
      this.clearLock();
      this.activeLock = lockData;

      if (saveSession) {
        sessionStorage.setItem('lnb_active_lock', JSON.stringify(lockData));
      }

      this.updateUI();
      this.startCountdown();
    }

    startCountdown() {
      if (this.timerInterval) clearInterval(this.timerInterval);

      this.timerInterval = setInterval(() => {
        if (!this.activeLock) {
          clearInterval(this.timerInterval);
          return;
        }

        const remainingMs = this.activeLock.expiresAt - Date.now();
        const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

        this.onTickCallbacks.forEach(fn => fn(remainingSeconds, this.activeLock));
        this.renderCountdownDisplay(remainingSeconds);

        if (remainingSeconds <= 0) {
          this.handleLockExpiration();
        }
      }, 1000);

      // Run immediate tick
      const remainingSeconds = Math.max(0, Math.floor((this.activeLock.expiresAt - Date.now()) / 1000));
      this.renderCountdownDisplay(remainingSeconds);
    }

    renderCountdownDisplay(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      const floatingBar = document.getElementById('activeLockBar');
      const timerElement = document.getElementById('lockTimerText');
      const modalTimerElement = document.getElementById('checkoutModalTimerText');

      if (timerElement) timerElement.textContent = formatted;
      if (modalTimerElement) modalTimerElement.textContent = formatted;

      if (floatingBar) {
        floatingBar.classList.add('visible');
        if (seconds <= 20) {
          floatingBar.classList.remove('warning');
          floatingBar.classList.add('danger');
        } else if (seconds <= 60) {
          floatingBar.classList.add('warning');
          floatingBar.classList.remove('danger');
        } else {
          floatingBar.classList.remove('warning', 'danger');
        }
      }
    }

    handleLockExpiration() {
      clearInterval(this.timerInterval);
      const expiredLock = this.activeLock;
      this.clearLock();

      if (expiredLock && window.LockNBookApi) {
        window.LockNBookApi.releaseReservation(expiredLock.lockId, 'TTL_EXPIRED');
      }

      this.onExpireCallbacks.forEach(fn => fn(expiredLock));

      // Trigger user-facing expired alert
      if (window.showToast) {
        window.showToast('⏱️ Reservation lock expired! Your held seats were released to the pool.', 'warning');
      }

      const modalExpired = document.getElementById('lockExpiredModal');
      if (modalExpired) {
        modalExpired.classList.add('open');
      }

      const checkoutModal = document.getElementById('checkoutModal');
      if (checkoutModal) {
        checkoutModal.classList.remove('open');
      }
    }

    clearLock() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.activeLock = null;
      sessionStorage.removeItem('lnb_active_lock');

      const floatingBar = document.getElementById('activeLockBar');
      if (floatingBar) {
        floatingBar.classList.remove('visible', 'warning', 'danger');
      }
    }

    releaseCurrentLock() {
      if (this.activeLock && window.LockNBookApi) {
        window.LockNBookApi.releaseReservation(this.activeLock.lockId, 'USER_ABANDONED');
      }
      this.clearLock();
      if (window.showToast) {
        window.showToast('Reservation lock released. Seats returned to available pool.', 'info');
      }
    }

    updateUI() {
      const floatingBar = document.getElementById('activeLockBar');
      if (floatingBar && this.activeLock) {
        floatingBar.classList.add('visible');
        const lockQtyText = document.getElementById('lockQtyText');
        if (lockQtyText) {
          lockQtyText.textContent = `${this.activeLock.quantity}x ${this.activeLock.tierName}`;
        }
      }
    }
  }

  window.LockEngine = new LockEngine();
})(window);
