// Check-only: the hook never rewrites files, so what you staged is what gets committed.
export default {
  '*.{ts,tsx}': ['eslint --max-warnings=0', 'prettier --check'],
  '*.{js,mjs,json,md,yml,yaml,css}': ['prettier --check'],
}
