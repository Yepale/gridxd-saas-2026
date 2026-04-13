# 📝 GRIDXD: Tareas y Mejoras Pendientes (2026)

## 🛠️ Prioridad Alta (Q2 2026) - [COMPLETADOS]
- [x] **Vectorización (PNG to SVG):** Integrado mediante `imagetracerjs` para ofrecer descarga vectorial.
- [x] **Soporte de Alta Resolución (2K):** Implementado escalado a 2048px por defecto.
- [x] **Configuración VITE_GRIDXD_API_URL:** Backend desplegado en Railway, URL configurada en Vercel.
- [x] **Landing Page - Social Proof:** Sección de testimonios y casos de uso añadida.
- [x] **Modo "Diseño":** Toggle de fondo del canvas (Cuadrícula / Blanco / Negro / Transparente).
- [x] **Optimización de imágenes:** Compresión DEFLATE + escala 1024px opcional antes de generar el ZIP.
- [x] **Editor Web Integrado:** UI para que el usuario pueda borrar cuadros de detección erróneos o añadir nuevos manualmente.
- [x] **Historial de usuario:** Tabla en Supabase `processing_history` para guardar logs de archivos procesados y previsualizaciones.
- [x] **Ajuste Óptico Dinámico:** IA que sugiera el centrado óptico de los iconos detectados.
- [x] **Ecosistema**: API Documentation, Figma Plugin (Prototipo), CLI Tool (Prototipo).

---

## 🔥 NEXT LEVEL ROADMAP: "The System Generator" (Q3/Q4 2026)
*Product Vision: "Stop manually extracting icons from AI mockups. Get a complete UI icon pack from any image in seconds."*

### 1. Sistema Dual de Modos (UX/UI)
- [ ] **Modo 1 - Extraer (Actual Core):** Detecta iconos de mockups y los empaqueta.
- [ ] **Modo 2 - Generar (Nuevo Roadmap):** Entiende el estilo visual de un logo/imagen y genera un sistema de iconos coherente desde cero.

### 2. Generación Estilizada (Backend IA)
- [ ] **Style Extractor:** Integrar LLM Vision para crear "System Prompts" de estilo basados en la imagen subida.
- [ ] **Generador Generativo (SD/DALL-E):** Conectar API de generación para crear nuevos iconos consistentes bajo el mismo *prompt de estilo*.
- [ ] **Gestión de UI:** Menú lateral en el editor web para inyectar iconos faltantes en el pack (Home, User, Settings, etc.).

### 3. Core Icon Set (El Pack Estándar Profesional)
- [ ] **Estandarización de Ouptut:** Forzar estructura estricta en el ZIP final garantizando que parezca un producto pro.
  - *Navegación:* `icon-home.svg`, `icon-menu.svg`, `icon-back.svg`
  - *Usuario:* `icon-user.svg`, `icon-login.svg`
  - *Sistema:* `icon-settings.svg`, `icon-search.svg`
  - *Feedback:* `icon-check.svg`, `icon-warning.svg`

### 4. Pack Styles & Personalización
- [ ] **Selector de Estilos Globales:** Ofrecer 3 variaciones al exportar o generar:
  - Outline (Default)
  - Filled
  - Duotone
