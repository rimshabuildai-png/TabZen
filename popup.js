// TabZen popup script
// This script reads all open tabs and displays them in the popup.

document.addEventListener('DOMContentLoaded', function () {
  const tabListEl = document.getElementById('tab-list');
  const savedSessionsList = document.getElementById("saved-sessions-list");

  const headerTopEl = document.querySelector('.header-top-message');
  const headerCenterEl = document.querySelector('.header-center');
  const bigCountEl = document.querySelector('.tab-count-large');
  const countLabelEl = document.querySelector('.tab-count-label');
  const statusBadgeEl = document.querySelector('.tab-status');
  const statusDotEl = statusBadgeEl ? statusBadgeEl.querySelector('.status-dot') : null;
  const statusTextEl = statusBadgeEl ? statusBadgeEl.querySelector('.status-text') : null;
  const bottomSubtitleEl = document.querySelector('.header-subtitle-bottom');

  const selectAllBtn = document.getElementById("selectAllBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const selectWorkBtn = document.getElementById("selectWorkBtn");

  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", function () {
      document.querySelectorAll(".focus-checkbox").forEach(cb => {
        cb.checked = true;
      });
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", function () {
      document.querySelectorAll(".focus-checkbox").forEach(cb => {
        cb.checked = false;
      });
    });
  }

  if (selectWorkBtn) {
    selectWorkBtn.addEventListener("click", function () {
      document.querySelectorAll(".focus-checkbox").forEach(cb => {
        cb.checked = false;
      });
      document.querySelectorAll(".category-group").forEach(group => {
        const categoryName = group.querySelector(".category-name");
        if (categoryName && categoryName.textContent === "Work") {
          group.querySelectorAll(".focus-checkbox").forEach(cb => {
            cb.checked = true;
          });
        }
      });
    });
  }

  /* ============================= */
  /* TOAST FUNCTION               */
  /* ============================= */

  let activeToastTimeout = null;

  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    container.innerHTML = "";

    if (activeToastTimeout) {
      clearTimeout(activeToastTimeout);
      activeToastTimeout = null;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    activeToastTimeout = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2500);
  }

  if (!tabListEl || !headerTopEl || !headerCenterEl || !bigCountEl || !countLabelEl || !statusBadgeEl || !statusDotEl || !statusTextEl || !bottomSubtitleEl) {
    console.error('TabZen: Required DOM elements are missing.');
    return;
  }

  countLabelEl.textContent = 'Active Tabs';

