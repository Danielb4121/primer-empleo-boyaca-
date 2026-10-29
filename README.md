# Primer Empleo Boyacá (Sogamoso y Alrededores)

Plataforma web diseñada para que estudiantes universitarios y recién graduados de Sogamoso y la provincia de Sugamuxi encuentren oportunidades laborales y de prácticas **sin requisito de experiencia previa**.

---

## 👥 Equipo de Desarrollo - Grupo 35

* **Danna Ximena Ibañez Forero** – 11826006
* **Liseth Bibiana Pérez Corredor** – 11826016
* **Daniel Alejandro Bonilla Diaz** – 11825507
* **Nelson Leonardo Rojas Quintana** – 11724021

---

## 🎯 Problema que Resuelve

Los estudiantes universitarios pueden necesitar oportunidades laborales en cualquier momento de su carrera: para adquirir experiencia, obtener ingresos, realizar prácticas o prepararse para su futuro profesional. Sin embargo, muchas vacantes exigen experiencia previa y es difícil identificar ofertas adecuadas para quienes aún no la tienen. Esto genera pérdida de tiempo revisando oportunidades que no se ajustan a su situación y dificulta su ingreso al mundo laboral formal en Boyacá.

### 👤 Usuario Objetivo
Estudiantes universitarios de la ciudad de Sogamoso o sus alrededores (UPTC, Unisangil, UNAD, etc.), tanto quienes ya están próximos a graduarse como quienes recién culminaron sus estudios y no cuentan con experiencia laboral previa.

---

## 🚀 Funcionalidades Principales

1. **Explorar Ofertas Laborales sin Experiencia:**
   - Buscador predictivo en tiempo real por cargo, empresa o área.
   - Filtros rápidos tipo chip: *0 Experiencia*, *Medio tiempo*, *Pasantías / Prácticas*, *Sogamoso Centro*, *Sector Industrial / Nobsa*, *Remoto / Híbrido*, *Ingeniería / TI*, *Administración*, *Atención al Cliente*, *Educación / Tutorías*.
   - Feed dinámico con remuneración clara, ubicación y distintivo de primer empleo.

2. **Detalle Completo de la Vacante:**
   - Distintivo de confianza: *Oportunidad Juvenil Verificada 100% Sugamuxi*.
   - Pestañas interactivas para consultar: *Requisitos Académicos*, *Funciones y Aprendizaje del Cargo*, y *Sede, Transporte & Beneficios*.
   - Botón de guardado y botón de postulación directa con los datos del estudiante.

3. **Ofertas Guardadas (Favoritos):**
   - Panel de vacantes de interés almacenadas por el estudiante.
   - Filtros de estado: *Todas*, *Disponibles*, y *Cierre cercano* con alerta de tiempo.
   - Opción para retirar ofertas o postularse de inmediato.

4. **Perfil del Estudiante:**
   - Indicador dinámico de completitud de perfil (%).
   - Datos de contacto, WhatsApp y correo institucional verificado (UPTC).
   - Formación académica y semestre actual.
   - Gestión interactiva de **Habilidades Técnicas** y **Competencias Blandas** (agregar y eliminar).
   - Modal de edición completa con persistencia en `localStorage`.

5. **Avisos y Novedades:**
   - Centro de notificaciones para nuevas convocatorias, tips y confirmaciones de postulación.

---

## 🚫 Alcance del Proyecto (Lo que NO hace)

* La aplicación no garantiza que el usuario consiga empleo.
* No realiza entrevistas ni ofrece cursos de formación.
* Tampoco permite que las empresas publiquen vacantes directamente en esta fase; las ofertas son cargadas y verificadas previamente por el equipo del proyecto.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 Semántico**
* **Tailwind CSS** (con la paleta de colores corporativa de Boyacá y Sogamoso: Verde Esmeralda `#006b47`, Índigo `#525d80`, Teal `#006a61`)
* **JavaScript Moderno (ES6+ Modular)**
* **Material Symbols & Google Fonts** (Plus Jakarta Sans + Inter)
* **Persistencia Local (`localStorage`)** para sincronizar guardados, perfil y postulaciones sin necesidad de backend complejo.

---

## 💻 ¿Cómo Probar la Aplicación en Local?

Tienes dos formas muy sencillas:

### Opción 1: Servidor Local con Python (Recomendado)
Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
python3 -m http.server 8000
```
Luego abre tu navegador en: [http://localhost:8000](http://localhost:8000)

### Opción 2: Abrir directamente
Haz doble clic sobre el archivo `index.html` en el explorador de archivos de tu sistema operativo.

---

## 📦 Repositorio en GitHub

* **URL del repositorio:** [https://github.com/Danielb4121/primer-empleo-boyaca-](https://github.com/Danielb4121/primer-empleo-boyaca-)
* **Rama principal:** `main`
