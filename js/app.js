/**
 * Controlador Principal de la Aplicación
 * Primer Empleo Boyacá (Sogamoso y alrededores)
 * Desarrollado para Grupo 35
 */

import { Store } from './store.js';

// Estado global de la vista
const AppState = {
  currentView: 'explorar',
  previousView: 'explorar',
  currentDetailJobId: null,
  activeFilter: 'all',
  activeSavedFilter: 'all',
  searchTerm: '',
  activeTab: 'req' // 'req' | 'func' | 'loc'
};

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, icon = 'check_circle', duration = 3000) {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toastIcon.textContent = icon;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ==========================================
// NAVEGACIÓN Y CAMBIO DE VISTAS (SPA)
// ==========================================
function switchView(viewName, params = {}) {
  const views = ['explorar', 'detalle', 'guardadas', 'perfil', 'avisos'];
  if (!views.includes(viewName)) return;

  // Registrar vista previa si no estamos en detalle
  if (AppState.currentView !== 'detalle') {
    AppState.previousView = AppState.currentView;
  }
  AppState.currentView = viewName;

  // Ocultar todas las secciones
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.add('hidden');
  });

  // Mostrar vista solicitada
  const targetViewEl = document.getElementById(`view-${viewName}`);
  if (targetViewEl) {
    targetViewEl.classList.remove('hidden');
    targetViewEl.classList.add('animate-slide-up');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Actualizar Título del Header
  const headerTitle = document.getElementById('header-screen-title');
  const titles = {
    explorar: 'Explorar Ofertas',
    detalle: 'Detalle de Vacante',
    guardadas: 'Ofertas Guardadas',
    perfil: 'Mi Perfil de Estudiante',
    avisos: 'Avisos y Novedades'
  };
  if (headerTitle) headerTitle.textContent = titles[viewName] || 'Primer Empleo Boyacá';

  // Actualizar Bottom Navigation bar
  document.querySelectorAll('.nav-item').forEach(btn => {
    const path = btn.getAttribute('data-view');
    const iconSpan = btn.querySelector('.material-symbols-outlined');
    const labelSpan = btn.querySelector('span:last-child');

    if (path === viewName || (viewName === 'detalle' && path === AppState.previousView)) {
      btn.classList.add('text-primary');
      btn.classList.remove('text-on-surface-variant');
      if (iconSpan) iconSpan.style.fontVariationSettings = "'FILL' 1";
      if (labelSpan) labelSpan.classList.add('font-semibold');
    } else {
      btn.classList.remove('text-primary');
      btn.classList.add('text-on-surface-variant');
      if (iconSpan) iconSpan.style.fontVariationSettings = "'FILL' 0";
      if (labelSpan) labelSpan.classList.remove('font-semibold');
    }
  });

  // Acciones al entrar a cada vista
  if (viewName === 'explorar') {
    renderJobsFeed();
  } else if (viewName === 'guardadas') {
    renderSavedJobs();
  } else if (viewName === 'perfil') {
    renderProfileView();
  } else if (viewName === 'avisos') {
    renderNotificationsView();
  } else if (viewName === 'detalle' && params.jobId) {
    renderDetailView(params.jobId);
  }

  updateBadges();
}

