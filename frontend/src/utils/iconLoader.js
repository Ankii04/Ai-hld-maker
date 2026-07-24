/**
 * Single shared lazy loader for react-icons/si (~3,400 components, several
 * MB). Every consumer in the app MUST go through this instead of importing
 * from 'react-icons/si' directly (named or star import) — any additional
 * static import of that module elsewhere causes Rollup to merge the lazy
 * chunk back into the main bundle. See curatedIcons.js for the full story.
 */
let iconSetPromise = null

export function loadIconSet() {
  if (!iconSetPromise) {
    iconSetPromise = import('react-icons/si')
  }
  return iconSetPromise
}
