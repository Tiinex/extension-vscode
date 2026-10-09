/** Fail-closed Marketplace qualification. Development smoke archives may pin a
 * sibling Core with a placeholder version; they must never masquerade as the
 * exact published dependency tuple used for a real release. */
export function qualifyVsixReleaseCoreBinding(binding = {}, { release = false } = {}) {
  if (!release) return Object.freeze({ status: 'development-only', releaseQualified: false });
  if (binding.bindingMode !== 'installed-package') throw new Error('tiinex.vsix.release.sibling-core-not-published');
  const version = String(binding.version || '');
  const locked = String(binding.lockedVersion || '');
  const declared = String(binding.declaredRange || '');
  if (!/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(version) || /^999(?:\.|$)/.test(version))
    throw new Error('tiinex.vsix.release.placeholder-core-version');
  if (declared !== locked || locked !== version)
    throw new Error('tiinex.vsix.release.dependency-tuple-not-exact');
  return Object.freeze({ status: 'ready', releaseQualified: true, coreVersion: version });
}
