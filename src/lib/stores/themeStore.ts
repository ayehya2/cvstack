import { create } from 'zustand';

/**
 * Each theme is a COMPLETE standalone look for the entire app.
 * Selecting "Teal" = teal everywhere. Selecting "Light" = classic light everywhere.
 * No separate dark/light toggle.
 */

export interface AppTheme {
    id: string;
    name: string;
    isDark: boolean;
    swatch: string; // preview dot in dropdown
    colors: {
        accent: string;
        accentHover: string;
        accentLight: string;
        sidebar: string;
        sidebarText: string;
        sidebarBorder: string;
        sidebarHover: string;
        mainBg: string;
        mainText: string;
        mainTextSecondary: string;
        cardBg: string;
        cardBorder: string;
        inputBg: string;
        inputBorder: string;
    };
}

export const THEMES: AppTheme[] = [
    // ── BASE ──
    {
        id: 'dark', name: 'Dark', isDark: true, swatch: '#0f172a',
        colors: {
            accent: '#3b82f6', accentHover: '#60a5fa', accentLight: '#1e3a8a',
            sidebar: '#020617', sidebarText: '#e2e8f0', sidebarBorder: '#1e293b', sidebarHover: '#0f172a',
            mainBg: '#0f172a', mainText: '#f1f5f9', mainTextSecondary: '#94a3b8',
            cardBg: '#1e293b', cardBorder: '#334155', inputBg: '#020617', inputBorder: '#334155',
        },
    },
    {
        id: 'light', name: 'Light', isDark: false, swatch: '#edf4fb',
        colors: {
            accent: '#2563eb', accentHover: '#3b82f6', accentLight: '#c7dbf5',
            sidebar: '#3b5278', sidebarText: '#f8fafc', sidebarBorder: '#4d6893', sidebarHover: '#2e4563',
            mainBg: '#edf4fb', mainText: '#0f172a', mainTextSecondary: '#64748b',
            cardBg: '#dce8f3', cardBorder: '#e2e8f0', inputBg: '#f5f9fe', inputBorder: '#cbd5e1',
        },
    },
    // ── COLOR THEMES (dark base) ──
    {
        id: 'indigo', name: 'Indigo', isDark: true, swatch: '#6366f1',
        colors: {
            accent: '#6366f1', accentHover: '#818cf8', accentLight: '#312e81',
            sidebar: '#1e1b4b', sidebarText: '#c7d2fe', sidebarBorder: '#312e81', sidebarHover: '#312e81',
            mainBg: '#0f0d2e', mainText: '#e0e7ff', mainTextSecondary: '#a5b4fc',
            cardBg: '#1e1b4b', cardBorder: '#312e81', inputBg: '#0f0d2e', inputBorder: '#3730a3',
        },
    },
    {
        id: 'violet', name: 'Violet', isDark: true, swatch: '#8b5cf6',
        colors: {
            accent: '#8b5cf6', accentHover: '#a78bfa', accentLight: '#4c1d95',
            sidebar: '#2e1065', sidebarText: '#ddd6fe', sidebarBorder: '#4c1d95', sidebarHover: '#3b0764',
            mainBg: '#1a0533', mainText: '#ede9fe', mainTextSecondary: '#c4b5fd',
            cardBg: '#2e1065', cardBorder: '#4c1d95', inputBg: '#1a0533', inputBorder: '#5b21b6',
        },
    },
    {
        id: 'purple', name: 'Purple', isDark: true, swatch: '#a855f7',
        colors: {
            accent: '#a855f7', accentHover: '#c084fc', accentLight: '#581c87',
            sidebar: '#3b0764', sidebarText: '#e9d5ff', sidebarBorder: '#581c87', sidebarHover: '#581c87',
            mainBg: '#1a0533', mainText: '#f3e8ff', mainTextSecondary: '#d8b4fe',
            cardBg: '#3b0764', cardBorder: '#581c87', inputBg: '#1a0533', inputBorder: '#6b21a8',
        },
    },
    {
        id: 'fuchsia', name: 'Fuchsia', isDark: true, swatch: '#d946ef',
        colors: {
            accent: '#d946ef', accentHover: '#e879f9', accentLight: '#701a75',
            sidebar: '#4a044e', sidebarText: '#f5d0fe', sidebarBorder: '#701a75', sidebarHover: '#701a75',
            mainBg: '#2e0230', mainText: '#fae8ff', mainTextSecondary: '#f0abfc',
            cardBg: '#4a044e', cardBorder: '#701a75', inputBg: '#2e0230', inputBorder: '#86198f',
        },
    },
    {
        id: 'rose', name: 'Rose', isDark: true, swatch: '#f43f5e',
        colors: {
            accent: '#f43f5e', accentHover: '#fb7185', accentLight: '#881337',
            sidebar: '#4c0519', sidebarText: '#fecdd3', sidebarBorder: '#881337', sidebarHover: '#881337',
            mainBg: '#2a0211', mainText: '#ffe4e6', mainTextSecondary: '#fda4af',
            cardBg: '#4c0519', cardBorder: '#881337', inputBg: '#2a0211', inputBorder: '#9f1239',
        },
    },
    {
        id: 'red', name: 'Red', isDark: true, swatch: '#ef4444',
        colors: {
            accent: '#ef4444', accentHover: '#f87171', accentLight: '#7f1d1d',
            sidebar: '#450a0a', sidebarText: '#fecaca', sidebarBorder: '#7f1d1d', sidebarHover: '#7f1d1d',
            mainBg: '#1f0505', mainText: '#fee2e2', mainTextSecondary: '#fca5a5',
            cardBg: '#450a0a', cardBorder: '#7f1d1d', inputBg: '#1f0505', inputBorder: '#991b1b',
        },
    },
    {
        id: 'orange', name: 'Orange', isDark: true, swatch: '#f97316',
        colors: {
            accent: '#f97316', accentHover: '#fb923c', accentLight: '#7c2d12',
            sidebar: '#431407', sidebarText: '#fed7aa', sidebarBorder: '#7c2d12', sidebarHover: '#7c2d12',
            mainBg: '#1c0a03', mainText: '#ffedd5', mainTextSecondary: '#fdba74',
            cardBg: '#431407', cardBorder: '#7c2d12', inputBg: '#1c0a03', inputBorder: '#9a3412',
        },
    },
    {
        id: 'amber', name: 'Amber', isDark: true, swatch: '#f59e0b',
        colors: {
            accent: '#f59e0b', accentHover: '#fbbf24', accentLight: '#78350f',
            sidebar: '#451a03', sidebarText: '#fde68a', sidebarBorder: '#78350f', sidebarHover: '#78350f',
            mainBg: '#1c0c02', mainText: '#fef3c7', mainTextSecondary: '#fcd34d',
            cardBg: '#451a03', cardBorder: '#78350f', inputBg: '#1c0c02', inputBorder: '#92400e',
        },
    },
    {
        id: 'emerald', name: 'Emerald', isDark: true, swatch: '#10b981',
        colors: {
            accent: '#10b981', accentHover: '#34d399', accentLight: '#064e3b',
            sidebar: '#022c22', sidebarText: '#a7f3d0', sidebarBorder: '#064e3b', sidebarHover: '#064e3b',
            mainBg: '#011613', mainText: '#d1fae5', mainTextSecondary: '#6ee7b7',
            cardBg: '#022c22', cardBorder: '#064e3b', inputBg: '#011613', inputBorder: '#065f46',
        },
    },
    {
        id: 'teal', name: 'Teal', isDark: true, swatch: '#14b8a6',
        colors: {
            accent: '#14b8a6', accentHover: '#2dd4bf', accentLight: '#134e4a',
            sidebar: '#042f2e', sidebarText: '#99f6e4', sidebarBorder: '#134e4a', sidebarHover: '#134e4a',
            mainBg: '#021716', mainText: '#ccfbf1', mainTextSecondary: '#5eead4',
            cardBg: '#042f2e', cardBorder: '#134e4a', inputBg: '#021716', inputBorder: '#115e59',
        },
    },
    {
        id: 'cyan', name: 'Cyan', isDark: true, swatch: '#06b6d4',
        colors: {
            accent: '#06b6d4', accentHover: '#22d3ee', accentLight: '#164e63',
            sidebar: '#083344', sidebarText: '#a5f3fc', sidebarBorder: '#164e63', sidebarHover: '#164e63',
            mainBg: '#041a22', mainText: '#cffafe', mainTextSecondary: '#67e8f9',
            cardBg: '#083344', cardBorder: '#164e63', inputBg: '#041a22', inputBorder: '#155e75',
        },
    },
    {
        id: 'sky', name: 'Sky', isDark: true, swatch: '#0ea5e9',
        colors: {
            accent: '#0ea5e9', accentHover: '#38bdf8', accentLight: '#0c4a6e',
            sidebar: '#082f49', sidebarText: '#bae6fd', sidebarBorder: '#0c4a6e', sidebarHover: '#0c4a6e',
            mainBg: '#041825', mainText: '#e0f2fe', mainTextSecondary: '#7dd3fc',
            cardBg: '#082f49', cardBorder: '#0c4a6e', inputBg: '#041825', inputBorder: '#075985',
        },
    },
    {
        id: 'green', name: 'Green', isDark: true, swatch: '#22c55e',
        colors: {
            accent: '#22c55e', accentHover: '#4ade80', accentLight: '#14532d',
            sidebar: '#052e16', sidebarText: '#bbf7d0', sidebarBorder: '#14532d', sidebarHover: '#14532d',
            mainBg: '#021a0b', mainText: '#dcfce7', mainTextSecondary: '#86efac',
            cardBg: '#052e16', cardBorder: '#14532d', inputBg: '#021a0b', inputBorder: '#166534',
        },
    },
    {
        id: 'pink', name: 'Pink', isDark: true, swatch: '#ec4899',
        colors: {
            accent: '#ec4899', accentHover: '#f472b6', accentLight: '#831843',
            sidebar: '#500724', sidebarText: '#fbcfe8', sidebarBorder: '#831843', sidebarHover: '#831843',
            mainBg: '#280413', mainText: '#fce7f3', mainTextSecondary: '#f9a8d4',
            cardBg: '#500724', cardBorder: '#831843', inputBg: '#280413', inputBorder: '#9d174d',
        },
    },
    {
        id: 'slate', name: 'Slate', isDark: true, swatch: '#64748b',
        colors: {
            accent: '#64748b', accentHover: '#94a3b8', accentLight: '#1e293b',
            sidebar: '#020617', sidebarText: '#cbd5e1', sidebarBorder: '#1e293b', sidebarHover: '#0f172a',
            mainBg: '#020617', mainText: '#e2e8f0', mainTextSecondary: '#94a3b8',
            cardBg: '#0f172a', cardBorder: '#1e293b', inputBg: '#020617', inputBorder: '#334155',
        },
    },
    // ── COLOR THEMES (light base) ──
    {
        id: 'arctic', name: 'Arctic', isDark: false, swatch: '#0ea5e9',
        colors: {
            accent: '#0284c7', accentHover: '#0ea5e9', accentLight: '#e0f2fe',
            sidebar: '#0c4a6e', sidebarText: '#e0f2fe', sidebarBorder: '#075985', sidebarHover: '#075985',
            mainBg: '#f0f9ff', mainText: '#0c4a6e', mainTextSecondary: '#0369a1',
            cardBg: '#e0f2fe', cardBorder: '#bae6fd', inputBg: '#f0f9ff', inputBorder: '#7dd3fc',
        },
    },
    {
        id: 'mint', name: 'Mint', isDark: false, swatch: '#14b8a6',
        colors: {
            accent: '#0d9488', accentHover: '#14b8a6', accentLight: '#ccfbf1',
            sidebar: '#134e4a', sidebarText: '#ccfbf1', sidebarBorder: '#115e59', sidebarHover: '#115e59',
            mainBg: '#f0fdfa', mainText: '#134e4a', mainTextSecondary: '#0f766e',
            cardBg: '#ccfbf1', cardBorder: '#99f6e4', inputBg: '#f0fdfa', inputBorder: '#5eead4',
        },
    },
    {
        id: 'lavender', name: 'Lavender', isDark: false, swatch: '#8b5cf6',
        colors: {
            accent: '#7c3aed', accentHover: '#8b5cf6', accentLight: '#ede9fe',
            sidebar: '#4c1d95', sidebarText: '#ede9fe', sidebarBorder: '#5b21b6', sidebarHover: '#5b21b6',
            mainBg: '#f5f3ff', mainText: '#4c1d95', mainTextSecondary: '#6d28d9',
            cardBg: '#ede9fe', cardBorder: '#ddd6fe', inputBg: '#f5f3ff', inputBorder: '#c4b5fd',
        },
    },
    {
        id: 'coral', name: 'Coral', isDark: false, swatch: '#f97316',
        colors: {
            accent: '#ea580c', accentHover: '#f97316', accentLight: '#ffedd5',
            sidebar: '#7c2d12', sidebarText: '#ffedd5', sidebarBorder: '#9a3412', sidebarHover: '#9a3412',
            mainBg: '#fff7ed', mainText: '#7c2d12', mainTextSecondary: '#c2410c',
            cardBg: '#ffedd5', cardBorder: '#fed7aa', inputBg: '#fff7ed', inputBorder: '#fdba74',
        },
    },
];

