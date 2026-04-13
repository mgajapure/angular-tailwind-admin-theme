# AdminKit — Angular v21 + Tailwind CSS v4

A professional, feature-rich admin dashboard theme built with **Angular v21** (standalone components, signals) and **Tailwind CSS v4**.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

Open [http://localhost:4200](http://localhost:4200)

**Demo login:** any email + any password (mocked auth)

---

## 📁 Project Structure

```
src/app/
├── core/
│   ├── services/         # ConfigService, ThemeService, LayoutService, AuthService, ToastService
│   ├── guards/           # authGuard, roleGuard
│   └── interceptors/     # authInterceptor
├── shared/
│   └── components/       # 20+ reusable UI components
│       ├── button/        ui-button
│       ├── badge/         ui-badge
│       ├── card/          ui-card
│       ├── avatar/        ui-avatar
│       ├── spinner/       ui-spinner
│       ├── skeleton/      ui-skeleton
│       ├── modal/         ui-modal
│       ├── drawer/        ui-drawer
│       ├── pagination/    ui-pagination
│       ├── progress/      ui-progress
│       ├── tabs/          ui-tabs
│       ├── accordion/     ui-accordion
│       ├── stat-card/     ui-stat-card
│       ├── breadcrumb/    ui-breadcrumb
│       ├── empty-state/   ui-empty-state
│       ├── notification/  app-toast-stack
│       ├── command-palette/ app-command-palette
│       └── form/
│           ├── input/     ui-input
│           └── toggle/    ui-toggle
├── layout/
│   ├── admin-layout/      Main shell layout
│   ├── sidebar/           Adaptive sidebar (expanded/mini/mobile)
│   ├── topbar/            Header with search, dark mode, notifications, user menu
│   └── settings-panel/    Live theme configurator drawer
├── features/
│   ├── dashboard/         KPI cards, charts, transactions table
│   ├── analytics/         Traffic, pages, devices
│   ├── users/             User management with CRUD
│   ├── settings/          Profile, notifications, security FAQ
│   ├── auth/              Login page with split layout
│   └── not-found/         404 page
└── config/
    ├── navigation.config.ts   Data-driven nav menu
    └── theme.config.ts        Color schemes, radius presets
```

---

## 🎨 Theme System

### Color Schemes
5 built-in schemes: **Indigo** (default), **Violet**, **Emerald**, **Rose**, **Amber**

### Dynamic Config
Settings are persisted to `localStorage` and applied instantly via Angular Signals + CSS custom properties.

```ts
// Change color scheme programmatically
configService.update('theme', { colorScheme: 'violet' });

// Toggle dark mode
themeService.toggleDark();
```

### CSS Tokens
All design tokens live in `src/styles/tokens.css` under `@theme`:
- Colors, spacing, shadows, radius, sidebar dimensions, transitions

---

## 🧩 Components

All components are **standalone**, use **Angular Signals**, and support **dark mode**.

### Button
```html
<ui-button variant="primary" size="md" [loading]="false">Click me</ui-button>
<ui-button variant="danger" size="sm">Delete</ui-button>
<ui-button variant="ghost" [iconOnly]="true">...</ui-button>
```
Variants: `primary | secondary | ghost | outline | danger | success`

### Badge
```html
<ui-badge variant="success" [dot]="true">Active</ui-badge>
<ui-badge variant="warning" [dismissible]="true">Pending</ui-badge>
```

### Modal
```html
<ui-modal title="Confirm Delete" size="sm" (close)="isOpen = false" *ngIf="isOpen">
  Are you sure?
  <div modal-footer>
    <ui-button variant="outline" (click)="isOpen = false">Cancel</ui-button>
    <ui-button variant="danger" (click)="confirm()">Delete</ui-button>
  </div>
</ui-modal>
```

### Toast
```ts
toastService.success('Saved!', 'Your changes have been saved.');
toastService.error('Error', 'Something went wrong.');
toastService.warning('Warning', 'Disk space is low.');
toastService.info('Info', 'A new version is available.');
```

### StatCard
```html
<ui-stat-card label="Revenue" [value]="84529" prefix="$" [trend]="12.5" [sparkline]="[30,45,60,55,70]" color="primary">
  <path stat-icon d="...SVG path..." />
</ui-stat-card>
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette |
| `Escape` | Close modals, drawers, command palette |

---

## 🌙 Dark Mode

Dark mode is toggled via the topbar sun/moon button or the settings panel. It adds the `.dark` class to `<html>` and CSS custom properties are automatically overridden.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21.x (standalone + signals) |
| Styling | Tailwind CSS 4.x |
| State | Angular Signals |
| Icons | Inline SVG (no dependency) |
| Fonts | Inter (Google Fonts) |

---

## 🔧 Customization

### Adding a new nav item
Edit `src/app/config/navigation.config.ts`:
```ts
{ id: 'reports', label: 'Reports', icon: 'file-text', route: '/reports' }
```

### Adding a new color scheme
Add a CSS class in `src/styles/tokens.css`:
```css
.theme-cyan {
  --color-primary-600: #0891b2;
  /* ... */
}
```
Then add it to `colorSchemes` in `src/app/config/theme.config.ts`.

### Adding a new route
Add to `src/app/app.routes.ts` and create the component under `src/app/features/`.
