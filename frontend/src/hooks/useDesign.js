import useDesignStore from '../store/designStore'

/**
 * useDesign
 * ---------
 * Convenience hook that exposes the complete design store.
 * Consumers get both state slices and action functions in one import.
 *
 * Usage:
 *   const { designs, currentDesign, isGenerating, generateDesign } = useDesign()
 */
export const useDesign = () => {
  const {
    /* State */
    designs,
    currentDesign,
    isLoading,
    isGenerating,
    isChallenging,
    error,
    generationStep,
    generationStepIndex,

    /* CRUD actions */
    fetchDesigns,
    fetchDesign,
    createDesign,
    updateDesign,
    deleteDesign,

    /* AI actions */
    generateDesign,
    challengeDesign,
    shareDesign,

    /* Local whiteboard mutations */
    updateLocalNodes,
    updateLocalEdges,

    /* Convenience setters */
    setCurrentDesign,
    clearCurrentDesign,
    clearError,
  } = useDesignStore()

  return {
    designs,
    currentDesign,
    isLoading,
    isGenerating,
    isChallenging,
    error,
    generationStep,
    generationStepIndex,
    fetchDesigns,
    fetchDesign,
    createDesign,
    updateDesign,
    deleteDesign,
    generateDesign,
    challengeDesign,
    shareDesign,
    updateLocalNodes,
    updateLocalEdges,
    setCurrentDesign,
    clearCurrentDesign,
    clearError,
  }
}

export default useDesign
