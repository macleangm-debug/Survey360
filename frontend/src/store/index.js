import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
      },
      
      getToken: () => get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Organization Store
export const useOrgStore = create(
  persist(
    (set) => ({
      currentOrg: null,
      organizations: [],
      
      setCurrentOrg: (org) => set({ currentOrg: org }),
      setOrganizations: (orgs) => set({ organizations: orgs }),
      
      clearOrg: () => set({ currentOrg: null, organizations: [] }),
    }),
    {
      name: 'org-storage',
    }
  )
);

// Project Store
export const useProjectStore = create((set) => ({
  currentProject: null,
  projects: [],
  
  setCurrentProject: (project) => set({ currentProject: project }),
  setProjects: (projects) => set({ projects }),
  
  clearProject: () => set({ currentProject: null, projects: [] }),
}));

// Form Builder Store
export const useFormBuilderStore = create((set, get) => ({
  currentForm: null,
  fields: [],
  selectedField: null,
  isDirty: false,
  
  setForm: (form) => set({ currentForm: form, fields: form?.fields || [], isDirty: false }),
  
  setFields: (fields) => set({ fields, isDirty: true }),
  
  addField: (field) => {
    const fields = [...get().fields, { ...field, order: get().fields.length }];
    set({ fields, isDirty: true });
  },
  
  updateField: (fieldId, updates) => {
    const fields = get().fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    );
    set({ fields, isDirty: true });
  },
  
  removeField: (fieldId) => {
    const fields = get().fields.filter(f => f.id !== fieldId);
    set({ fields, isDirty: true });
  },
  
  reorderFields: (newOrder) => {
    const fields = newOrder.map((id, index) => {
      const field = get().fields.find(f => f.id === id);
      return { ...field, order: index };
    });
    set({ fields, isDirty: true });
  },
  
  selectField: (fieldId) => set({ selectedField: fieldId }),
  
  clearForm: () => set({ currentForm: null, fields: [], selectedField: null, isDirty: false }),
  
  markClean: () => set({ isDirty: false }),
}));

// UI Store
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  language: 'en',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  
  setLanguage: (language) => set({ language }),
}));
