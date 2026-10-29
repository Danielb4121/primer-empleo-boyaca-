/**
 * Gestor de estado local con persistencia en localStorage
 * Primer Empleo Boyacá
 */

import { INITIAL_JOBS, INITIAL_STUDENT_PROFILE, INITIAL_NOTIFICATIONS } from '../data/jobs.js';

const STORAGE_KEYS = {
  JOBS: 'peb_jobs',
  SAVED_JOB_IDS: 'peb_saved_job_ids',
  APPLIED_JOB_IDS: 'peb_applied_job_ids',
  STUDENT_PROFILE: 'peb_student_profile',
  NOTIFICATIONS: 'peb_notifications',
  ALERTS_CONFIG: 'peb_alerts_config'
};

export const Store = {
  // Inicialización de datos
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAVED_JOB_IDS)) {
      // Dejamos guardadas las ofertas 1 y 2 por defecto como en el prototipo
      localStorage.setItem(STORAGE_KEYS.SAVED_JOB_IDS, JSON.stringify([1, 2]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPLIED_JOB_IDS)) {
      localStorage.setItem(STORAGE_KEYS.APPLIED_JOB_IDS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(INITIAL_STUDENT_PROFILE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  },

  // Obtener todas las ofertas
  getJobs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOBS);
      return data ? JSON.parse(data) : INITIAL_JOBS;
    } catch (e) {
      return INITIAL_JOBS;
    }
  },

  // Obtener una oferta por ID
  getJobById(id) {
    const jobs = this.getJobs();
    return jobs.find(j => j.id === Number(id));
  },

  // IDs de ofertas guardadas
  getSavedJobIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_JOB_IDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Verificar si una oferta está guardada
  isJobSaved(id) {
    const savedIds = this.getSavedJobIds();
    return savedIds.includes(Number(id));
  },

  // Alternar guardado (toggle bookmark)
  toggleSaveJob(id) {
    const numId = Number(id);
    let savedIds = this.getSavedJobIds();
    const isSaved = savedIds.includes(numId);
    if (isSaved) {
      savedIds = savedIds.filter(item => item !== numId);
    } else {
      savedIds.unshift(numId);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_JOB_IDS, JSON.stringify(savedIds));
    return !isSaved; // retorna el nuevo estado (true = guardada, false = removida)
  },

  // Obtener la lista completa de ofertas guardadas
  getSavedJobs() {
    const savedIds = this.getSavedJobIds();
    const allJobs = this.getJobs();
    return savedIds.map(id => allJobs.find(j => j.id === id)).filter(Boolean);
  },

  // IDs de ofertas a las que se ha postulado
  getAppliedJobIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLIED_JOB_IDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Verificar si ya se postuló
  hasApplied(id) {
    const applied = this.getAppliedJobIds();
    return applied.includes(Number(id));
  },

  // Registrar postulación
  applyToJob(id) {
    const numId = Number(id);
    const applied = this.getAppliedJobIds();
    if (!applied.includes(numId)) {
      applied.push(numId);
      localStorage.setItem(STORAGE_KEYS.APPLIED_JOB_IDS, JSON.stringify(applied));
      
      // Agregar notificación de confirmación
      const job = this.getJobById(numId);
      if (job) {
        this.addNotification({
          title: `¡Postulación enviada con éxito!`,
          message: `Te has postulado a "${job.title}" en ${job.company}. Tus datos de contacto fueron registrados para el equipo evaluador.`,
          type: "application",
          read: false
        });
      }
      return true;
    }
    return false;
  },

  // Perfil del estudiante
  getStudentProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE);
      return data ? JSON.parse(data) : INITIAL_STUDENT_PROFILE;
    } catch (e) {
      return INITIAL_STUDENT_PROFILE;
    }
  },

  // Actualizar perfil
  updateStudentProfile(newProfile) {
    const current = this.getStudentProfile();
    const updated = { ...current, ...newProfile };
    localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(updated));
    return updated;
  },

  // Agregar habilidad técnica o blanda
  addSkill(type, skillName) {
    const cleanName = skillName.trim();
    if (!cleanName) return;
    const profile = this.getStudentProfile();
    if (type === 'technical') {
      if (!profile.technicalSkills.includes(cleanName)) {
        profile.technicalSkills.push(cleanName);
      }
    } else if (type === 'soft') {
      if (!profile.softSkills.includes(cleanName)) {
        profile.softSkills.push(cleanName);
      }
    }
    this.updateStudentProfile(profile);
  },

  // Remover habilidad
  removeSkill(type, skillName) {
    const profile = this.getStudentProfile();
    if (type === 'technical') {
      profile.technicalSkills = profile.technicalSkills.filter(s => s !== skillName);
    } else if (type === 'soft') {
      profile.softSkills = profile.softSkills.filter(s => s !== skillName);
    }
    this.updateStudentProfile(profile);
  },

  // Calcular porcentaje de completitud del perfil
  calculateProfileCompletion() {
    const profile = this.getStudentProfile();
    let score = 0;
    if (profile.name) score += 15;
    if (profile.career) score += 15;
    if (profile.university) score += 15;
    if (profile.location) score += 10;
    if (profile.phone) score += 15;
    if (profile.email) score += 10;
    if (profile.availability) score += 10;
    if (profile.technicalSkills && profile.technicalSkills.length >= 3) score += 5;
    if (profile.softSkills && profile.softSkills.length >= 2) score += 5;
    return Math.min(100, score);
  },

  // Notificaciones
  getNotifications() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  },

  addNotification({ title, message, type = 'info' }) {
    const list = this.getNotifications();
    const newNotif = {
      id: Date.now(),
      title,
      message,
      date: 'Hace unos momentos',
      read: false,
      type
    };
    list.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  },

  markNotificationsAsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }
};
