import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    { name: 'survey360-auth' }
  )
);

// Organization Store
export const useOrgStore = create(
  persist(
    (set) => ({
      organizations: [],
      currentOrg: null,
      setOrganizations: (organizations) => set({ organizations }),
      setCurrentOrg: (org) => set({ currentOrg: org }),
    }),
    { name: 'survey360-org' }
  )
);

// UI Store
export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: 'survey360-ui' }
  )
);

// Survey Store
export const useSurveyStore = create((set) => ({
  surveys: [],
  currentSurvey: null,
  setSurveys: (surveys) => set({ surveys }),
  setCurrentSurvey: (survey) => set({ currentSurvey: survey }),
  addSurvey: (survey) => set((state) => ({ surveys: [...state.surveys, survey] })),
  updateSurvey: (id, updates) => set((state) => ({
    surveys: state.surveys.map((s) => (s.id === id ? { ...s, ...updates } : s)),
  })),
}));
