import { create } from 'zustand'
import api from '../utils/api'
import useAuthStore from './authStore'
import { toast } from 'react-hot-toast'

const useDesignStore = create((set, get) => ({
  /* ─── State ────────────────────────────────────────────── */
  designs: [],
  currentDesign: null,
  versions: [],
  isLoading: false,
  isSaving: false,
  isGenerating: false,
  isChallenging: false,
  error: null,
  // Timestamp generation started — the UI derives an honest elapsed-time
  // readout from this instead of a fake step checklist that used to loop
  // back to "Analysing requirements…" every ~19s on any generation slower
  // than that (nearly all of them; a real generation takes 45–90s).
  generationStartedAt: null,

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

  /* ─── Update a design (title, requirements, etc.) ──────
   * Uses `isSaving`, NOT `isLoading` — the editor shell renders a full
   * LoadingScreen (unmounting every tab + its local state) whenever
   * `isLoading` flips, so a plain autosave/title-edit must never touch it. */
  updateDesign: async (id, updates) => {
    set({ isSaving: true, error: null })
    try {
      const data = await api.put(`/designs/${id}`, updates)
      const updated = data?.data ?? data?.design ?? data
      set((state) => ({
        designs: state.designs.map((d) => (d._id === id || d.id === id ? updated : d)),
        currentDesign:
          state.currentDesign?._id === id || state.currentDesign?.id === id ? updated : state.currentDesign,
        isSaving: false,
      }))
      return { success: true, design: updated }
    } catch (err) {
      set({ isSaving: false, error: err.message })
      return { success: false, message: err.message }
    }
  },

  /* ─── Toggle starred flag (optimistic) ────────────────── */
  toggleStarred: async (id, nextStarred) => {
    set((state) => ({
      designs: state.designs.map((d) =>
        (d._id === id || d.id === id) ? { ...d, starred: nextStarred } : d
      ),
    }))
    try {
      await api.put(`/designs/${id}`, { starred: nextStarred })
      return { success: true }
    } catch (err) {
      // Revert on failure
      set((state) => ({
        designs: state.designs.map((d) =>
          (d._id === id || d.id === id) ? { ...d, starred: !nextStarred } : d
        ),
      }))
      return { success: false, message: err.message }
    }
  },

  /* ─── Persist Canvas tab whiteboard state (debounced by caller) ───────── */
  saveCanvas: async (id, canvas) => {
    try {
      await api.put(`/designs/${id}`, { canvas })
      set((state) => ({
        currentDesign:
          state.currentDesign?._id === id || state.currentDesign?.id === id
            ? { ...state.currentDesign, canvas }
            : state.currentDesign,
      }))
      return { success: true }
    } catch (err) {
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
    set({ isGenerating: true, error: null, generationStartedAt: Date.now() })

    // A real Gemini generation genuinely takes ~45–90s — this isn't just a
    // cold-start message, it's honest reassurance that a long wait is normal.
    const slowRequestTimer = setTimeout(() => {
      toast.loading("Still working — AI blueprint generation typically takes 45–90 seconds.", {
        id: 'slow-generation-notice',
      })
    }, 20000)

    try {
      const data = await api.post(
        `/designs/${id}/generate`,
        inputs,
      )
      clearTimeout(slowRequestTimer)
      toast.dismiss('slow-generation-notice')
      const design = data?.data ?? data?.design ?? data

      set((state) => ({
        currentDesign: design,
        designs: state.designs.map((d) => (d._id === id || d.id === id ? design : d)),
        isGenerating: false,
        generationStartedAt: null,
      }))

      // Refresh fresh user details (includes designsGeneratedThisMonth count)
      try {
        await useAuthStore.getState().fetchMe()
      } catch (_) {}

      return { success: true, design }
    } catch (err) {
      clearTimeout(slowRequestTimer)
      toast.dismiss('slow-generation-notice')
      set({ isGenerating: false, error: err.message, generationStartedAt: null })
      return { success: false, message: err.message, code: err.data?.error }
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
      return { success: false, message: err.message, code: err.data?.error }
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
      return { success: false, message: err.message, code: err.data?.error }
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
    set({ isSaving: true })
    try {
      const data = await api.post(`/designs/${designId}/commit`, { commitMessage })
      const snapshot = data?.data || data
      set((state) => ({
        versions: [snapshot, ...state.versions],
        isSaving: false,
      }))
      return { success: true, snapshot }
    } catch (err) {
      set({ isSaving: false })
      return { success: false, message: err.message }
    }
  },

  /* ─── Rollback current design state to version ────────── */
  rollbackVersion: async (designId, versionId) => {
    set({ isSaving: true })
    try {
      const data = await api.post(`/designs/${designId}/versions/${versionId}/rollback`)
      const updatedDesign = data?.data ?? data
      set({ currentDesign: updatedDesign, isSaving: false })
      // Refresh version list to include the rollback commit
      await get().fetchVersions(designId)
      return { success: true, design: updatedDesign }
    } catch (err) {
      set({ isSaving: false })
      return { success: false, message: err.message }
    }
  },
}))

export default useDesignStore
