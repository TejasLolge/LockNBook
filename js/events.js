/* ==========================================================================
   LockNBook Event Catalog & Details Controller
   Handles event discovery, category filters, tier selection, and lock triggers
   ========================================================================== */

(function (window) {
  'use strict';

  let currentCategory = 'all';
  let searchQuery = '';
  let selectedEvent = null;
  let selectedTierId = null;
  let selectedQuantity = 1;

  function initEvents() {
    renderEvents();
    setupCategoryFilters();
    setupSearchInput();
    setupEventModal();

    // Re-render whenever inventory updates (via API store or locks)
    if (window.LockNBookApi) {
      window.LockNBookApi.subscribe(() => {
        renderEvents();
        if (selectedEvent) {
          // Refresh open modal if still open
          const updatedEvent = window.LockNBookApi.getEventById(selectedEvent.id);
          if (updatedEvent) {
            selectedEvent = updatedEvent;
            renderModalTierOptions(updatedEvent);
          }
        }
      });
    }
  }

  function setupCategoryFilters() {
    const pills = document.querySelectorAll('.cat-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.getAttribute('data-cat') || 'all';
        renderEvents();
      });
    });
  }

  function setupSearchInput() {
    const searchInput = document.getElementById('eventSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderEvents();
      });
    }
  }

  function getFilteredEvents() {
    let events = window.LockNBookApi.getEvents();

    if (currentCategory !== 'all') {
      events = events.filter(e => e.category === currentCategory);
    }

    if (searchQuery) {
      events = events.filter(e => 
        e.title.toLowerCase().includes(searchQuery) ||
        e.artist.toLowerCase().includes(searchQuery) ||
        e.venue.toLowerCase().includes(searchQuery)
      );
    }

    return events;
  }

  function renderEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    const events = getFilteredEvents();

    if (events.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem;">No Events Found</h3>
          <p style="color: var(--text-muted);">Try adjusting your category filter or search keywords.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = events.map(ev => {
      // Calculate total seats and total remaining
      let totalCapacity = 0;
      let totalRemaining = 0;
      let totalHeld = 0;
      let minPrice = Infinity;

      ev.tiers.forEach(t => {
        totalCapacity += t.total;
        const available = Math.max(0, t.total - (t.confirmed + t.held));
        totalRemaining += available;
        totalHeld += t.held;
        if (t.price < minPrice) minPrice = t.price;
      });

      const percentLeft = Math.round((totalRemaining / totalCapacity) * 100);

      // Inventory badge logic
      let badgeClass = 'inventory-badge-high';
      let badgeText = `${totalRemaining} Seats Left`;

      if (totalRemaining === 0) {
        badgeClass = 'inventory-badge-soldout';
        badgeText = 'Sold Out';
      } else if (totalRemaining <= 10) {
        badgeClass = 'inventory-badge-low';
        badgeText = `🔥 Only ${totalRemaining} Left!`;
      } else if (totalHeld > 0) {
        badgeClass = 'inventory-badge-med';
        badgeText = `🔒 ${totalHeld} Held in Lock`;
      }

      return `
        <article class="event-card">
          <div class="card-banner">
            <img src="${ev.image}" alt="${ev.title}" loading="lazy" />
            <span class="card-category-tag">${ev.categoryLabel}</span>
            <span class="card-inventory-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="card-body">
            <div class="card-meta-row">
              <span>📅 ${ev.date}</span>
              <span>⏰ ${ev.time}</span>
            </div>
            <h3 class="card-title">${ev.title}</h3>
            <div class="card-venue">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>${ev.venue}</span>
            </div>

            <!-- Live Inventory Visualizer -->
            <div class="inventory-tracker-container">
              <div class="tracker-labels">
                <span style="color: var(--text-secondary);">Real-Time Availability</span>
                <span style="color: ${totalRemaining > 0 ? '#38bdf8' : '#ef4444'}">${percentLeft}% Available</span>
              </div>
              <div class="tracker-bar-bg">
                <div class="tracker-bar-fill" style="width: ${percentLeft}%;"></div>
              </div>
            </div>

            <div class="card-footer">
              <div class="price-tag">
                <span class="label">From</span>
                <span class="amount">$${minPrice}</span>
              </div>
              <button class="btn ${totalRemaining === 0 ? 'btn-secondary btn-disabled' : 'btn-primary'}" 
                onclick="window.EventsController.openEventModal('${ev.id}')"
                ${totalRemaining === 0 ? 'disabled' : ''}>
                ${totalRemaining === 0 ? 'Sold Out' : 'Select Tickets →'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function setupEventModal() {
    const modal = document.getElementById('eventDetailsModal');
    const closeBtn = document.getElementById('closeEventModalBtn');
    const lockBtn = document.getElementById('initiateLockBtn');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    if (lockBtn) {
      lockBtn.addEventListener('click', handleInitiateLock);
    }
  }

  function openEventModal(eventId) {
    selectedEvent = window.LockNBookApi.getEventById(eventId);
    if (!selectedEvent) return;

    // Default select first available tier
    const firstAvailable = selectedEvent.tiers.find(t => (t.total - (t.confirmed + t.held)) > 0) || selectedEvent.tiers[0];
    selectedTierId = firstAvailable ? firstAvailable.id : null;
    selectedQuantity = 1;

    // Fill modal fields
    document.getElementById('modalEventTitle').textContent = selectedEvent.title;
    document.getElementById('modalEventArtist').textContent = selectedEvent.artist;
    document.getElementById('modalEventMeta').textContent = `📅 ${selectedEvent.date} • ⏰ ${selectedEvent.time} • 📍 ${selectedEvent.venue}`;
    document.getElementById('modalEventDesc').textContent = selectedEvent.description;
    document.getElementById('modalEventBanner').src = selectedEvent.image;

    renderModalTierOptions(selectedEvent);
    updateOrderSummary();

    const modal = document.getElementById('eventDetailsModal');
    if (modal) modal.classList.add('open');
  }

  function renderModalTierOptions(event) {
    const container = document.getElementById('modalTiersList');
    if (!container) return;

    container.innerHTML = event.tiers.map(tier => {
      const available = Math.max(0, tier.total - (tier.confirmed + tier.held));
      const isSoldOut = available === 0;
      const isSelected = tier.id === selectedTierId && !isSoldOut;

      return `
        <div class="tier-card-option ${isSelected ? 'selected' : ''} ${isSoldOut ? 'sold-out' : ''}"
             onclick="window.EventsController.selectTier('${tier.id}')">
          <div class="tier-info">
            <h4>${tier.name}</h4>
            <p>${isSoldOut ? '<span style="color:#ef4444; font-weight:600;">SOLD OUT</span>' : `<span style="color:#34d399;">${available} remaining</span> (${tier.held} currently held in locks)`}</p>
          </div>
          <div class="tier-price">
            $${tier.price}
            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">per ticket</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function selectTier(tierId) {
    if (!selectedEvent) return;
    const tier = selectedEvent.tiers.find(t => t.id === tierId);
    if (!tier) return;
    const available = Math.max(0, tier.total - (tier.confirmed + tier.held));
    if (available === 0) return;

    selectedTierId = tierId;
    selectedQuantity = 1;
    renderModalTierOptions(selectedEvent);
    updateOrderSummary();
  }

  function changeQuantity(delta) {
    if (!selectedEvent || !selectedTierId) return;
    const tier = selectedEvent.tiers.find(t => t.id === selectedTierId);
    if (!tier) return;

    const available = Math.max(0, tier.total - (tier.confirmed + tier.held));
    const maxAllowed = Math.min(4, available); // 4 tickets max per booking to prevent scalping

    const newQty = selectedQuantity + delta;
    if (newQty >= 1 && newQty <= maxAllowed) {
      selectedQuantity = newQty;
      updateOrderSummary();
    }
  }

  function updateOrderSummary() {
    const qtyDisplay = document.getElementById('ticketQtyDisplay');
    const subtotalDisplay = document.getElementById('orderSubtotal');
    const feeDisplay = document.getElementById('orderFee');
    const totalDisplay = document.getElementById('orderTotal');
    const lockBtn = document.getElementById('initiateLockBtn');

    if (!selectedEvent || !selectedTierId) {
      if (lockBtn) lockBtn.disabled = true;
      return;
    }

    const tier = selectedEvent.tiers.find(t => t.id === selectedTierId);
    const available = tier ? Math.max(0, tier.total - (tier.confirmed + tier.held)) : 0;

    if (qtyDisplay) qtyDisplay.textContent = selectedQuantity;

    // Enable/disable buttons based on availability
    const decBtn = document.getElementById('qtyDecBtn');
    const incBtn = document.getElementById('qtyIncBtn');
    if (decBtn) decBtn.disabled = selectedQuantity <= 1;
    if (incBtn) incBtn.disabled = selectedQuantity >= Math.min(4, available);

    if (tier && available > 0) {
      const subtotal = tier.price * selectedQuantity;
      const fee = 4.50 * selectedQuantity;
      const total = subtotal + fee;

      if (subtotalDisplay) subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
      if (feeDisplay) feeDisplay.textContent = `$${fee.toFixed(2)}`;
      if (totalDisplay) totalDisplay.textContent = `$${total.toFixed(2)}`;
      if (lockBtn) {
        lockBtn.disabled = false;
        lockBtn.innerHTML = `🔒 Lock ${selectedQuantity} Ticket${selectedQuantity > 1 ? 's' : ''} & Proceed ($${total.toFixed(2)})`;
      }
    } else {
      if (lockBtn) {
        lockBtn.disabled = true;
        lockBtn.textContent = 'Tier Sold Out';
      }
    }
  }

  /**
   * INITIATE LOCK: Atomic Hold with 5-min TTL Countdown
   */
  function handleInitiateLock() {
    if (!selectedEvent || !selectedTierId) return;

    // Check if user already has an active lock
    if (window.LockEngine && window.LockEngine.activeLock) {
      if (!confirm('You already have tickets held for another event. Releasing your existing hold to reserve these tickets?')) {
        return;
      }
      window.LockEngine.releaseCurrentLock();
    }

    const result = window.LockNBookApi.holdReservation({
      eventId: selectedEvent.id,
      tierId: selectedTierId,
      quantity: selectedQuantity,
      userId: 'user_active'
    });

    if (!result.success) {
      if (result.error === 'INSUFFICIENT_INVENTORY') {
        alert(`Sorry! Another user just reserved these tickets. Only ${result.available} tickets are available.`);
      } else {
        alert('Could not acquire lock. Please try again.');
      }
      return;
    }

    // Lock successfully acquired!
    // Start countdown
    window.LockEngine.startLock(result);

    // Close event modal
    const eventModal = document.getElementById('eventDetailsModal');
    if (eventModal) eventModal.classList.remove('open');

    // Open checkout modal
    if (window.openCheckoutModal) {
      window.openCheckoutModal(result);
    }

    if (window.showToast) {
      window.showToast(`🔒 Lock secured! Reserved ${result.quantity}x tickets for 5 minutes.`, 'success');
    }
  }

  window.EventsController = {
    init: initEvents,
    openEventModal,
    selectTier,
    changeQuantity
  };
})(window);