// ==========================================
// VISTA 1: EXPLORAR OFERTAS
// ==========================================
function renderJobsFeed() {
  const container = document.getElementById('jobs-feed-container');
  const emptyState = document.getElementById('jobs-empty-state');
  const countBadge = document.getElementById('jobs-count-badge');
  if (!container) return;

  const allJobs = Store.getJobs();
  const search = AppState.searchTerm.toLowerCase().trim();

  // Filtrado
  const filtered = allJobs.filter(job => {
    // Filtro por chips
    let chipMatch = true;
    switch (AppState.activeFilter) {
      case 'no_exp':
        chipMatch = Boolean(job.noExperience || job.badge.includes('experiencia') || job.experienceBadge);
        break;
      case 'medio_tiempo':
        chipMatch = job.modality === 'Medio tiempo';
        break;
      case 'practicas':
        chipMatch = job.modality.includes('Prácticas') || job.modality.includes('Pasantías');
        break;
      case 'sogamoso_centro':
        chipMatch = job.sector.includes('Centro');
        break;
      case 'nobsa':
        chipMatch = job.sector.includes('Nobsa') || job.sector.includes('Industrial');
        break;
      case 'remoto':
        chipMatch = job.sector.includes('Remoto') || job.sector.includes('Híbrido');
        break;
      case 'area_ingenieria':
        chipMatch = job.area === 'Ingeniería';
        break;
      case 'area_admin':
        chipMatch = job.area === 'Administración';
        break;
      case 'area_servicio':
        chipMatch = job.area === 'Atención al Cliente';
        break;
      case 'area_tutoria':
        chipMatch = job.area === 'Educación / Tutorías';
        break;
      default:
        chipMatch = true;
    }

    // Filtro de búsqueda por texto
    let searchMatch = true;
    if (search) {
      const fullText = `${job.title} ${job.company} ${job.area} ${job.locationText} ${job.description} ${job.academicProfile}`.toLowerCase();
      searchMatch = fullText.includes(search);
    }

    return chipMatch && searchMatch;
  });

  // Actualizar conteo
  if (countBadge) countBadge.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const savedIds = Store.getSavedJobIds();
  const appliedIds = Store.getAppliedJobIds();

  container.innerHTML = filtered.map(job => {
    const isSaved = savedIds.includes(job.id);
    const hasApplied = appliedIds.includes(job.id);

    return `
      <article class="relative flex flex-col bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/60 transition-all hover:shadow-md hover:border-primary/30">
        <!-- Fila superior: Logo, Título, Empresa, Bookmark -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0 flex-1">
            <img class="w-12 h-12 rounded-xl object-cover shrink-0 bg-surface-container shadow-inner" src="${job.logo}" alt="Logo de ${job.company}"/>
            <div class="min-w-0 flex-1">
              <h2 class="font-heading font-bold text-sm text-on-surface truncate leading-tight hover:text-primary transition-colors cursor-pointer" onclick="window.app.openJobDetail(${job.id})">
                ${job.title}
              </h2>
              <p class="text-xs text-on-surface-variant font-medium truncate mt-0.5">
                ${job.company}
              </p>
            </div>
          </div>

          <button 
            type="button"
            aria-label="${isSaved ? 'Remover de guardadas' : 'Guardar oferta'}"
            class="btn-toggle-save w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${isSaved ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}"
            data-job-id="${job.id}"
          >
            <span class="material-symbols-outlined text-[22px]" style="${isSaved ? "font-variation-settings: 'FILL' 1;" : ''}">bookmark</span>
          </button>
        </div>

        <!-- Cinta de etiquetas (Tags) -->
        <div class="flex flex-wrap items-center gap-1.5 mt-3">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold font-heading">
            <span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">recommend</span>
            ${job.badge}
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px]">
            <span class="material-symbols-outlined text-[13px]">schedule</span>
            ${job.modality}
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary text-[11px]">
            <span class="material-symbols-outlined text-[13px]">location_on</span>
            ${job.locationText}
          </span>
        </div>

        <!-- Pie de tarjeta: Salario y Acción -->
        <div class="flex items-end justify-between mt-3.5 pt-2 border-t border-surface-container-high/40">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-heading">Asignación</span>
            <span class="font-heading font-extrabold text-sm text-primary">
              ${job.salaryText} <span class="text-[10px] font-normal text-on-surface-variant">${job.salaryUnit || ''}</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            ${hasApplied ? `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tertiary/10 text-tertiary text-xs font-semibold">
                <span class="material-symbols-outlined text-[15px]">check_circle</span>
                <span>Postulado</span>
              </span>
            ` : ''}
            <button 
              type="button"
              class="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-heading font-semibold shadow-sm hover:bg-primary-container active:scale-95 transition-all"
              onclick="window.app.openJobDetail(${job.id})"
            >
              <span>Ver vacante</span>
              <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Vincular eventos a botones de guardado
  container.querySelectorAll('.btn-toggle-save').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const jobId = btn.getAttribute('data-job-id');
      const nowSaved = Store.toggleSaveJob(jobId);
      showToast(nowSaved ? 'Oferta guardada con éxito' : 'Oferta eliminada de guardadas', nowSaved ? 'bookmark_added' : 'bookmark_remove');
      renderJobsFeed();
      updateBadges();
    });
  });
}

// ==========================================
// VISTA 2: DETALLE DE VACANTE
// ==========================================
function renderDetailView(jobId) {
  const job = Store.getJobById(jobId);
  if (!job) {
    switchView('explorar');
    return;
  }
  AppState.currentDetailJobId = job.id;

  // Llenar datos de la vacante
  document.getElementById('detail-company-logo').src = job.logo;
  document.getElementById('detail-title').textContent = job.title;
  document.getElementById('detail-company').textContent = job.company;
  document.getElementById('detail-location-badge').textContent = job.locationText;
  document.getElementById('detail-modality-badge').textContent = `${job.modality} · Horario flexible`;
  document.getElementById('detail-salary').innerHTML = `${job.salaryText} <span class="text-xs font-normal text-on-surface-variant">${job.salaryUnit || ''}</span>`;
  document.getElementById('detail-perk').textContent = job.perkBadge;
  document.getElementById('detail-academic').textContent = job.academicProfile;

  // Lista de Requisitos
  const reqList = document.getElementById('detail-requirements-list');
  reqList.innerHTML = job.requirements.map(req => `
    <li class="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low text-xs">
      <span class="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5" style="font-variation-settings: 'FILL' 1;">check_circle</span>
      <span class="text-on-surface">${req}</span>
    </li>
  `).join('');

  // Lista de Funciones
  const dutiesList = document.getElementById('detail-duties-list');
  dutiesList.innerHTML = job.duties.map((duty, idx) => `
    <li class="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low text-xs">
      <span class="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] shrink-0 mt-0.5">
        ${idx + 1}
      </span>
      <span class="text-on-surface">${duty}</span>
    </li>
  `).join('');

  // Sede & Plus
  document.getElementById('detail-address').textContent = job.address;
  document.getElementById('detail-nearby').textContent = job.nearby;
  document.getElementById('detail-atmosphere').textContent = job.atmosphere;

  // Actualizar Botón de Guardar en la barra inferior de detalle
  const isSaved = Store.isJobSaved(job.id);
  const saveBtn = document.getElementById('detail-toggle-save-btn');
  saveBtn.className = `w-12 h-12 rounded-xl border border-surface-container-high flex items-center justify-center shrink-0 active:scale-95 transition-all ${isSaved ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary'}`;
  saveBtn.innerHTML = `<span class="material-symbols-outlined text-[24px]" style="${isSaved ? "font-variation-settings: 'FILL' 1;" : ''}">bookmark</span>`;

  // Actualizar Botón de Postulación
  const hasApplied = Store.hasApplied(job.id);
  const applyBtn = document.getElementById('detail-apply-btn');
  if (hasApplied) {
    applyBtn.className = "flex-1 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container font-heading font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-default";
    applyBtn.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">verified</span>
      <span>¡Ya te postulaste a esta vacante!</span>
    `;
  } else {
    applyBtn.className = "flex-1 h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-heading font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2";
    applyBtn.innerHTML = `
      <span>Postularme con mi Perfil</span>
      <span class="material-symbols-outlined text-[18px]">send</span>
    `;
  }

  // Activar por defecto la pestaña de Requisitos
  switchDetailTab('req');
}

function switchDetailTab(tabKey) {
  AppState.activeTab = tabKey;
  const tabs = ['req', 'func', 'loc'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-${t}-btn`);
    const content = document.getElementById(`tab-content-${t}`);
    if (t === tabKey) {
      if (btn) btn.classList.add('active');
      if (content) content.classList.remove('hidden');
    } else {
      if (btn) btn.classList.remove('active');
      if (content) content.classList.add('hidden');
    }
  });
}

// ==========================================
// VISTA 3: OFERTAS GUARDADAS
// ==========================================
function renderSavedJobs() {
  const container = document.getElementById('saved-jobs-container');
  const emptyState = document.getElementById('saved-empty-state');
  const countPill = document.getElementById('saved-count-pill');
  if (!container) return;

  const savedJobs = Store.getSavedJobs();

  // Actualizar contador del banner
  if (countPill) countPill.textContent = `${savedJobs.length} vacante${savedJobs.length === 1 ? '' : 's'}`;

  // Actualizar etiquetas de conteo en los chips
  const closingCount = savedJobs.filter(j => j.urgency === 'closing').length;
  const activeCount = savedJobs.filter(j => j.urgency === 'active').length;

  const labelAll = document.getElementById('saved-filter-all-label');
  const labelActive = document.getElementById('saved-filter-active-label');
  const labelClosing = document.getElementById('saved-filter-closing-label');
  if (labelAll) labelAll.textContent = `Todas (${savedJobs.length})`;
  if (labelActive) labelActive.textContent = `Disponibles (${activeCount})`;
  if (labelClosing) labelClosing.textContent = `Cierre cercano (${closingCount})`;

  // Filtrado de guardadas
  const filtered = savedJobs.filter(job => {
    if (AppState.activeSavedFilter === 'active') return job.urgency === 'active';
    if (AppState.activeSavedFilter === 'closing') return job.urgency === 'closing';
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const appliedIds = Store.getAppliedJobIds();

  container.innerHTML = filtered.map(job => {
    const hasApplied = appliedIds.includes(job.id);
    const isClosing = job.urgency === 'closing';

    return `
      <article class="job-card group relative bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/60 transition-all hover:shadow-md">
        <div class="flex items-start justify-between gap-3 mb-2.5">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <img class="w-full h-full object-cover" src="${job.logo}" alt="Logo de ${job.company}"/>
            </div>
            <div class="min-w-0">
              <span class="text-[11px] text-on-surface-variant flex items-center gap-1 font-medium truncate">
                ${job.company}
                <span class="material-symbols-outlined text-[13px] text-primary" style="font-variation-settings: 'FILL' 1;">verified</span>
              </span>
              <h3 class="font-heading font-bold text-sm text-on-surface truncate leading-tight hover:text-primary transition-colors cursor-pointer" onclick="window.app.openJobDetail(${job.id})">
                ${job.title}
              </h3>
            </div>
          </div>

          <!-- Botón para retirar de guardadas -->
          <button 
            type="button" 
            title="Retirar de guardadas" 
            aria-label="Retirar de guardadas"
            class="btn-remove-saved w-8 h-8 rounded-full bg-surface-container hover:bg-error-container hover:text-on-error-container text-primary flex items-center justify-center shrink-0 transition-colors"
            data-job-id="${job.id}"
          >
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">bookmark</span>
          </button>
        </div>

        <!-- Badges rápidos -->
        <div class="flex flex-wrap items-center gap-1.5 mb-3">
          ${isClosing ? `
            <span class="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold flex items-center gap-1 font-heading">
              <span class="material-symbols-outlined text-[13px]">alarm</span>
              ${job.urgencyText}
            </span>
          ` : `
            <span class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold font-heading">
              ${job.urgencyText}
            </span>
          `}
          <span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[11px] font-semibold">
            Sin experiencia
          </span>
          <span class="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px]">
            ${job.modality}
          </span>
          <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary text-[11px] flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[12px]">location_on</span>
            ${job.locationText}
          </span>
        </div>

        <!-- Salario y Acciones -->
        <div class="pt-2 border-t border-surface-container-high/40 flex items-center justify-between gap-3">
          <div>
            <span class="text-[10px] uppercase font-bold text-on-surface-variant block font-heading">Remuneración</span>
            <span class="font-heading font-extrabold text-sm text-primary">${job.salaryText}</span>
          </div>

          <div class="flex items-center gap-2">
            <button 
              type="button" 
              class="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high active:scale-95 transition-all"
              onclick="window.app.openJobDetail(${job.id})"
            >
              Ver Detalle
            </button>
            <button 
              type="button" 
              class="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-heading font-bold shadow-sm hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1"
              onclick="window.app.openApplyModal(${job.id})"
            >
              <span>${hasApplied ? 'Postulado ✓' : 'Postularme'}</span>
              <span class="material-symbols-outlined text-[15px]">send</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Vincular botones de retiro
  container.querySelectorAll('.btn-remove-saved').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const jobId = btn.getAttribute('data-job-id');
      Store.toggleSaveJob(jobId);
      showToast('Oferta retirada de guardadas', 'bookmark_remove');
      renderSavedJobs();
      updateBadges();
    });
  });
}

// ==========================================
// VISTA 4: PERFIL DEL ESTUDIANTE
// ==========================================
function renderProfileView() {
  const profile = Store.getStudentProfile();
  const completion = Store.calculateProfileCompletion();

  // Datos principales
  document.getElementById('profile-avatar').src = profile.avatar;
  document.getElementById('profile-name').textContent = profile.name;
  document.getElementById('profile-career').textContent = `${profile.semester} • ${profile.career}`;
  document.getElementById('profile-location').textContent = profile.location;

  // Barra de completitud
  document.getElementById('profile-completion-pct').textContent = `${completion}%`;
  document.getElementById('profile-completion-bar').style.width = `${completion}%`;

  // Datos de contacto
  document.getElementById('profile-residence').textContent = profile.location;
  document.getElementById('profile-phone').textContent = profile.phone;
  document.getElementById('profile-email').textContent = profile.email;
  document.getElementById('profile-availability').textContent = profile.availability;

  // Formación académica
  document.getElementById('profile-university').textContent = profile.university;
  document.getElementById('profile-faculty').textContent = profile.faculty || 'Facultad Seccional Sogamoso';
  document.getElementById('profile-degree').textContent = profile.career;
  document.getElementById('profile-semester-badge').textContent = profile.semester;

  // Habilidades Técnicas
  const techContainer = document.getElementById('technical-skills-list');
  techContainer.innerHTML = profile.technicalSkills.map(skill => `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
      <span>${skill}</span>
      <button type="button" aria-label="Eliminar ${skill}" class="btn-del-tech hover:text-error transition-colors" data-skill="${skill}">
        <span class="material-symbols-outlined text-[14px]">close</span>
      </button>
    </span>
  `).join('');

  // Habilidades Blandas
  const softContainer = document.getElementById('soft-skills-list');
  softContainer.innerHTML = profile.softSkills.map(skill => `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">
      <span>${skill}</span>
      <button type="button" aria-label="Eliminar ${skill}" class="btn-del-soft hover:text-error transition-colors" data-skill="${skill}">
        <span class="material-symbols-outlined text-[14px]">close</span>
      </button>
    </span>
  `).join('');

  // Eventos para eliminar habilidades
  techContainer.querySelectorAll('.btn-del-tech').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.getAttribute('data-skill');
      Store.removeSkill('technical', skill);
      renderProfileView();
      showToast(`Habilidad "${skill}" eliminada`);
    });
  });

  softContainer.querySelectorAll('.btn-del-soft').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.getAttribute('data-skill');
      Store.removeSkill('soft', skill);
      renderProfileView();
      showToast(`Competencia "${skill}" eliminada`);
    });
  });

  // Avatar del header
  const headerAvatar = document.getElementById('header-avatar');
  if (headerAvatar) headerAvatar.src = profile.avatar;
}

// ==========================================
// VISTA 5: AVISOS Y NOTIFICACIONES
// ==========================================
function renderNotificationsView() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  const notifs = Store.getNotifications();
  if (notifs.length === 0) {
    container.innerHTML = `
      <div class="text-center p-8 bg-surface-container-lowest rounded-2xl border border-surface-container-high/60">
        <p class="text-xs text-on-surface-variant">No tienes avisos pendientes por el momento.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div class="p-3.5 rounded-2xl ${n.read ? 'bg-surface-container-lowest' : 'bg-primary-fixed/20 border-l-4 border-primary'} border border-surface-container-high/60 space-y-1">
      <div class="flex items-center justify-between">
        <h3 class="font-heading font-bold text-xs ${n.read ? 'text-on-surface' : 'text-primary'}">${n.title}</h3>
        <span class="text-[10px] text-on-surface-variant">${n.date}</span>
      </div>
      <p class="text-xs text-on-surface-variant leading-relaxed">${n.message}</p>
    </div>
  `).join('');
}

// ==========================================
// BADGES Y CONTADORES GLOBALES
// ==========================================
function updateBadges() {
  const savedCount = Store.getSavedJobIds().length;
  const navSavedBadge = document.getElementById('nav-saved-badge');
  if (navSavedBadge) {
    if (savedCount > 0) {
      navSavedBadge.textContent = savedCount;
      navSavedBadge.classList.remove('hidden');
    } else {
      navSavedBadge.classList.add('hidden');
    }
  }

  // Notificaciones no leídas
  const unreadNotifs = Store.getNotifications().filter(n => !n.read).length;
  const headerNotifBadge = document.getElementById('header-notif-badge');
  const navNotifDot = document.getElementById('nav-notif-dot');

  if (unreadNotifs > 0) {
    if (headerNotifBadge) headerNotifBadge.classList.remove('hidden');
    if (navNotifDot) navNotifDot.classList.remove('hidden');
  } else {
    if (headerNotifBadge) headerNotifBadge.classList.add('hidden');
    if (navNotifDot) navNotifDot.classList.add('hidden');
  }
}

// ==========================================
// MODAL DE POSTULACIÓN
// ==========================================
let jobToApplyId = null;

function openApplyModal(jobId) {
  const job = Store.getJobById(jobId);
  const profile = Store.getStudentProfile();
  if (!job) return;

  if (Store.hasApplied(job.id)) {
    showToast('Ya te has postulado previamente a esta vacante.', 'info');
    return;
  }

  jobToApplyId = job.id;

  document.getElementById('modal-apply-job-title').textContent = job.title;
  document.getElementById('modal-apply-company').textContent = job.company;
  document.getElementById('modal-apply-name').textContent = profile.name;
  document.getElementById('modal-apply-career').textContent = profile.career;
  document.getElementById('modal-apply-uni').textContent = profile.university;
  document.getElementById('modal-apply-phone').textContent = profile.phone;
  document.getElementById('modal-apply-email').textContent = profile.email;
  document.getElementById('apply-note').value = '';

  const modal = document.getElementById('modal-apply');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeApplyModal() {
  const modal = document.getElementById('modal-apply');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  jobToApplyId = null;
}

// ==========================================
// MODAL DE EDICIÓN DE PERFIL
// ==========================================
function openEditProfileModal() {
  const profile = Store.getStudentProfile();
  document.getElementById('edit-name').value = profile.name;
  document.getElementById('edit-career').value = profile.career;
  document.getElementById('edit-university').value = profile.university;
  document.getElementById('edit-semester').value = profile.semester;
  document.getElementById('edit-location').value = profile.location;
  document.getElementById('edit-phone').value = profile.phone;
  document.getElementById('edit-email').value = profile.email;
  document.getElementById('edit-availability').value = profile.availability;

  const modal = document.getElementById('modal-edit-profile');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeEditProfileModal() {
  const modal = document.getElementById('modal-edit-profile');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar almacén local
  Store.init();

  // Cargar avatar en el header
  const profile = Store.getStudentProfile();
  const headerAvatar = document.getElementById('header-avatar');
  if (headerAvatar) headerAvatar.src = profile.avatar;

  // Inicializar vista por defecto
  switchView('explorar');

  // Eventos de barra superior
  document.getElementById('header-brand-btn').addEventListener('click', () => switchView('explorar'));
  document.getElementById('header-profile-btn').addEventListener('click', () => switchView('perfil'));
  document.getElementById('header-alerts-btn').addEventListener('click', () => switchView('avisos'));

  // Eventos de la barra inferior de navegación
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });

  // Botón Volver en Detalle
  document.getElementById('btn-back-detail').addEventListener('click', () => {
    switchView(AppState.previousView || 'explorar');
  });

  // Pestañas en Detalle
  document.getElementById('tab-req-btn').addEventListener('click', () => switchDetailTab('req'));
  document.getElementById('tab-func-btn').addEventListener('click', () => switchDetailTab('func'));
  document.getElementById('tab-loc-btn').addEventListener('click', () => switchDetailTab('loc'));

  // Botón Guardar en Detalle
  document.getElementById('detail-toggle-save-btn').addEventListener('click', () => {
    if (!AppState.currentDetailJobId) return;
    const nowSaved = Store.toggleSaveJob(AppState.currentDetailJobId);
    showToast(nowSaved ? 'Oferta guardada' : 'Oferta retirada', nowSaved ? 'bookmark_added' : 'bookmark_remove');
    renderDetailView(AppState.currentDetailJobId);
    updateBadges();
  });

  // Botón Postularme en Detalle
  document.getElementById('detail-apply-btn').addEventListener('click', () => {
    if (!AppState.currentDetailJobId) return;
    openApplyModal(AppState.currentDetailJobId);
  });

  // Compartir oferta en Detalle
  document.getElementById('detail-share-btn').addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({
        title: 'Primer Empleo Boyacá',
        text: '¡Encontré esta vacante para personas sin experiencia en Sogamoso!',
        url: window.location.href
      }).catch(() => {});
    } else {
      showToast('Enlace de la vacante copiado al portapapeles', 'link');
    }
  });

  // Buscador en Explorar
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  searchInput.addEventListener('input', (e) => {
    AppState.searchTerm = e.target.value;
    if (e.target.value.length > 0) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
    renderJobsFeed();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    AppState.searchTerm = '';
    clearSearchBtn.classList.add('hidden');
    renderJobsFeed();
    searchInput.focus();
  });

  document.getElementById('reset-filters-btn').addEventListener('click', () => {
    searchInput.value = '';
    AppState.searchTerm = '';
    AppState.activeFilter = 'all';
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active', 'bg-primary', 'text-on-primary'));
    const allChip = document.querySelector('.filter-chip[data-filter="all"]');
    if (allChip) allChip.classList.add('active', 'bg-primary', 'text-on-primary');
    renderJobsFeed();
  });

  // Chips de filtro en Explorar
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => {
        c.classList.remove('active', 'bg-primary', 'text-on-primary');
        if (c.getAttribute('data-filter') === 'no_exp') {
          c.classList.add('bg-primary-fixed', 'text-on-primary-fixed');
        } else if (c.getAttribute('data-filter') === 'all') {
          c.classList.add('bg-surface-container-lowest');
        }
      });

      chip.classList.add('active', 'bg-primary', 'text-on-primary');
      AppState.activeFilter = chip.getAttribute('data-filter');
      renderJobsFeed();
    });
  });

  // Chips de filtro en Guardadas
  document.querySelectorAll('.saved-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.saved-filter-chip').forEach(c => {
        c.classList.remove('active', 'bg-primary', 'text-on-primary');
        c.classList.add('bg-surface-container-lowest', 'text-on-surface');
      });
      chip.classList.add('active', 'bg-primary', 'text-on-primary');
      chip.classList.remove('bg-surface-container-lowest', 'text-on-surface');
      AppState.activeSavedFilter = chip.getAttribute('data-filter');
      renderSavedJobs();
    });
  });

  // Ir a explorar desde estado vacío de guardadas
  document.getElementById('go-explore-from-saved').addEventListener('click', () => {
    switchView('explorar');
  });

  // Modal de Postulación
  document.getElementById('close-modal-apply-btn').addEventListener('click', closeApplyModal);
  document.getElementById('cancel-apply-btn').addEventListener('click', closeApplyModal);
  document.getElementById('confirm-apply-btn').addEventListener('click', () => {
    if (jobToApplyId) {
      Store.applyToJob(jobToApplyId);
      closeApplyModal();
      showToast('¡Postulación enviada exitosamente!', 'celebration');
      if (AppState.currentView === 'detalle') {
        renderDetailView(jobToApplyId);
      } else if (AppState.currentView === 'guardadas') {
        renderSavedJobs();
      } else {
        renderJobsFeed();
      }
      updateBadges();
    }
  });

  // Modal de Editar Perfil
  document.getElementById('btn-open-edit-profile').addEventListener('click', openEditProfileModal);
  document.getElementById('close-modal-edit-profile-btn').addEventListener('click', closeEditProfileModal);
  document.getElementById('cancel-edit-profile-btn').addEventListener('click', closeEditProfileModal);

  document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      name: document.getElementById('edit-name').value,
      career: document.getElementById('edit-career').value,
      university: document.getElementById('edit-university').value,
      semester: document.getElementById('edit-semester').value,
      location: document.getElementById('edit-location').value,
      phone: document.getElementById('edit-phone').value,
      email: document.getElementById('edit-email').value,
      availability: document.getElementById('edit-availability').value
    };
    Store.updateStudentProfile(updated);
    closeEditProfileModal();
    renderProfileView();
    showToast('Perfil actualizado correctamente', 'badge');
  });

  // Agregar habilidad técnica
  const addTechBtn = document.getElementById('add-tech-skill-btn');
  const techInput = document.getElementById('new-tech-skill-input');
  function handleAddTechSkill() {
    const val = techInput.value.trim();
    if (val) {
      Store.addSkill('technical', val);
      techInput.value = '';
      renderProfileView();
      showToast(`Habilidad "${val}" agregada`, 'add_circle');
    }
  }
  addTechBtn.addEventListener('click', handleAddTechSkill);
  techInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechSkill();
    }
  });

  // Agregar habilidad blanda
  const addSoftBtn = document.getElementById('add-soft-skill-btn');
  const softInput = document.getElementById('new-soft-skill-input');
  function handleAddSoftSkill() {
    const val = softInput.value.trim();
    if (val) {
      Store.addSkill('soft', val);
      softInput.value = '';
      renderProfileView();
      showToast(`Competencia "${val}" agregada`, 'add_circle');
    }
  }
  addSoftBtn.addEventListener('click', handleAddSoftSkill);
  softInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSoftSkill();
    }
  });

  // Marcar avisos como leídos
  document.getElementById('mark-read-all-btn').addEventListener('click', () => {
    Store.markNotificationsAsRead();
    renderNotificationsView();
    updateBadges();
    showToast('Todos los avisos marcados como leídos');
  });

  // Exponer API global en window para atributos onclick en HTML dinámico
  window.app = {
    openJobDetail: (id) => {
      switchView('detalle', { jobId: id });
    },
    openApplyModal: (id) => {
      openApplyModal(id);
    }
  };
});
