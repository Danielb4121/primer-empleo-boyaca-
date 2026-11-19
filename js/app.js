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
  const views = ['explorar', 'detalle', 'guardadas', 'perfil', 'avisos', 'mapa'];
  if (!views.includes(viewName)) return;

  // Registrar vista previa si no estamos en detalle ni mapa
  if (AppState.currentView !== 'detalle' && AppState.currentView !== 'mapa') {
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
    avisos: 'Avisos y Novedades',
    mapa: 'Mapa de Vacantes Boyacá'
  };
  if (headerTitle) headerTitle.textContent = titles[viewName] || 'Primer Empleo Boyacá';

  // Actualizar Bottom Navigation bar
  document.querySelectorAll('.nav-item').forEach(btn => {
    const path = btn.getAttribute('data-view');
    const iconSpan = btn.querySelector('.material-symbols-outlined');
    const labelSpan = btn.querySelector('span:last-child');

    if (path === viewName || ((viewName === 'detalle' || viewName === 'mapa') && path === AppState.previousView)) {
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
  } else if (viewName === 'mapa') {
    initOrUpdateLeafletMap();
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
              <div class="flex items-center gap-1.5 mt-0.5">
                <p class="text-xs text-on-surface-variant font-medium truncate">
                  ${job.company}
                </p>
                ${job.verified ? `
                  <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 verified-badge-anim" title="Empresa Verificada con convenio juvenil">
                    <span class="material-symbols-outlined text-[12px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                    <span>Verificada</span>
                  </span>
                ` : ''}
              </div>
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
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] text-on-surface-variant flex items-center gap-1 font-medium truncate">
                  ${job.company}
                </span>
                ${job.verified ? `
                  <span class="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[9px] font-bold border border-primary/20 verified-badge-anim" title="Empresa Verificada">
                    <span class="material-symbols-outlined text-[11px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                    <span>Verificada</span>
                  </span>
                ` : ''}
              </div>
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
// ==========================================
// FEATURE INNOVADORA 1: CALENDARIO DE ENTREVISTAS (.ICS)
// ==========================================
function downloadInterviewCalendar(jobId) {
  const job = Store.getJobById(jobId) || Store.getInitialJobs()[0];
  if (!job) return;

  // Fecha tentativa: mañana a las 10:00 AM COT
  const now = new Date();
  const interviewDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  interviewDate.setHours(10, 0, 0, 0);
  const endDate = new Date(interviewDate.getTime() + 45 * 60 * 1000); // 45 min

  const formatICSDate = (d) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Primer Empleo Boyacá//Entrevistas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:entrevista-${job.id}-${Date.now()}@primerempleoboyaca.co`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(interviewDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:Entrevista laboral: ${job.title} en ${job.company}`,
    `DESCRIPTION:Recordatorio de entrevista de Primer Empleo Boyacá para el cargo ${job.title} con ${job.company}. Dirección: ${job.address || job.locationText}. Modalidad: ${job.modality}.`,
    `LOCATION:${job.address || job.locationText}, Boyacá, Colombia`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio 30 minutos antes de tu entrevista',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Entrevista_${job.company.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Recordatorio agendado y descargado (.ics)', 'event_available');
}

// ==========================================
// FEATURE INNOVADORA 2: INTEGRACIÓN LINKEDIN
// ==========================================
function shareOnLinkedIn(jobId) {
  const job = Store.getJobById(jobId);
  if (!job) return;

  const appUrl = window.location.href.split('#')[0];
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
  window.open(shareUrl, '_blank', 'width=600,height=500');
  showToast('Abriendo ventana para compartir en LinkedIn', 'share');
}

// ==========================================
// FEATURE INNOVADORA 3: MAPA INTERACTIVO (LEAFLET + OSM)
// ==========================================
let leafletMapInstance = null;
let leafletMarkersLayer = null;

const LOCATION_COORDINATES = {
  1: [5.7153, -72.9333], // Sogamoso Centro (Cl 15 Cra 11)
  2: [5.7250, -72.9280], // Sogamoso Norte
  3: [5.7725, -72.9408], // Sector Industrial Nobsa - Sogamoso
  4: [5.7170, -72.9350], // Plaza de la Villa Sogamoso
  5: [5.7135, -72.9295], // Sogamoso Coworking Seis de Septiembre
  6: [5.7230, -72.9200]  // Sogamoso Santa Inés
};

function initOrUpdateLeafletMap() {
  const mapContainer = document.getElementById('leaflet-map');
  if (!mapContainer || typeof L === 'undefined') return;

  setTimeout(() => {
    if (!leafletMapInstance) {
      // Centro en Sogamoso / Valle de Sugamuxi
      leafletMapInstance = L.map('leaflet-map').setView([5.7200, -72.9300], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuyentes'
      }).addTo(leafletMapInstance);

      leafletMarkersLayer = L.layerGroup().addTo(leafletMapInstance);
    } else {
      leafletMapInstance.invalidateSize();
    }

    // Limpiar marcadores y pintar las vacantes
    leafletMarkersLayer.clearLayers();
    const jobs = Store.getInitialJobs();

    jobs.forEach(job => {
      const coords = LOCATION_COORDINATES[job.id] || [5.7150 + (Math.random() - 0.5) * 0.02, -72.9300 + (Math.random() - 0.5) * 0.02];

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: #006b47; color: white; width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,107,71,0.4); border: 2px solid white;">
            <span class="material-symbols-outlined" style="font-size: 20px;">work</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32]
      });

      const marker = L.marker(coords, { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 190px; padding: 2px;">
          <span style="font-size: 10px; font-weight: bold; color: #006b47; text-transform: uppercase;">${job.area}</span>
          <h4 style="font-weight: 700; font-size: 13px; margin: 2px 0; color: #0b1c30; line-height: 1.2;">${job.title}</h4>
          <p style="font-size: 11px; color: #525d80; margin-bottom: 6px;">${job.company}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <strong style="color: #006b47; font-size: 12px;">${job.salaryText}</strong>
            <button onclick="window.app.openJobDetail(${job.id})" style="background: #006b47; color: white; border: none; padding: 4px 10px; border-radius: 8px; font-size: 11px; cursor: pointer; font-weight: 600;">
              Ver detalle
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      leafletMarkersLayer.addLayer(marker);
    });
  }, 200);
}

