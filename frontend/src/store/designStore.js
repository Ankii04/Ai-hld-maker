import { create } from 'zustand'
import api from '../utils/api'
import useAuthStore from './authStore'
import { toast } from 'react-hot-toast'

/**
 * Generation step messages — shown in the UI as progress feedback
 * while the AI is building the design.
 */
const GENERATION_STEPS = [
  'Analysing requirements…',
  'Designing high-level architecture…',
  'Mapping service boundaries…',
  'Generating component diagram…',
  'Drafting low-level design…',
  'Defining database schemas…',
  'Specifying API contracts…',
  'Building Scalability guidelines…',
  'Running architecture challenge…',
  'Finalising blueprint…',
]

const useDesignStore = create((set, get) => ({
  /* ─── State ────────────────────────────────────────────── */
  designs: [],
  currentDesign: null,
  versions: [],
  isLoading: false,
  isGenerating: false,
  isChallenging: false,
  error: null,
  generationStep: '',
  generationStepIndex: 0,
  _stepTimer: null,

  /* ─── Internal helpers ────────────────────────────────── */
  _startStepCycle: () => {
    let idx = 0
    set({ generationStep: GENERATION_STEPS[0], generationStepIndex: 0 })
    const timer = setInterval(() => {
      idx = (idx + 1) % GENERATION_STEPS.length
      set({ generationStep: GENERATION_STEPS[idx], generationStepIndex: idx })
    }, 3200)
    set({ _stepTimer: timer })
  },

  _stopStepCycle: () => {
    const { _stepTimer } = get()
    if (_stepTimer) {
      clearInterval(_stepTimer)
      set({ _stepTimer: null, generationStep: '', generationStepIndex: 0 })
    }
  },

  /* ─── Fetch all designs for the current user ──────────── */
  fetchDesigns: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get('/designs')
      const list = Array.isArray(data) ? data : (data?.data || [])
      set({ designs: list, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ isLoading: false, error: err.message })
      return { success: false, message: err.message }
    }
  },

  /* ─── Fetch a single design by ID ────────────────────── */
  fetchDesign: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get(`/designs/${id}`)
      const design = data?.data ?? data?.design ?? data
      set({ currentDesign: design, isLoading: false })
      return { success: true, design }
    } catch (err) {
      set({ isLoading: false, error: err.message })
      return { success: false, message: err.message }
    }
  },

  /* ─── Create a new blank design ───────────────────────── */
  createDesign: async (designData) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.post('/designs', designData)
      const design = data?.data ?? data?.design ?? data
      set((state) => ({
        designs: [design, ...state.designs],
        currentDesign: design,
        isLoading: false,
      }))
      return { success: true, design }
    } catch (err) {
      set({ isLoading: false, error: err.message })
      return { success: false, message: err.message }
    }
  },

  /* ─── Update a design (title, requirements, etc.) ────── */
  updateDesign: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.put(`/designs/${id}`, updates)
      const updated = data?.data ?? data?.design ?? data
      set((state) => ({
        designs: state.designs.map((d) => (d._id === id || d.id === id ? updated : d)),
        currentDesign:
          state.currentDesign?._id === id || state.currentDesign?.id === id ? updated : state.currentDesign,
        isLoading: false,
      }))
      return { success: true, design: updated }
    } catch (err) {
      set({ isLoading: false, error: err.message })
      return { success: false, message: err.message }
    }
  },

  /* ─── Delete a design ─────────────────────────────────── */
  deleteDesign: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/designs/${id}`)
      set((state) => ({
        designs: state.designs.filter((d) => d._id !== id && d.id !== id),
        currentDesign:
          state.currentDesign?._id === id || state.currentDesign?.id === id ? null : state.currentDesign,
        isLoading: false,
      }))
      return { success: true }
    } catch (err) {
      set({ isLoading: false, error: err.message })
      return { success: false, message: err.message }
    }
  },

  /* ─── AI Generate — triggers full blueprint generation ── */
  generateDesign: async (id, inputs) => {
    set({ isGenerating: true, error: null })
    get()._startStepCycle()

    const coldStartTimer = setTimeout(() => {
      toast.loading('Standing by: The backend server is waking up. This can take up to 60 seconds...', {
        id: 'cold-start-warning',
      })
    }, 6000)

    try {
      const data = await api.post(
        `/designs/${id}/generate`,
        inputs,
      )
      clearTimeout(coldStartTimer)
      toast.dismiss('cold-start-warning')
      const design = data?.data ?? data?.design ?? data

      get()._stopStepCycle()
      set((state) => ({
        currentDesign: design,
        designs: state.designs.map((d) => (d._id === id || d.id === id ? design : d)),
        isGenerating: false,
        generationStep: 'Complete!',
      }))

      // Refresh fresh user details (includes designsGeneratedThisMonth count)
      try {
        await useAuthStore.getState().fetchMe()
      } catch (_) {}

      // Clear the 'Complete!' message after a brief delay
      setTimeout(() => set({ generationStep: '' }), 1500)

      return { success: true, design }
    } catch (err) {
      clearTimeout(coldStartTimer)
      toast.dismiss('cold-start-warning')
      get()._stopStepCycle()
      set({ isGenerating: false, error: err.message })
      return { success: false, message: err.message }
    }
  },

  /* ─── AI Challenge — critique / stress-test the design ─ */
  challengeDesign: async (id) => {
    set({ isChallenging: true, error: null })
    try {
      const data = await api.post(`/designs/${id}/challenge`)
      const challengeMode = data?.data ?? data

      set((state) => {
        const patch = (d) =>
          d._id === id || d.id === id ? { ...d, challengeMode } : d
        return {
          currentDesign:
            state.currentDesign?._id === id || state.currentDesign?.id === id
              ? patch(state.currentDesign)
              : state.currentDesign,
          designs: state.designs.map(patch),
          isChallenging: false,
        }
      })
      return { success: true }
    } catch (err) {
      set({ isChallenging: false, error: err.message })
      return { success: false, message: err.message }
    }
  },

  /* ─── Share — generate a public share link ────────────── */
  shareDesign: async (id) => {
    try {
      const data = await api.post(`/designs/${id}/share`)
      const shareData = data?.data ?? data
      const shareId = shareData?.shareId ?? shareData?.share_id ?? shareData?.id

      // Patch share info into both lists
      set((state) => {
        const patch = (d) =>
          d._id === id || d.id === id ? { ...d, shareId, isPublic: true } : d
        return {
          designs: state.designs.map(patch),
          currentDesign:
            state.currentDesign?._id === id || state.currentDesign?.id === id
              ? patch(state.currentDesign)
              : state.currentDesign,
        }
      })
      return { success: true, shareId }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },

  /* ─── UI/UX Generate Visual Mockup ───────────────────── */
  generateUiMockup: async (id, screenName) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.post(`/designs/${id}/uiux/generate-mockup`, { screenName })
      const updated = data?.uiux || data?.data || data
      set((state) => {
        if (!state.currentDesign) return state
        return {
          currentDesign: {
            ...state.currentDesign,
            uiux: updated,
          },
          isLoading: false,
        }
      })
      return { success: true, uiux: updated }
    } catch (err) {
      set({ isLoading: false, error: err.message })
      return { success: false, message: err.message }
    }
  },

  /* ─── Local node/edge mutations (whiteboard drag-and-drop) */
  updateLocalNodes: (nodes) => {
    set((state) => {
      if (!state.currentDesign) return state
      return {
        currentDesign: {
          ...state.currentDesign,
          hld: {
            ...(state.currentDesign.hld ?? {}),
            nodes,
          },
        },
      }
    })
  },

  updateLocalEdges: (edges) => {
    set((state) => {
      if (!state.currentDesign) return state
      return {
        currentDesign: {
          ...state.currentDesign,
          hld: {
            ...(state.currentDesign.hld ?? {}),
            edges,
          },
        },
      }
    })
  },

  /* ─── Set / clear the current design ─────────────────── */
  setCurrentDesign: (design) => set({ currentDesign: design }),

  clearCurrentDesign: () => set({ currentDesign: null }),

  /* ─── Clear transient error ───────────────────────────── */
  clearError: () => set({ error: null }),

  /* ─── Fetch committed versions for active design ──────── */
  fetchVersions: async (designId) => {
    try {
      const data = await api.get(`/designs/${designId}/versions`)
      const list = data?.data || []
      set({ versions: list })
      return { success: true, versions: list }
    } catch (err) {
      return { success: false, message: err.message }
    }
  },

  /* ─── Commit/Snapshot current design state ────────────── */
  commitVersion: async (designId, commitMessage) => {
    set({ isLoading: true })
    try {
      const data = await api.post(`/designs/${designId}/commit`, { commitMessage })
      const snapshot = data?.data || data
      set((state) => ({
        versions: [snapshot, ...state.versions],
        isLoading: false,
      }))
      return { success: true, snapshot }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.message }
    }
  },

  /* ─── Rollback current design state to version ────────── */
  rollbackVersion: async (designId, versionId) => {
    set({ isLoading: true })
    try {
      const data = await api.post(`/designs/${designId}/versions/${versionId}/rollback`)
      const updatedDesign = data?.data ?? data
      set({ currentDesign: updatedDesign, isLoading: false })
      // Refresh version list to include the rollback commit
      await get().fetchVersions(designId)
      return { success: true, design: updatedDesign }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.message }
    }
  },
}))

export default useDesignStore