export const THEME_MAP = Object.fromEntries(THEMES.map(t => [t.id, t])) as Record<string, AppTheme>;

// ── Store ──

const STORAGE_KEY = 'app-theme';

function loadThemeId(): string {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && THEME_MAP[saved]) return saved;
    } catch { /* ignore */ }
    return 'dark';
}

interface ThemeState {
    themeId: string;
    setTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    themeId: loadThemeId(),
    setTheme: (id) => {
        if (!THEME_MAP[id]) return;
        localStorage.setItem(STORAGE_KEY, id);
        set({ themeId: id });
    },
}));

/**
 * Apply all theme CSS variables + dark class to the document.
 */
export function applyTheme(themeId: string): boolean {
    const theme = THEME_MAP[themeId] || THEME_MAP['dark'];
    const c = theme.colors;
    const root = document.documentElement;
    const s = root.style;

    // Accent
    s.setProperty('--accent', c.accent);
    s.setProperty('--accent-hover', c.accentHover);
    s.setProperty('--accent-light', c.accentLight);
    // Sidebar
    s.setProperty('--sidebar-bg', c.sidebar);
    s.setProperty('--sidebar-text', c.sidebarText);
    s.setProperty('--sidebar-border', c.sidebarBorder);
    s.setProperty('--sidebar-hover', c.sidebarHover);
    // Main content
    s.setProperty('--main-bg', c.mainBg);
    s.setProperty('--main-text', c.mainText);
    s.setProperty('--main-text-secondary', c.mainTextSecondary);
    // Cards
    s.setProperty('--card-bg', c.cardBg);
    s.setProperty('--card-border', c.cardBorder);
    // Inputs
    s.setProperty('--input-bg', c.inputBg);
    s.setProperty('--input-border', c.inputBorder);

    // Tailwind dark class
    if (theme.isDark) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }

    return theme.isDark;
}