// ==========================================
// FEATURE INNOVADORA 4: QUIZ DE HABILIDADES
// ==========================================
const QUIZ_QUESTIONS = [
  {
    question: "¿En qué ambiente de trabajo te sientes más productivo e inspirado?",
    options: [
      { text: "Resolviendo problemas técnicos, programando o analizando datos.", profile: "Tecnología e Innovación", score: "tech" },
      { text: "Organizando procesos, presupuestos, archivos y gestión de equipos.", profile: "Gestión Administrativa y Financiera", score: "admin" },
      { text: "Comunicándome con personas, servicio al cliente o creando contenido digital.", profile: "Comunicación y Marketing", score: "comm" }
    ]
  },
  {
    question: "¿Cuál consideras tu principal fortaleza personal?",
    options: [
      { text: "Pensamiento lógico y capacidad de aprender nuevas herramientas digitales rápidamente.", profile: "Tecnología e Innovación", score: "tech" },
      { text: "Puntualidad, atención meticulosa al detalle y rigurosidad.", profile: "Gestión Administrativa y Financiera", score: "admin" },
      { text: "Empatía, escucha activa y excelente expresión verbal o escrita.", profile: "Comunicación y Marketing", score: "comm" }
    ]
  },
  {
    question: "Si tuvieras tu primer día de trabajo ideal en Boyacá, ¿qué preferirías hacer?",
    options: [
      { text: "Configurar un sistema, automatizar una planilla o brindar soporte técnico de red.", profile: "Tecnología e Innovación", score: "tech" },
      { text: "Revisar normativas, coordinar la agenda del equipo y organizar la correspondencia.", profile: "Gestión Administrativa y Financiera", score: "admin" },
      { text: "Diseñar una campaña para redes o atender a usuarios con amabilidad.", profile: "Comunicación y Marketing", score: "comm" }
    ]
  }
];

let quizAnswers = [];
let quizCurrentIndex = 0;

