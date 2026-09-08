import { stat } from 'node:fs/promises';

export interface StableProbeSnapshot { exists: boolean; size: number; mtimeMs: number }
export interface StableProbeOptions { stableSamples?: number; intervalMs?: number; maxSamples?: number }


export function isDiscoverySessionEvent(observedAtMs: number, sessionStartedAtMs: number): boolean {
  return Number.isFinite(observedAtMs)
    && Number.isFinite(sessionStartedAtMs)
    && sessionStartedAtMs > 0
    && observedAtMs >= sessionStartedAtMs;
}

export function isHandoffPackagePath(value: string): boolean {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized.endsWith('.handoff-package.zip') && !/\.(?:crdownload|part|tmp)$/i.test(normalized);
}

export async function waitForStableProbe(
  probe: () => Promise<StableProbeSnapshot>,
  sleep: (ms: number) => Promise<void>,
  options: StableProbeOptions = {}
): Promise<boolean> {
  const stableSamples = Math.max(2, options.stableSamples ?? 3);
  const intervalMs = Math.max(25, options.intervalMs ?? 350);
  const maxSamples = Math.max(stableSamples, options.maxSamples ?? 30);
  let lastKey = '';
  let stable = 0;
  for (let index = 0; index < maxSamples; index += 1) {
    const snapshot = await probe();
    if (!snapshot.exists || snapshot.size <= 0) {
      stable = 0;
      lastKey = '';
    } else {
      const key = `${snapshot.size}:${snapshot.mtimeMs}`;
      stable = key === lastKey ? stable + 1 : 1;
      lastKey = key;
      if (stable >= stableSamples) return true;
    }
    if (index < maxSamples - 1) await sleep(intervalMs);
  }
  return false;
}

export async function waitForStableFile(filePath: string, options: StableProbeOptions = {}): Promise<boolean> {
  return waitForStableProbe(async () => {
    try {
      const info = await stat(filePath);
      return { exists: info.isFile(), size: info.size, mtimeMs: info.mtimeMs };
    } catch {
      return { exists: false, size: 0, mtimeMs: 0 };
    }
  }, (ms) => new Promise((resolve) => setTimeout(resolve, ms)), options);
}
