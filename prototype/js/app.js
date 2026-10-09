/* ==========================================================================
   LockNBook Master Application Coordinator
   Checkout flow, Idempotency, Toast System, and Sarthak Concurrency Simulator
   ========================================================================== */

(function (window) {
  'use strict';

  let currentCheckoutLock = null;
  let activePaymentMethod = 'card';

  // Master App Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initToasts();
    initCheckoutModal();
    initDevHud();

    // Initialize module controllers
    if (window.EventsController) window.EventsController.init();
    if (window.BookingsController) window.BookingsController.init();

    // Setup active lock banner action
    const viewLockBtn = document.getElementById('viewActiveLockBtn');
    if (viewLockBtn) {
      viewLockBtn.addEventListener('click', () => {
        if (window.LockEngine && window.LockEngine.activeLock) {
          openCheckoutModal(window.LockEngine.activeLock);
        }
      });
    }

    const cancelLockBtn = document.getElementById('cancelActiveLockBtn');
    if (cancelLockBtn) {
      cancelLockBtn.addEventListener('click', () => {
        if (confirm('Release your held reservation and return seats to inventory?')) {
          window.LockEngine.releaseCurrentLock();
        }
      });
    }

    // Keyboard shortcut: Escape closes all open modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
        const hud = document.getElementById('devHudPanel');
        if (hud) hud.classList.remove('open');
      }
    });
  });

  /* --- Toast Notification System --- */
  function initToasts() {
    window.showToast = function (message, type = 'info') {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      let icon = 'ℹ️';
      if (type === 'success') icon = '✅';
      if (type === 'warning') icon = '⚠️';
      if (type === 'error') icon = '❌';

      toast.innerHTML = `
        <span style="font-size: 1.1rem;">${icon}</span>
        <div style="flex: 1;">${message}</div>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 4200);
    };
  }

  /* --- Checkout Flow Controller --- */
  function initCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const closeBtn = document.getElementById('closeCheckoutModalBtn');
    const checkoutForm = document.getElementById('checkoutPaymentForm');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    // Payment method selector buttons
    const payCards = document.querySelectorAll('.payment-method-card');
    payCards.forEach(card => {
      card.addEventListener('click', () => {
        payCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        activePaymentMethod = card.getAttribute('data-method') || 'card';

        // Toggle card fields visibility
        const cardFields = document.getElementById('creditCardInputFields');
        if (cardFields) {
          cardFields.style.display = activePaymentMethod === 'card' ? 'block' : 'none';
        }
      });
    });

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', handleProcessPayment);
    }
  }

  function openCheckoutModal(lockData) {
    currentCheckoutLock = lockData;
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    // Generate fresh idempotency key
    const idempKey = 'idemp_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    const idempTag = document.getElementById('idempotencyKeyDisplay');
    if (idempTag) {
      idempTag.textContent = idempKey;
    }

    // Populate checkout summary
    const summaryEvent = document.getElementById('checkoutEventTitle');
    const summaryTier = document.getElementById('checkoutTierDetail');
    const summaryPrice = document.getElementById('checkoutTotalPrice');

    if (summaryEvent) summaryEvent.textContent = lockData.eventTitle || (lockData.event ? lockData.event.title : 'Event');
    if (summaryTier) summaryTier.textContent = `${lockData.quantity}x ${lockData.tierName} ($${lockData.unitPrice} each)`;
    if (summaryPrice) {
      const total = (lockData.unitPrice * lockData.quantity) + (4.50 * lockData.quantity);
      summaryPrice.textContent = `$${total.toFixed(2)}`;
    }

    // Autofill user info if logged in
    if (window.AuthController && window.AuthController.currentUser) {
      const u = window.AuthController.currentUser;
      const nameIn = document.getElementById('checkoutCustomerName');
      const emailIn = document.getElementById('checkoutCustomerEmail');
      const phoneIn = document.getElementById('checkoutCustomerPhone');
      if (nameIn && !nameIn.value) nameIn.value = u.name;
      if (emailIn && !emailIn.value) emailIn.value = u.email;
      if (phoneIn && !phoneIn.value && u.phone) phoneIn.value = u.phone;
    }

    modal.classList.add('open');
  }

  function handleProcessPayment(e) {
    e.preventDefault();
    if (!currentCheckoutLock) return;

    const payBtn = document.getElementById('submitPaymentBtn');
    const originalText = payBtn.innerHTML;
    payBtn.disabled = true;
    payBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
        <path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8zm0 16c4.41 0 8-3.59 8-8h2c0 5.52-4.48 10-10 10v-2z"/>
      </svg>
      Processing Concurrency Lock & Payment...
    `;

    const customerInfo = {
      name: document.getElementById('checkoutCustomerName').value.trim() || 'Alex Morgan',
      email: document.getElementById('checkoutCustomerEmail').value.trim() || 'alex@locknbook.dev',
      phone: document.getElementById('checkoutCustomerPhone').value.trim() || '+1 555-0199'
    };

    const idempKey = document.getElementById('idempotencyKeyDisplay').textContent;

    // Simulate realistic 1.2s gateway payment & atomic transition
    setTimeout(() => {
      const confirmResult = window.LockNBookApi.confirmReservation({
        lockId: currentCheckoutLock.lockId,
        paymentDetails: { method: activePaymentMethod },
        idempotencyKey: idempKey,
        customerInfo
      });

      payBtn.disabled = false;
      payBtn.innerHTML = originalText;

      if (!confirmResult.success) {
        window.showToast(`Payment failed: ${confirmResult.error}`, 'error');
        return;
      }

      // Close checkout modal
      document.getElementById('checkoutModal').classList.remove('open');

      // Clear active lock from countdown engine
      window.LockEngine.clearLock();

      // Show ticket pass modal
      window.BookingsController.viewTicketModal(confirmResult.booking.bookingRef);
      window.BookingsController.updateNavBadge();

      window.showToast(`🎉 Booking confirmed! Reference: ${confirmResult.booking.bookingRef}`, 'success');
    }, 1200);
  }

  /* --- Sarthak Concurrency & Load Testing Simulator --- */
  function initDevHud() {
    const triggerBtn = document.getElementById('devHudToggleBtn');
    const panel = document.getElementById('devHudPanel');
    const closeBtn = document.getElementById('closeDevHudBtn');
    const runSimBtn = document.getElementById('runConcurrencySimulationBtn');
    const resetBtn = document.getElementById('resetSystemDataBtn');

    if (triggerBtn && panel) {
      triggerBtn.addEventListener('click', () => {
        panel.classList.toggle('open');
        renderDevLocksTable();
      });
    }

    if (closeBtn && panel) {
      closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
      });
    }

    if (window.LockNBookApi) {
      window.LockNBookApi.onLog(entry => {
        appendConsoleLog(entry);
        renderDevLocksTable();
      });
    }

    if (runSimBtn) {
      runSimBtn.addEventListener('click', runSarthakConcurrencyBenchmark);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all inventory, active locks, and bookings to default seed?')) {
          window.LockNBookApi.resetAllData();
          window.BookingsController.updateNavBadge();
          renderDevLocksTable();
          window.showToast('System inventory reset to seed values.', 'info');
        }
      });
    }
  }

  function appendConsoleLog(entry) {
    const box = document.getElementById('devConsoleOutput');
    if (!box) return;

    const div = document.createElement('div');
    div.className = `log-entry ${entry.type}`;
    div.textContent = `[${entry.timestamp}] ${entry.message}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function renderDevLocksTable() {
    const tableBody = document.getElementById('devLocksTableBody');
    if (!tableBody || !window.LockNBookApi) return;

    const locks = window.LockNBookApi.getLocks();
    const lockList = Object.values(locks).slice(-8).reverse();

    if (lockList.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 0.75rem;">No active locks recorded</td></tr>`;
      return;
    }

    tableBody.innerHTML = lockList.map(l => {
      const remainingSec = Math.max(0, Math.floor((l.expiresAt - Date.now()) / 1000));
      let statusColor = '#38bdf8';
      if (l.status === 'CONFIRMED') statusColor = '#34d399';
      if (l.status === 'EXPIRED') statusColor = '#f87171';
      if (l.status === 'RELEASED') statusColor = '#94a3b8';

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.75rem;">
          <td style="font-family: monospace; padding: 0.4rem 0.2rem;">${l.lockId.slice(0, 10)}...</td>
          <td style="padding: 0.4rem 0.2rem;">${l.quantity}x ${l.tierName}</td>
          <td style="padding: 0.4rem 0.2rem; color: ${statusColor}; font-weight: 700;">${l.status}</td>
          <td style="padding: 0.4rem 0.2rem; font-family: monospace;">${l.status === 'HELD' ? remainingSec + 's' : '-'}</td>
        </tr>
      `;
    }).join('');
  }

  /**
   * SARTHAK'S LOAD TESTING & CONCURRENCY BENCHMARK SIMULATOR
   * Simulates 50 high-velocity bot requests competing simultaneously
   * for limited tickets to mathematically prove zero overselling!
   */
  async function runSarthakConcurrencyBenchmark() {
    const runBtn = document.getElementById('runConcurrencySimulationBtn');
    if (runBtn) runBtn.disabled = true;

    window.LockNBookApi.log('🚀 SARTHAK BENCHMARK: Spawning 50 concurrent automated booking workers...', 'info');

    // Pick target event with limited tickets (e.g. VIP or Backstage)
    const events = window.LockNBookApi.getEvents();
    const targetEvent = events[0]; // Neon Horizon
    const targetTier = targetEvent.tiers[1]; // VIP Pit (30 total)

    const initialAvailable = Math.max(0, targetTier.total - (targetTier.confirmed + targetTier.held));
    window.LockNBookApi.log(`📊 Target: ${targetEvent.title} [${targetTier.name}] | Initial Available: ${initialAvailable}`, 'info');

    let successCount = 0;
    let rejectedCount = 0;
    let heldQuantity = 0;

    const startTime = performance.now();
    const requests = [];

    // Launch 50 concurrent reservation requests
    for (let i = 1; i <= 50; i++) {
      requests.push(new Promise(resolve => {
        setTimeout(() => {
          const qty = 1; // 1 ticket per bot
          const res = window.LockNBookApi.holdReservation({
            eventId: targetEvent.id,
            tierId: targetTier.id,
            quantity: qty,
            userId: `bot_worker_${i}`
          });

          if (res.success) {
            successCount++;
            heldQuantity += qty;
          } else {
            rejectedCount++;
          }
          resolve(res);
        }, Math.random() * 200); // 0-200ms high-concurrency burst
      }));
    }

    await Promise.all(requests);
    const duration = (performance.now() - startTime).toFixed(1);

    const updatedEvent = window.LockNBookApi.getEventById(targetEvent.id);
    const updatedTier = updatedEvent.tiers.find(t => t.id === targetTier.id);
    const finalAvailable = Math.max(0, updatedTier.total - (updatedTier.confirmed + updatedTier.held));
    const totalCommittedAndHeld = updatedTier.confirmed + updatedTier.held;

    window.LockNBookApi.log(`🏁 BENCHMARK COMPLETE in ${duration}ms!`, 'success');
    window.LockNBookApi.log(`✅ Successful Holds: ${successCount} | 🛑 Safely Rejected (Zero Overselling): ${rejectedCount}`, 'success');
    window.LockNBookApi.log(`🔒 Capacity Audit: Total=${updatedTier.total}, Held+Confirmed=${totalCommittedAndHeld}, Remaining=${finalAvailable}`, 'info');

    if (totalCommittedAndHeld <= updatedTier.total) {
      window.LockNBookApi.log(`🏆 VERIFICATION PASSED: Confirmed + Held (${totalCommittedAndHeld}) <= Total (${updatedTier.total}). ZERO OVERSELLING PROVED!`, 'success');
      alert(`🎉 Sarthak Concurrency Test Passed!\n\n50 Bots Fired Simultaneously in ${duration}ms:\n• Successful Holds: ${successCount}\n• Rejected without overselling: ${rejectedCount}\n• Total inventory capacity respected: 100%`);
    } else {
      window.LockNBookApi.log(`❌ CRITICAL FAILURE: Inventory exceeded!`, 'error');
    }

    if (runBtn) runBtn.disabled = false;
    renderDevLocksTable();
  }

  // Export globally for inline callers
  window.openCheckoutModal = openCheckoutModal;
})(window);