function renderQuizStep() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  if (quizCurrentIndex < QUIZ_QUESTIONS.length) {
    const q = QUIZ_QUESTIONS[quizCurrentIndex];
    container.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs text-on-surface-variant">
          <span class="font-bold text-primary">Pregunta ${quizCurrentIndex + 1} de ${QUIZ_QUESTIONS.length}</span>
          <span>Progreso: ${Math.round(((quizCurrentIndex) / QUIZ_QUESTIONS.length) * 100)}%</span>
        </div>
        <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div class="h-full bg-primary transition-all duration-300" style="width: ${((quizCurrentIndex) / QUIZ_QUESTIONS.length) * 100}%"></div>
        </div>
        <h4 class="font-heading font-bold text-sm text-on-surface pt-2">${q.question}</h4>
        <div class="space-y-2 pt-1">
          ${q.options.map((opt, i) => `
            <button class="quiz-option-btn w-full text-left p-3 rounded-xl border border-surface-container-high bg-surface-container-low hover:border-primary hover:bg-primary/5 active:scale-98 transition-all flex items-start gap-2.5" data-score="${opt.score}" data-profile="${opt.profile}">
              <span class="w-5 h-5 rounded-full border border-primary/40 text-primary text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">${String.fromCharCode(65 + i)}</span>
              <span class="text-xs text-on-surface leading-snug">${opt.text}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const score = btn.getAttribute('data-score');
        const profile = btn.getAttribute('data-profile');
        quizAnswers.push({ score, profile });
        quizCurrentIndex++;
        renderQuizStep();
      });
    });
  } else {
    // Calcular resultado
    const counts = { tech: 0, admin: 0, comm: 0 };
    quizAnswers.forEach(a => counts[a.score] = (counts[a.score] || 0) + 1);
    let topProfile = 'Tecnología e Innovación';
    let topRecArea = 'area_ingenieria';
    let max = -1;
    if (counts.tech > max) { max = counts.tech; topProfile = 'Ingeniería / Tecnología Junior'; topRecArea = 'area_ingenieria'; }
    if (counts.admin > max) { max = counts.admin; topProfile = 'Gestión Administrativa y Archivo'; topRecArea = 'area_admin'; }
    if (counts.comm > max) { max = counts.comm; topProfile = 'Marketing Digital y Atención al Cliente'; topRecArea = 'area_servicio'; }

    container.innerHTML = `
      <div class="text-center py-3 space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <span class="material-symbols-outlined text-[32px]">military_tech</span>
        </div>
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-primary">Tu Perfil Sugerido</span>
          <h3 class="font-heading font-extrabold text-lg text-on-surface mt-0.5">${topProfile}</h3>
          <p class="text-xs text-on-surface-variant mt-1.5 leading-relaxed max-w-sm mx-auto">
            ¡Felicitaciones! Tus respuestas destacan habilidades orientadas a este campo. Las empresas de Sogamoso buscan perfiles con tu entusiasmo.
          </p>
        </div>
        <div class="p-3 rounded-xl bg-surface-container-low border border-primary/20 text-left space-y-1">
          <p class="font-bold text-xs text-primary flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">verified</span>
            Recomendación para tu postulación:
          </p>
          <p class="text-[11px] text-on-surface-variant">
            Destaca tus proyectos universitarios y disponibilidad de horario flexible en tu carta de presentación.
          </p>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <button id="btn-quiz-retry" class="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-all">
            Repetir Test
          </button>
          <button id="btn-quiz-filter" class="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-heading font-bold text-xs hover:bg-primary-container transition-all">
            Ver Vacantes Afines
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-quiz-retry').addEventListener('click', () => {
      quizAnswers = [];
      quizCurrentIndex = 0;
      renderQuizStep();
    });

    document.getElementById('btn-quiz-filter').addEventListener('click', () => {
      document.getElementById('modal-quiz').classList.add('hidden');
      document.getElementById('modal-quiz').classList.remove('flex');
      switchView('explorar');
      // Activar chip correspondiente
      const chip = document.querySelector(`.filter-chip[data-filter="${topRecArea}"]`);
      if (chip) chip.click();
    });
  }
}

// ==========================================
// FEATURE INNOVADORA 5: CHATBOT IA CON GEMINI
// ==========================================
const CHATBOT_CONTEXT = `
Eres "Boyacá IA", un asesor vocacional y de empleo juvenil para estudiantes y recién graduados en Sogamoso, Nobsa y Boyacá.
Estás integrado en la plataforma "Primer Empleo Boyacá".
Vacantes disponibles actualmente en la plataforma:
1. Auxiliar Administrativo y Gestión Documental - Inversiones & Comercio de Sugamuxi ($1.160.000 COP/mes, Sin experiencia, Sogamoso Centro).
2. Practicante de Sistemas / Soporte TI Junior - TechBoyacá Solutions ($1.300.000 COP/mes, Sin experiencia, Remoto/Híbrido).
3. Asesor Junior de Servicio y Mostrador - Almacenes & Ferreterías Sugamuxi ($1.160.000 COP/mes, Sin experiencia, Sogamoso Cra 11).
4. Auxiliar de Laboratorio y Control de Calidad Junior - Cales & Minerales de Nobsa ($1.200.000 COP/mes, Sin experiencia, Sector Industrial Nobsa).
5. Tutor Académico Universitario en Matemáticas y Física - Academia Sugamuxi ($850.000 COP/mes, 12 hrs/semana, Sogamoso Centro).
6. Auxiliar de Mercadeo Digital y Redes Sociales - AgroBoyacá Gourmet ($950.000 COP/mes, 100% Remoto, Sogamoso).

Responde con tono motivador, amable, profesional y conciso en español. Utiliza emojis ocasionales. Si te preguntan por vacantes, sugiere las anteriores. Si te preguntan por consejos de entrevista u hoja de vida, da 2-3 puntos muy prácticos para jóvenes sin experiencia previa.
`;

