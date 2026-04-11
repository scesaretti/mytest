(() => {
  const STORAGE_KEY = 'taskflow-accessible-v2';

  const defaultTasks = [
    {
      id: 'task-1',
      title: 'Aggiornare la home page',
      description: 'Rivedere il copy introduttivo e verificare la coerenza dei contenuti pubblicati.',
      status: 'open',
      priority: 'high',
      assignee: 'Marco Rinaldi',
      dueDate: '2026-03-20',
      createdAt: '2026-03-10T09:00:00Z'
    },
    {
      id: 'task-2',
      title: 'Preparare il report mensile',
      description: 'Raccogliere i dati di avanzamento e predisporre una sintesi per il team.',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Laura Bianchi',
      dueDate: '2026-03-25',
      createdAt: '2026-03-09T11:30:00Z'
    },
    {
      id: 'task-3',
      title: 'Verificare le traduzioni',
      description: 'Controllare le stringhe dell’interfaccia per la release di aprile.',
      status: 'completed',
      priority: 'low',
      assignee: 'Giulia Conti',
      dueDate: '2026-03-14',
      createdAt: '2026-03-08T08:15:00Z'
    }
  ];

  const state = {
    tasks: loadTasks(),
    filters: {
      search: '',
      status: 'all',
      priority: 'all',
      sortBy: 'dueDateAsc'
    },
    selectedTaskId: null,
    editingTaskId: null,
    lastFocusedElement: null,
    activeDialog: null,
    pendingConfirmation: null,
    dialogFocusOrigin: null
  };

  const elements = {
    openCreateTask: document.getElementById('open-create-task'),
    filtersForm: document.getElementById('filters-form'),
    searchInput: document.getElementById('search-input'),
    statusFilter: document.getElementById('status-filter'),
    priorityFilter: document.getElementById('priority-filter'),
    sortBy: document.getElementById('sort-by'),
    resetFilters: document.getElementById('reset-filters'),
    taskTableBody: document.getElementById('task-table-body'),
    emptyState: document.getElementById('empty-state'),
    resultsSummary: document.getElementById('results-summary'),
    detailDialog: document.getElementById('detail-dialog'),
    detailOverlay: document.getElementById('detail-overlay'),
    closeDetail: document.getElementById('close-detail'),
    detailContent: document.getElementById('detail-content'),
    formOverlay: document.getElementById('form-overlay'),
    taskFormPanel: document.getElementById('task-form-panel'),
    closeForm: document.getElementById('close-form'),
    cancelForm: document.getElementById('cancel-form'),
    taskForm: document.getElementById('task-form'),
    formTitle: document.getElementById('form-title'),
    taskRowTemplate: document.getElementById('task-row-template'),
    liveRegion: document.getElementById('live-region'),
    taskId: document.getElementById('task-id'),
    taskTitle: document.getElementById('task-title'),
    taskDescription: document.getElementById('task-description'),
    taskStatus: document.getElementById('task-status'),
    taskPriority: document.getElementById('task-priority'),
    taskAssignee: document.getElementById('task-assignee'),
    taskDueDate: document.getElementById('task-due-date'),
    statTotal: document.getElementById('stat-total'),
    statOpen: document.getElementById('stat-open'),
    statInProgress: document.getElementById('stat-in-progress'),
    statCompleted: document.getElementById('stat-completed'),
    confirmOverlay: document.getElementById('confirm-overlay'),
    confirmDialog: document.getElementById('confirm-dialog'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    closeConfirm: document.getElementById('close-confirm'),
    confirmCancel: document.getElementById('confirm-cancel'),
    confirmAccept: document.getElementById('confirm-accept'),
    feedbackOverlay: document.getElementById('feedback-overlay'),
    feedbackDialog: document.getElementById('feedback-dialog'),
    feedbackTitle: document.getElementById('feedback-title'),
    feedbackMessage: document.getElementById('feedback-message'),
    closeFeedback: document.getElementById('close-feedback'),
    feedbackAccept: document.getElementById('feedback-accept')
  };

  initialize();

  function initialize() {
    bindEvents();
    render();
  }

  function bindEvents() {
    elements.openCreateTask.addEventListener('click', () => openForm());
    elements.closeForm.addEventListener('click', closeForm);
    elements.cancelForm.addEventListener('click', closeForm);
    elements.formOverlay.addEventListener('click', closeForm);
    elements.closeDetail.addEventListener('click', closeDetailDialog);
    elements.detailOverlay.addEventListener('click', closeDetailDialog);
    elements.closeConfirm.addEventListener('click', closeConfirmDialog);
    elements.confirmCancel.addEventListener('click', closeConfirmDialog);
    elements.confirmOverlay.addEventListener('click', closeConfirmDialog);
    elements.confirmAccept.addEventListener('click', handleConfirmAccept);
    elements.closeFeedback.addEventListener('click', closeFeedbackDialog);
    elements.feedbackAccept.addEventListener('click', closeFeedbackDialog);
    elements.feedbackOverlay.addEventListener('click', closeFeedbackDialog);

    elements.taskForm.addEventListener('submit', handleFormSubmit);
    elements.filtersForm.addEventListener('submit', handleFiltersSubmit);

    elements.statusFilter.addEventListener('change', handleFiltersSubmit);
    elements.priorityFilter.addEventListener('change', handleFiltersSubmit);
    elements.sortBy.addEventListener('change', handleFiltersSubmit);

    elements.resetFilters.addEventListener('click', resetFilters);

    document.addEventListener('keydown', handleGlobalKeydown);
  }

  function handleFiltersSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    state.filters = {
      search: elements.searchInput.value.trim(),
      status: elements.statusFilter.value,
      priority: elements.priorityFilter.value,
      sortBy: elements.sortBy.value
    };

    render();
    announce('Filtri applicati.');
  }

  function resetFilters() {
    state.filters = {
      search: '',
      status: 'all',
      priority: 'all',
      sortBy: 'dueDateAsc'
    };

    elements.searchInput.value = '';
    elements.statusFilter.value = 'all';
    elements.priorityFilter.value = 'all';
    elements.sortBy.value = 'dueDateAsc';

    render();
    announce('Filtri reimpostati.');
  }

  function handleGlobalKeydown(event) {
    if (event.key === 'Escape') {
      if (state.activeDialog === 'feedback') {
        closeFeedbackDialog();
        return;
      }

      if (state.activeDialog === 'confirm') {
        closeConfirmDialog();
        return;
      }

      if (state.activeDialog === 'detail') {
        closeDetailDialog();
        return;
      }

      if (state.activeDialog === 'form') {
        closeForm();
        return;
      }
    }

    if (event.key === 'Tab') {
      if (state.activeDialog === 'feedback') {
        trapFocus(event, elements.feedbackDialog);
        return;
      }

      if (state.activeDialog === 'confirm') {
        trapFocus(event, elements.confirmDialog);
        return;
      }

      if (state.activeDialog === 'detail') {
        trapFocus(event, elements.detailDialog);
        return;
      }

      if (state.activeDialog === 'form') {
        trapFocus(event, elements.taskFormPanel);
      }
    }
  }

  function render() {
    const filteredTasks = getFilteredTasks();
    renderTaskTable(filteredTasks);
    renderStats();
    renderSummary(filteredTasks.length);

    if (state.selectedTaskId && !state.tasks.some((task) => task.id === state.selectedTaskId)) {
      state.selectedTaskId = null;
    }
  }

  function renderTaskTable(tasks) {
    elements.taskTableBody.innerHTML = '';
    const hasTasks = tasks.length > 0;
    elements.emptyState.hidden = hasTasks;

    if (!hasTasks) {
      return;
    }

    const fragment = document.createDocumentFragment();

    tasks.forEach((task) => {
      const node = elements.taskRowTemplate.content.firstElementChild.cloneNode(true);
      const title = node.querySelector('.task-row-title');
      const statusCell = node.querySelector('.task-row-status');
      const priorityCell = node.querySelector('.task-row-priority');
      const assigneeCell = node.querySelector('.task-row-assignee');
      const dueDateCell = node.querySelector('.task-row-due-date');
      const viewButton = node.querySelector('.action-view');
      const editButton = node.querySelector('.action-edit');
      const toggleButton = node.querySelector('.action-toggle');
      const deleteButton = node.querySelector('.action-delete');

      title.textContent = task.title;
      statusCell.textContent = labelForStatus(task.status);

      const priorityBadge = document.createElement('span');
      priorityBadge.className = `badge badge-${task.priority}`;
      priorityBadge.textContent = labelForPriority(task.priority);
      priorityCell.appendChild(priorityBadge);

      assigneeCell.textContent = task.assignee || 'Non assegnato';
      dueDateCell.textContent = formatDate(task.dueDate);

      viewButton.setAttribute('aria-label', `Mostra i dettagli del task ${task.title}`);
      editButton.setAttribute('aria-label', `Modifica il task ${task.title}`);
      toggleButton.setAttribute('aria-label', `${task.status === 'completed' ? 'Riapri' : 'Completa'} il task ${task.title}`);
      deleteButton.setAttribute('aria-label', `Elimina il task ${task.title}`);
      toggleButton.textContent = task.status === 'completed' ? 'Riapri' : 'Completa';

      viewButton.addEventListener('click', () => openDetailDialog(task.id));
      editButton.addEventListener('click', () => openForm(task.id));
      toggleButton.addEventListener('click', () => toggleTaskStatus(task.id));
      deleteButton.addEventListener('click', () => requestDeleteTask(task.id));

      fragment.appendChild(node);
    });

    elements.taskTableBody.appendChild(fragment);
  }

  function openDetailDialog(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;

    state.selectedTaskId = taskId;
    state.lastFocusedElement = document.activeElement;

    const statusClass = task.status === 'completed' ? 'badge-low' : task.status === 'in-progress' ? 'badge-medium' : 'badge-high';

    elements.detailContent.innerHTML = `
      <span class="badge badge-status ${statusClass}">${labelForStatus(task.status)}</span>
      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.description || 'Nessuna descrizione disponibile.')}</p>
      <dl>
        <dt>Priorità</dt>
        <dd>${labelForPriority(task.priority)}</dd>
        <dt>Assegnato a</dt>
        <dd>${escapeHtml(task.assignee || 'Non assegnato')}</dd>
        <dt>Scadenza</dt>
        <dd>${formatDate(task.dueDate)}</dd>
        <dt>Creato il</dt>
        <dd>${formatDateTime(task.createdAt)}</dd>
      </dl>
    `;

    elements.detailOverlay.hidden = false;
    elements.detailDialog.hidden = false;
    elements.detailDialog.setAttribute('aria-hidden', 'false');
    state.activeDialog = 'detail';
    document.body.style.overflow = 'hidden';
    elements.closeDetail.focus();
  }

  function closeDetailDialog() {
    elements.detailOverlay.hidden = true;
    elements.detailDialog.hidden = true;
    elements.detailDialog.setAttribute('aria-hidden', 'true');
    state.activeDialog = null;
    document.body.style.overflow = '';
    restoreFocus();
  }

  function openForm(taskId = null) {
    state.lastFocusedElement = document.activeElement;
    state.editingTaskId = taskId;

    if (taskId) {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) return;

      elements.formTitle.textContent = 'Modifica task';
      elements.taskId.value = task.id;
      elements.taskTitle.value = task.title;
      elements.taskDescription.value = task.description;
      elements.taskStatus.value = task.status;
      elements.taskPriority.value = task.priority;
      elements.taskAssignee.value = task.assignee;
      elements.taskDueDate.value = task.dueDate;
    } else {
      elements.formTitle.textContent = 'Nuovo task';
      elements.taskForm.reset();
      elements.taskId.value = '';
      elements.taskStatus.value = 'open';
      elements.taskPriority.value = 'high';
      elements.taskDueDate.value = getDefaultDueDate();
    }

    elements.formOverlay.hidden = false;
    elements.taskFormPanel.hidden = false;
    elements.taskFormPanel.setAttribute('aria-hidden', 'false');
    state.activeDialog = 'form';
    document.body.style.overflow = 'hidden';
    elements.taskTitle.focus();
  }

  function closeForm() {
    elements.formOverlay.hidden = true;
    elements.taskFormPanel.hidden = true;
    elements.taskFormPanel.setAttribute('aria-hidden', 'true');
    state.editingTaskId = null;
    state.activeDialog = null;
    document.body.style.overflow = '';
    elements.taskForm.reset();
    restoreFocus();
  }


  function openConfirmDialog({ title, message, confirmLabel = 'Conferma', onConfirm }) {
    state.lastFocusedElement = document.activeElement;
    state.pendingConfirmation = onConfirm;
    state.activeDialog = 'confirm';
    document.body.style.overflow = 'hidden';

    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    elements.confirmAccept.textContent = confirmLabel;
    elements.confirmOverlay.hidden = false;
    elements.confirmDialog.hidden = false;
    elements.confirmDialog.setAttribute('aria-hidden', 'false');
    elements.confirmAccept.focus();
    announce(message);
  }

  function closeConfirmDialog() {
    elements.confirmOverlay.hidden = true;
    elements.confirmDialog.hidden = true;
    elements.confirmDialog.setAttribute('aria-hidden', 'true');
    state.pendingConfirmation = null;
    state.activeDialog = null;
    document.body.style.overflow = '';
    restoreFocus();
  }

  function handleConfirmAccept() {
    const onConfirm = state.pendingConfirmation;
    closeConfirmDialog();
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  }

  function openFeedbackDialog({ title, message }) {
    state.lastFocusedElement = document.activeElement;
    state.activeDialog = 'feedback';
    document.body.style.overflow = 'hidden';

    elements.feedbackTitle.textContent = title;
    elements.feedbackMessage.textContent = message;
    elements.feedbackOverlay.hidden = false;
    elements.feedbackDialog.hidden = false;
    elements.feedbackDialog.setAttribute('aria-hidden', 'false');
    elements.feedbackAccept.focus();
    announce(message);
  }

  function closeFeedbackDialog() {
    elements.feedbackOverlay.hidden = true;
    elements.feedbackDialog.hidden = true;
    elements.feedbackDialog.setAttribute('aria-hidden', 'true');
    state.activeDialog = null;
    document.body.style.overflow = '';
    restoreFocus();
  }

  function restoreFocus() {
    if (state.lastFocusedElement instanceof HTMLElement) {
      state.lastFocusedElement.focus();
      state.lastFocusedElement = null;
    }
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(elements.taskForm);
    const taskPayload = {
      title: String(formData.get('title') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      status: String(formData.get('status') || 'open'),
      priority: String(formData.get('priority') || 'medium'),
      assignee: String(formData.get('assignee') || '').trim(),
      dueDate: String(formData.get('dueDate') || '').trim()
    };

    if (!taskPayload.title || !taskPayload.dueDate) {

      openFeedbackDialog({
        title: 'Campi obbligatori mancanti',
        message: 'Compila i campi obbligatori prima di salvare.'
      });
      return;
    }

    if (state.editingTaskId) {
      state.tasks = state.tasks.map((task) => task.id === state.editingTaskId ? { ...task, ...taskPayload } : task);
    } else {
      const newTask = {
        id: createId(),
        createdAt: new Date().toISOString(),
        ...taskPayload
      };
      state.tasks.unshift(newTask);
      state.selectedTaskId = newTask.id;
    }

    const feedbackMessage = state.editingTaskId
      ? `Task ${taskPayload.title} aggiornato.`
      : `Task ${taskPayload.title} creato.`;

    persistTasks();
    closeForm();
    render();
    openFeedbackDialog({
      title: 'Operazione completata',
      message: feedbackMessage
    });
  }

  function toggleTaskStatus(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;

    const nextStatus = task.status === 'completed' ? 'open' : 'completed';
    state.tasks = state.tasks.map((item) => item.id === taskId ? { ...item, status: nextStatus } : item);

    persistTasks();
    render();
    openFeedbackDialog({
      title: 'Stato aggiornato',
      message: `Task ${task.title} impostato come ${labelForStatus(nextStatus).toLowerCase()}.`
    });
  }

  function requestDeleteTask(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;

    openConfirmDialog({
      title: 'Conferma eliminazione',
      message: `Vuoi davvero eliminare il task ${task.title}?`,
      confirmLabel: 'Elimina task',
      onConfirm: () => deleteTask(taskId)
    });
  }

  function deleteTask(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;

    state.tasks = state.tasks.filter((item) => item.id !== taskId);
    if (state.selectedTaskId === taskId) {
      state.selectedTaskId = null;
    }

    persistTasks();
    render();
    openFeedbackDialog({
      title: 'Task eliminato',
      message: `Task ${task.title} eliminato.`
    });
  }

  function getFilteredTasks() {
    const searchNeedle = state.filters.search.toLowerCase();
    const filtered = state.tasks.filter((task) => {
      const matchesSearch = [task.title, task.description, task.assignee]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchNeedle));
      const matchesStatus = state.filters.status === 'all' || task.status === state.filters.status;
      const matchesPriority = state.filters.priority === 'all' || task.priority === state.filters.priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    return filtered.sort(sortTasks(state.filters.sortBy));
  }

  function renderStats() {
    const totals = {
      total: state.tasks.length,
      open: state.tasks.filter((task) => task.status === 'open').length,
      inProgress: state.tasks.filter((task) => task.status === 'in-progress').length,
      completed: state.tasks.filter((task) => task.status === 'completed').length
    };

    elements.statTotal.textContent = String(totals.total);
    elements.statOpen.textContent = String(totals.open);
    elements.statInProgress.textContent = String(totals.inProgress);
    elements.statCompleted.textContent = String(totals.completed);
  }

  function renderSummary(count) {
    const total = state.tasks.length;
    elements.resultsSummary.textContent = `${count} task visualizzati su ${total}.`;
  }

  function sortTasks(sortBy) {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    switch (sortBy) {
      case 'dueDateDesc':
        return (a, b) => b.dueDate.localeCompare(a.dueDate);
      case 'priorityDesc':
        return (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority] || a.title.localeCompare(b.title, 'it');
      case 'titleAsc':
        return (a, b) => a.title.localeCompare(b.title, 'it');
      case 'dueDateAsc':
      default:
        return (a, b) => a.dueDate.localeCompare(b.dueDate);
    }
  }

  function trapFocus(event, container) {
    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function getFocusableElements(container) {
    return Array.from(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => !element.hasAttribute('hidden'));
  }

  function loadTasks() {
    try {
      const savedTasks = window.localStorage.getItem(STORAGE_KEY);
      if (!savedTasks) return defaultTasks;
      const parsed = JSON.parse(savedTasks);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultTasks;
    } catch (error) {
      console.error('Errore durante il caricamento dei task:', error);
      return defaultTasks;
    }
  }

  function persistTasks() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  }

  function announce(message) {
    elements.liveRegion.textContent = '';
    window.setTimeout(() => {
      elements.liveRegion.textContent = message;
    }, 50);
  }

  function labelForStatus(status) {
    return { open: 'Aperto', 'in-progress': 'In lavorazione', completed: 'Completato' }[status] || status;
  }

  function labelForPriority(priority) {
    return { high: 'Alta', medium: 'Media', low: 'Bassa' }[priority] || priority;
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
  }

  function formatDateTime(value) {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }

  function getDefaultDueDate() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().slice(0, 10);
  }

  function createId() {
    return `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  function escapeHtml(value) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