const topMessages = [
  'Your brain deserves order',
  'No more lost thoughts',
  'Your tabs, your sanity',
  'Context saved. Brain free.',
  'Stop losing your focus',
  'Clarity starts here',
  'Your mental space, protected'
];

  const bottomTemplates = [
  function (count) { return count + ' tabs sorted — breathe easy'; },
  function () { return "You're in control right now"; },
  function () { return 'No chaos here. You\'ve got this.'; },
  function () { return 'Every tab has a purpose. Stay focused.'; },
  function () { return 'Less noise. More flow.'; },
  function () { return 'Your session is protected.'; },
  function () { return 'Never lose your place again.'; }
];

  function updateHeader(totalTabs) {
    try {
      const now = new Date();
      const dayIndex = now.getDay();

      const topMessage = topMessages[dayIndex] || topMessages[0];
      const bottomMessageFn = bottomTemplates[dayIndex] || bottomTemplates[0];

      headerTopEl.textContent = topMessage;
      const bottomText = bottomMessageFn(totalTabs);
      bottomSubtitleEl.textContent = bottomText;

      const newText = String(totalTabs);
      if (bigCountEl.textContent !== newText) {
        bigCountEl.textContent = newText;
        bigCountEl.classList.remove('tab-count-animate');
        void bigCountEl.offsetWidth;
        bigCountEl.classList.add('tab-count-animate');
      }

      let statusLabel = '';
      let statusColor = '';
      if (totalTabs <= 15) {
        statusLabel = 'Optimal';
        statusColor = '#10b981';
      } else if (totalTabs <= 30) {
        statusLabel = 'Overloaded';
        statusColor = '#f59e0b';
      } else {
        statusLabel = 'Chaos Mode';
        statusColor = '#ef4444';
      }

      statusTextEl.textContent = statusLabel;
      statusBadgeEl.style.color = statusColor;
      statusDotEl.style.backgroundColor = statusColor;
    } catch (error) {
      console.error('TabZen: Failed to update header.', error);
    }
  }

  function getDisplayTitle(tab) {
    try {
      if (tab.title && tab.title.trim().length > 0) {
        return tab.title;
      }
      if (tab.url) {
        try {
          const urlObj = new URL(tab.url);
          return urlObj.hostname || tab.url;
        } catch (e) {
          return tab.url;
        }
      }
      return 'Untitled tab';
    } catch (error) {
      console.error('TabZen: Error getting display title for tab.', error);
      return 'Untitled tab';
    }
  }

  function truncateText(text, maxLength) {
    if (typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }

  function renderTabItem(tab, parentEl) {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    tabItem.dataset.tabId = String(tab.id || '');

    const focusCheckbox = document.createElement("input");
    focusCheckbox.type = "checkbox";
    focusCheckbox.className = "focus-checkbox";
    focusCheckbox.dataset.tabId = tab.id;

    tabItem.style.display = "flex";
    tabItem.style.alignItems = "center";
    tabItem.style.gap = "8px";

    tabItem.appendChild(focusCheckbox);

    focusCheckbox.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    let faviconElement;
    if (tab.favIconUrl) {
      faviconElement = document.createElement('img');
      faviconElement.src = tab.favIconUrl;
      faviconElement.alt = 'Tab icon';
      faviconElement.className = 'tab-favicon';
      faviconElement.onerror = function () {
        const dot = document.createElement('span');
        dot.className = 'tab-favicon-fallback';
        tabItem.replaceChild(dot, faviconElement);
      };
    } else {
      faviconElement = document.createElement('span');
      faviconElement.className = 'tab-favicon-fallback';
    }

    const titleSpan = document.createElement('span');
    titleSpan.className = 'tab-title';
    const displayTitle = getDisplayTitle(tab);
    titleSpan.textContent = truncateText(displayTitle, 50);

    tabItem.appendChild(faviconElement);
    tabItem.appendChild(titleSpan);

    tabItem.addEventListener('click', function () {
      try {
        if (typeof tab.id === 'number') {
          chrome.tabs.update(tab.id, { active: true }, function () {
            if (chrome.runtime.lastError) {
              console.error('TabZen: Failed to activate tab.', chrome.runtime.lastError);
            }
          });
        } else {
          console.warn('TabZen: Tab does not have a valid ID, cannot activate.');
        }
      } catch (error) {
        console.error('TabZen: Unexpected error when activating tab.', error);
      }
    });

    parentEl.appendChild(tabItem);
  }

  function loadTabs() {
    try {
      chrome.tabs.query({}, function (tabs) {
        console.log('TabZen: chrome.tabs.query returned:', tabs);

        if (chrome.runtime.lastError) {
          console.error('TabZen: Error querying tabs.', chrome.runtime.lastError);
          tabListEl.textContent = 'Please try reloading the extension.';
          return;
        }

        if (!Array.isArray(tabs)) {
          console.error('TabZen: Unexpected tabs result.', tabs);
          tabListEl.textContent = 'Please try reloading the extension.';
          return;
        }

        const totalTabs = tabs.length;
        updateHeader(totalTabs);

        function categorizeTab(url) {
          const safeUrl = typeof url === 'string' ? url : '';
          const urlLower = safeUrl.toLowerCase();

          if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be') ||
              urlLower.includes('netflix.com') || urlLower.includes('spotify.com') ||
              urlLower.includes('twitch.tv') || urlLower.includes('disney')) {
            return { name: 'Entertainment', borderColor: '#ef4444', borderSoft: 'rgba(239, 68, 68, 0.3)' };
          }

          if (urlLower.includes('gmail.com') || urlLower.includes('mail.google') ||
              urlLower.includes('slack.com') || urlLower.includes('notion.so') ||
              urlLower.includes('docs.google') || urlLower.includes('drive.google') ||
              urlLower.includes('zoom.us') || urlLower.includes('teams.microsoft')) {
            return { name: 'Work', borderColor: '#10b981', borderSoft: 'rgba(16, 185, 129, 0.3)' };
          }

          if (urlLower.includes('amazon.com') || urlLower.includes('ebay.com') ||
              urlLower.includes('etsy.com') || urlLower.includes('flipkart.com') ||
              urlLower.includes('aliexpress')) {
            return { name: 'Shopping', borderColor: '#f59e0b', borderSoft: 'rgba(245, 158, 11, 0.3)' };
          }

          if (urlLower.includes('twitter.com') || urlLower.includes('x.com') ||
              urlLower.includes('instagram.com') || urlLower.includes('facebook.com') ||
              urlLower.includes('reddit.com') || urlLower.includes('linkedin.com') ||
              urlLower.includes('tiktok.com')) {
            return { name: 'Social', borderColor: '#8b5cf6', borderSoft: 'rgba(139, 92, 246, 0.3)' };
          }

          if (urlLower.includes('github.com') || urlLower.includes('stackoverflow.com') ||
              urlLower.includes('claude.ai') || urlLower.includes('cursor.sh') ||
              urlLower.includes('vercel.com') || urlLower.includes('gitlab.com')) {
            return { name: 'Development', borderColor: '#3b82f6', borderSoft: 'rgba(59, 130, 246, 0.3)' };
          }

          return { name: 'Other', borderColor: '#6b7280', borderSoft: 'rgba(107, 114, 128, 0.3)' };
        }

        if (totalTabs === 0) {
          tabListEl.textContent = 'No tabs open.';
          return;
        }

        tabListEl.innerHTML = '';

        const allTabs = [];
        const groupedTabs = {};

        tabs.forEach(function (tab) {
          allTabs.push(tab);
          const tabUrl = typeof tab.url === 'string' ? tab.url : '';
          const category = categorizeTab(tabUrl);

          if (!groupedTabs[category.name]) {
            groupedTabs[category.name] = { meta: category, tabs: [] };
          }
          groupedTabs[category.name].tabs.push(tab);
        });

        const categoryOrder = ['Entertainment', 'Work', 'Shopping', 'Social', 'Development', 'Other'];

    

        categoryOrder.forEach(function (categoryName) {
          const group = groupedTabs[categoryName];
          if (!group || !Array.isArray(group.tabs) || group.tabs.length === 0) return;

          const categoryGroupEl = document.createElement('div');
          categoryGroupEl.className = 'category-group collapsed';
          categoryGroupEl.style.setProperty('--cat-border', group.meta.borderColor);

          const headerEl = document.createElement('div');
          headerEl.className = 'category-header';

          const leftEl = document.createElement('div');
          leftEl.className = 'category-header-left';

          const nameEl = document.createElement('span');
          nameEl.className = 'category-name';
          nameEl.textContent = group.meta.name;
          leftEl.appendChild(nameEl);

          const rightEl = document.createElement('div');
          rightEl.className = 'category-header-right';

          const countEl = document.createElement('span');
          countEl.className = 'category-count';
          countEl.textContent = String(group.tabs.length);

          const chevronEl = document.createElement('span');
          chevronEl.className = 'category-chevron';
          chevronEl.textContent = '▸';

          rightEl.appendChild(countEl);
          rightEl.appendChild(chevronEl);

          headerEl.appendChild(leftEl);
          headerEl.appendChild(rightEl);

          const contentEl = document.createElement('div');
          contentEl.className = 'category-content';
          contentEl.style.setProperty('--cat-border-soft', group.meta.borderSoft);

          group.tabs.forEach(function (tab) {
            renderTabItem(tab, contentEl);
          });

          function setExpanded(isExpanded) {
            if (isExpanded) {
              categoryGroupEl.classList.remove('collapsed');
              categoryGroupEl.classList.add('expanded');
              contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
            } else {
              categoryGroupEl.classList.add('collapsed');
              categoryGroupEl.classList.remove('expanded');
              contentEl.style.maxHeight = '0px';
            }
          }

          headerEl.addEventListener('click', function () {
            const isCollapsed = categoryGroupEl.classList.contains('collapsed');
            if (isCollapsed) {
              categoryGroupEl.classList.remove('collapsed');
              categoryGroupEl.classList.add('expanded');
              requestAnimationFrame(function () {
                contentEl.style.maxHeight = contentEl.scrollHeight + 'px';
              });
            } else {
              setExpanded(false);
            }
          });

          categoryGroupEl.appendChild(headerEl);
          categoryGroupEl.appendChild(contentEl);
          tabListEl.appendChild(categoryGroupEl);

          setExpanded(true);
        });

        console.log('TabZen: Loaded tabs:', allTabs);
      });
    } catch (error) {
      console.error('TabZen: Unexpected error when loading tabs.', error);
      tabListEl.textContent = 'Please close and reopen TabZen.';
    }
  }

  /* ============================= */
  /* TIME AGO FORMATTER           */
  /* ============================= */

  function formatTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return diffMinutes <= 1 ? "1 minute ago" : diffMinutes + " minutes ago";
    }
    if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : diffHours + " hours ago";
    }
    if (diffDays < 7) {
      return diffDays === 1 ? "1 day ago" : diffDays + " days ago";
    }
    return past.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  }

  /* ============================= */
  /* RENDER SAVED SESSIONS        */
  /* ============================= */

  function renderSavedSessions() {
    if (!savedSessionsList) return;

    chrome.storage.local.get(["savedSessions"], function (result) {
      const sessions = result.savedSessions || [];

      savedSessionsList.innerHTML = "";

      if (sessions.length === 0) {
        savedSessionsList.innerHTML = "<div style='color:#64748b;font-size:12px;'>No saved sessions yet.</div>";
        return;
      }

      sessions.forEach(function (session) {
        const card = document.createElement("div");
        card.className = "saved-session-card";

        const header = document.createElement("div");
        header.className = "saved-session-header";

        const leftSection = document.createElement("div");
        leftSection.className = "saved-session-left";

        const name = document.createElement("div");
        name.className = "saved-session-name";
        name.textContent = session.name;

        const meta = document.createElement("div");
        meta.className = "saved-session-meta";
        const timeAgo = formatTimeAgo(session.createdAt);
        meta.textContent = session.tabs.length + " tabs • Saved " + timeAgo;

        leftSection.appendChild(name);
        leftSection.appendChild(meta);

        // ✅ CONTEXT NOTE — shows saved note on the card
        if (session.note && session.note.length > 0) {
          const noteEl = document.createElement("div");
          noteEl.className = "saved-session-note";
          noteEl.textContent = "📝 " + session.note;
          leftSection.appendChild(noteEl);
        }

        const actions = document.createElement("div");
        actions.className = "saved-session-actions";

        const restoreBtn = document.createElement("button");
        restoreBtn.className = "restore-btn";
        restoreBtn.textContent = "Restore";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        actions.appendChild(restoreBtn);
        actions.appendChild(deleteBtn);

        header.appendChild(leftSection);
        header.appendChild(actions);
        card.appendChild(header);

        restoreBtn.addEventListener("click", function () {
          session.tabs.forEach(tab => {
            chrome.tabs.create({ url: tab.url });
          });
          showToast("✓ Restoring " + session.tabs.length + " tabs...", "success");
        });

        deleteBtn.addEventListener("click", function () {
          chrome.storage.local.get(["savedSessions"], function (res) {
            const updated = (res.savedSessions || []).filter(s => s.id !== session.id);
            chrome.storage.local.set({ savedSessions: updated }, function () {
              card.style.opacity = "0";
              card.style.transform = "translateY(10px)";
              setTimeout(() => { renderSavedSessions(); }, 200);
              showToast("✓ Workspace cleared", "success");
            });
          });
        });

        savedSessionsList.appendChild(card);
      });
    });
  }

  /* ============================= */
  /* SAVE SESSION MODAL LOGIC     */
  /* ============================= */

  const saveBtn = document.getElementById("save-session-btn");
  const modalOverlay = document.getElementById("save-modal-overlay");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalCancelBtn = document.getElementById("modal-cancel-btn");
  const modalSaveBtn = document.getElementById("modal-save-btn");
  const sessionNameInput = document.getElementById("session-name-input");
  const closeAfterSaveCheckbox = document.getElementById("close-after-save");
  const sessionNoteInput = document.getElementById("session-note-input");

  if (saveBtn && modalOverlay) {

    saveBtn.addEventListener("click", function () {
      modalOverlay.classList.add("active");
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", function () {
        modalOverlay.classList.remove("active");
      });
    }

    if (modalCancelBtn) {
      modalCancelBtn.addEventListener("click", function () {
        modalOverlay.classList.remove("active");
      });
    }

    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove("active");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        modalOverlay.classList.remove("active");
      }
    });

    if (modalSaveBtn) {
      modalSaveBtn.addEventListener("click", function () {

        const sessionName = sessionNameInput.value.trim();

        if (!sessionName) {
          showToast("Enter a session name first.", "info");
          return;
        }

        chrome.tabs.query({}, function (tabs) {
          if (!Array.isArray(tabs)) return;

          // ✅ SAVES THE CONTEXT NOTE with the session
          const sessionData = {
            id: Date.now(),
            name: sessionName,
            note: sessionNoteInput ? sessionNoteInput.value.trim() : "",
            createdAt: new Date().toISOString(),
            tabs: tabs.map(tab => ({
              title: tab.title,
              url: tab.url
            }))
          };

          chrome.storage.local.get(["savedSessions"], function (result) {
            const existingSessions = result.savedSessions || [];

            if (existingSessions.length >= 3) {
              showToast("You've reached your focus limit.", "error");
              return;
            }

            const updatedSessions = [...existingSessions, sessionData];

            chrome.storage.local.set({ savedSessions: updatedSessions }, function () {
              modalOverlay.classList.remove("active");
              sessionNameInput.value = "";
              // ✅ CLEARS the note input after saving
              if (sessionNoteInput) sessionNoteInput.value = "";

              renderSavedSessions();

              if (closeAfterSaveCheckbox && closeAfterSaveCheckbox.checked) {
                const tabIds = tabs.map(tab => tab.id);
                chrome.tabs.remove(tabIds);
              }

              showToast("✓ Session saved safely", "success");
            });
          });
        });
      });
    }
  }

  /* ============================= */
  /* FOCUS SPRINT LOGIC           */
  /* ============================= */

  const startSprintBtn = document.getElementById("startSprintBtn");
  const sprintModal = document.getElementById("sprintModal");
  const confirmSprintBtn = document.getElementById("confirmSprintBtn");
  const cancelSprintBtn = document.getElementById("cancelSprintBtn");
  const sprintGoalInput = document.getElementById("sprintGoalInput");
  const sprintBar = document.getElementById("sprintBar");
  const sprintGoalText = document.getElementById("sprintGoalText");
  const sprintTimer = document.getElementById("sprintTimer");
  const endSprintBtn = document.getElementById("endSprintBtn");

  let sprintInterval = null;
  let sprintTimeRemaining = 0;

  if (startSprintBtn) {
    startSprintBtn.addEventListener("click", function () {
      sprintModal.classList.remove("hidden");
      sprintGoalInput.focus();
    });
  }

  if (cancelSprintBtn) {
    cancelSprintBtn.addEventListener("click", function () {
      sprintModal.classList.add("hidden");
    });
  }

  if (confirmSprintBtn) {
    confirmSprintBtn.addEventListener("click", function () {
      const goal = sprintGoalInput.value.trim();

      if (!goal) {
        alert("Please enter a goal for this sprint.");
        return;
      }

      const selectedCount = document.querySelectorAll(".focus-checkbox:checked").length;
      if (selectedCount === 0) {
        showToast("Select at least one tab to focus on.", "error");
        return;
      }

      sprintModal.classList.add("hidden");
      sprintGoalInput.value = "";

      startSprint(goal);
      showToast("🎯 Sprint started: " + goal, "success");
    });
  }

  function startSprint(goal) {
    if (!sprintBar || !sprintGoalText || !sprintTimer) return;

    if (sprintInterval) {
      clearInterval(sprintInterval);
      sprintInterval = null;
    }

    sprintGoalText.textContent = "Goal: " + goal;
    sprintBar.classList.remove("hidden");

    const sprintDuration = 45 * 60;
    const endTime = Date.now() + sprintDuration * 1000;

    chrome.storage.local.set({
      isSprintActive: true,
      sprintGoal: goal,
      sprintEndTime: endTime
    });

    sprintTimeRemaining = sprintDuration;
    updateTimerDisplay();

    chrome.tabs.query({}, function (allTabs) {
      if (!Array.isArray(allTabs)) return;

      const selectedTabIds = Array.from(
        document.querySelectorAll(".focus-checkbox:checked")
      ).map(cb => parseInt(cb.dataset.tabId));

      if (selectedTabIds.length === 0) return;

      const firstSelectedTab = allTabs.find(tab => selectedTabIds.includes(tab.id));
      if (!firstSelectedTab) return;

      const targetWindowId = firstSelectedTab.windowId;
      const tabsInWindow = allTabs.filter(tab => tab.windowId === targetWindowId);
      const tabsToMove = tabsInWindow
        .filter(tab => !selectedTabIds.includes(tab.id))
        .map(tab => tab.id);

      if (tabsToMove.length === 0) return;

      chrome.windows.create({}, function (newWindow) {
        chrome.tabs.move(tabsToMove, { windowId: newWindow.id, index: -1 });
      });
    });

    sprintInterval = setInterval(function () {
      sprintTimeRemaining--;
      updateTimerDisplay();

      if (sprintTimeRemaining <= 0) {
        clearInterval(sprintInterval);
        sprintInterval = null;
        chrome.storage.local.set({ isSprintActive: false });
        showToast("🎉 Sprint complete!", "success");
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(sprintTimeRemaining / 60);
    const seconds = sprintTimeRemaining % 60;
    sprintTimer.textContent =
      String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  if (endSprintBtn) {
    endSprintBtn.addEventListener("click", function () {
      if (sprintInterval) {
        clearInterval(sprintInterval);
        sprintInterval = null;
      }
      sprintBar.classList.add("hidden");
      chrome.storage.local.set({ isSprintActive: false });
      showToast("Sprint ended.", "info");
    });
  }

  /* ============================= */
  /* RESTORE SPRINT IF ACTIVE     */
  /* ============================= */

  chrome.storage.local.get(
    ["isSprintActive", "sprintGoal", "sprintEndTime"],
    function (data) {
      if (!data.isSprintActive) return;

      const remaining = Math.floor((data.sprintEndTime - Date.now()) / 1000);

      if (remaining <= 0) {
        chrome.storage.local.set({ isSprintActive: false });
        return;
      }

      sprintTimeRemaining = remaining;
      sprintGoalText.textContent = "Goal: " + data.sprintGoal;
      sprintBar.classList.remove("hidden");

      sprintInterval = setInterval(function () {
        sprintTimeRemaining--;
        updateTimerDisplay();

        if (sprintTimeRemaining <= 0) {
          clearInterval(sprintInterval);
          chrome.storage.local.set({ isSprintActive: false });
          showToast("🎉 Sprint complete!", "success");
        }
      }, 1000);

      updateTimerDisplay();
    }
  );

  /* ============================= */
  /* INITIAL LOAD                  */
  /* ============================= */

  loadTabs();
  renderSavedSessions();

});