async function askGeminiChatbot(userMessage) {
  // Intentar llamada a Gemini API usando Endpoint estándar si se configura una key
  const apiKey = localStorage.getItem('gemini_api_key') || '';
  
  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${CHATBOT_CONTEXT}\n\nPregunta del postulante: ${userMessage}` }]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn('Error llamando a Gemini API, usando respuesta inteligente local:', err);
    }
  }

  // Fallback inteligente contextual sin requerir API key externa
  const msgLower = userMessage.toLowerCase();
  await new Promise(r => setTimeout(r, 600)); // Simulación de pensamiento de IA

  if (msgLower.includes('sin experiencia') || msgLower.includes('cero') || msgLower.includes('0 experiencia')) {
    return '¡Excelente pregunta! En **Primer Empleo Boyacá** el 100% de las vacantes publicadas **no exigen experiencia previa**. Por ejemplo, tienes la opción de **Auxiliar Administrativo en Sugamuxi** ($1.160.000), **Soporte TI Junior en TechBoyacá** ($1.300.000) o **Auxiliar de Laboratorio en Nobsa** ($1.200.000). ¿Te gustaría que te ayude a postular a alguna de estas?';
  }

  if (msgLower.includes('entrevista') || msgLower.includes('tip') || msgLower.includes('consejo')) {
    return 'Aquí tienes **3 tips clave para tu primera entrevista** en empresas de Boyacá:\n1. 🎯 **Investiga la empresa:** Demuestra que conoces sus productos o servicios locales.\n2. 🌟 **Enfócate en tu potencial:** Habla de proyectos de la UPTC, puntualidad y ganas sinceras de aprender.\n3. ⏱️ **Puntualidad boyacense:** Conéctate o llega 10 minutos antes con ropa formal o casual prolija.';
  }

  if (msgLower.includes('hoja de vida') || msgLower.includes('cv') || msgLower.includes('curriculum')) {
    return 'Si aún no tienes trayectoria laboral formal, tu CV debe resaltar:\n• **Formación actual:** Tu carrera en UPTC o institución, semestre y promedio si es alto.\n• **Habilidades blandas y técnicas:** Dominio de software (Excel, Figma, Python) y trabajo en equipo.\n• **Proyectos académicos:** Trabajos de grado, exposiciones o voluntariados.';
  }

  if (msgLower.includes('sistemas') || msgLower.includes('ti') || msgLower.includes('program') || msgLower.includes('ingenier')) {
    return 'Para perfiles de ingeniería y TI, te recomiendo mucho la vacante de **TechBoyacá Solutions** (Soporte TI Junior / Practicante). Ofrece $1.300.000 COP/mes en modalidad semipresencial / híbrida en Sogamoso y es 100% adaptable a tus horarios de clase.';
  }

  if (msgLower.includes('nobsa') || msgLower.includes('planta') || msgLower.includes('industrial')) {
    return 'Para el sector industrial, **Cales & Minerales de Nobsa S.A.** tiene disponible la vacante de *Auxiliar de Calidad* con ruta de transporte Nobsa-Sogamoso incluida y asignación de $1.200.000 COP.';
  }

  return `¡Hola! Con mucho gusto te oriento. En nuestra plataforma de Sogamoso y Boyacá contamos con 6 vacantes verificadas para estudiantes sin experiencia previa con horarios adaptados a tus clases. ¿Deseas tips para tu entrevista, ayuda preparando tu perfil o sugerencias de un sector específico? 🏔️`;
}

function appendChatMessage(sender, text) {
  const container = document.getElementById('chatbot-messages');
  if (!container) return;

  const isUser = sender === 'user';
  const msgEl = document.createElement('div');
  msgEl.className = `flex items-start gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''} animate__animated animate__fadeInUp`;

  msgEl.innerHTML = `
    <div class="w-7 h-7 rounded-lg ${isUser ? 'bg-primary text-on-primary' : 'bg-primary/10 text-primary'} flex items-center justify-center shrink-0 text-xs">
      <span class="material-symbols-outlined text-[16px]">${isUser ? 'person' : 'smart_toy'}</span>
    </div>
    <div class="${isUser ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface-container-lowest border border-surface-container-high text-on-surface rounded-tl-none'} p-3 rounded-2xl shadow-sm space-y-1">
      <p class="leading-relaxed whitespace-pre-line">${text}</p>
    </div>
  `;

  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;
}

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

  // ==========================================
  // EVENTOS PARA LAS NUEVAS FUNCIONALIDADES INNOVADORAS
  // ==========================================

  // 1. Calendario de Entrevistas
  const calendarBtn = document.getElementById('detail-calendar-btn');
  if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      downloadInterviewCalendar(AppState.currentDetailJobId);
    });
  }

  // 2. LinkedIn Share
  const linkedinBtn = document.getElementById('detail-linkedin-btn');
  if (linkedinBtn) {
    linkedinBtn.addEventListener('click', () => {
      shareOnLinkedIn(AppState.currentDetailJobId);
    });
  }

  // 3. Mapa Interactivo Toggle
  const mapBtn = document.getElementById('map-toggle-btn');
  if (mapBtn) {
    mapBtn.addEventListener('click', () => {
      if (AppState.currentView === 'mapa') {
        switchView(AppState.previousView || 'explorar');
      } else {
        switchView('mapa');
      }
    });
  }
  const backMapBtn = document.getElementById('btn-back-map');
  if (backMapBtn) {
    backMapBtn.addEventListener('click', () => {
      switchView(AppState.previousView || 'explorar');
    });
  }

  // 4. Quiz de Habilidades Toggle & Modals
  const quizBtn = document.getElementById('quiz-toggle-btn');
  const quizModal = document.getElementById('modal-quiz');
  const closeQuizBtn = document.getElementById('close-quiz-btn');
  if (quizBtn && quizModal) {
    quizBtn.addEventListener('click', () => {
      quizAnswers = [];
      quizCurrentIndex = 0;
      renderQuizStep();
      quizModal.classList.remove('hidden');
      quizModal.classList.add('flex');
    });
  }
  if (closeQuizBtn && quizModal) {
    closeQuizBtn.addEventListener('click', () => {
      quizModal.classList.add('hidden');
      quizModal.classList.remove('flex');
    });
  }

  // 5. Chatbot IA Toggle & Form
  const chatbotBtn = document.getElementById('chatbot-toggle-btn');
  const chatbotModal = document.getElementById('modal-chatbot');
  const closeChatbotBtn = document.getElementById('close-chatbot-btn');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');

  if (chatbotBtn && chatbotModal) {
    chatbotBtn.addEventListener('click', () => {
      chatbotModal.classList.remove('hidden');
      chatbotModal.classList.add('flex');
      if (chatbotInput) chatbotInput.focus();
    });
  }
  if (closeChatbotBtn && chatbotModal) {
    closeChatbotBtn.addEventListener('click', () => {
      chatbotModal.classList.add('hidden');
      chatbotModal.classList.remove('flex');
    });
  }
  if (chatbotForm && chatbotInput) {
    chatbotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userText = chatbotInput.value.trim();
      if (!userText) return;

      appendChatMessage('user', userText);
      chatbotInput.value = '';

      // Indicador de "escribiendo"
      const tempId = 'typing-' + Date.now();
      const container = document.getElementById('chatbot-messages');
      const typingEl = document.createElement('div');
      typingEl.id = tempId;
      typingEl.className = 'flex items-center gap-2 text-on-surface-variant text-[11px] p-2';
      typingEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-primary animate-ping"></span> Boyacá IA está escribiendo...';
      container.appendChild(typingEl);
      container.scrollTop = container.scrollHeight;

      const aiReply = await askGeminiChatbot(userText);
      const typingNode = document.getElementById(tempId);
      if (typingNode) typingNode.remove();

      appendChatMessage('assistant', aiReply);
    });
  }

  // Quick Prompts del chatbot
  document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      if (chatbotInput) {
        chatbotInput.value = prompt;
        chatbotForm.dispatchEvent(new Event('submit'));
      }
    });
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
