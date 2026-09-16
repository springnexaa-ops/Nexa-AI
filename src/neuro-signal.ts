/**
 * Nexa NeuroSignal Engine v0.1
 *
 * Derived from signal-processing concepts reviewed from the referenced
 * electrophysiology repositories. This implementation is original code;
 * it does not copy third-party source files.
 *
 * Scope: deterministic signal QC and basic time-domain features for EEG/EMG/ECG.
 * It is not a diagnostic classifier.
 */

export type NeuroModality = "EEG" | "EMG" | "ECG";

export interface NeuroSignalInput {
  modality: NeuroModality;
  samplingRateHz: number;
  signal: number[];
}

export interface NeuroFeatures {
  sampleCount: number;
  durationSeconds: number;
  samplingRateHz: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  peakToPeak: number;
  standardDeviation: number;
  variance: number;
  rms: number;
  meanAbsoluteValue: number;
  waveformLength: number;
  zeroCrossings: number;
  areaAbsolute: number;
  crestFactor: number;
  quality: {
    finite: boolean;
    clippedSamples: number;
    dcOffset: number;
    usable: boolean;
    warnings: string[];
  };
}

const MAX_SAMPLES = 200_000;

export function validateNeuroSignal(input: NeuroSignalInput): string[] {
  const errors: string[] = [];
  if (!(input.modality === "EEG" || input.modality === "EMG" || input.modality === "ECG")) errors.push("Unsupported modality.");
  if (!Number.isFinite(input.samplingRateHz) || input.samplingRateHz <= 0 || input.samplingRateHz > 100_000) errors.push("samplingRateHz must be between 0 and 100000.");
  if (!Array.isArray(input.signal) || input.signal.length < 16) errors.push("signal must contain at least 16 samples.");
  if (Array.isArray(input.signal) && input.signal.length > MAX_SAMPLES) errors.push(`signal exceeds the ${MAX_SAMPLES} sample safety limit.`);
  if (Array.isArray(input.signal) && input.signal.some(v => !Number.isFinite(v))) errors.push("signal contains non-finite samples.");
  return errors;
}

function sorted(values: number[]): number[] { return [...values].sort((a, b) => a - b); }
function median(values: number[]): number {
  const s = sorted(values); const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function extractNeuroFeatures(input: NeuroSignalInput): NeuroFeatures {
  const errors = validateNeuroSignal(input);
  if (errors.length) throw new Error(errors.join(" "));

  const x = input.signal;
  const n = x.length;
  let sum = 0, sumSq = 0, absSum = 0, areaAbs = 0, wl = 0, zeroCrossings = 0;
  let min = Infinity, max = -Infinity, clippedSamples = 0;

  for (let i = 0; i < n; i++) {
    const v = x[i];
    sum += v;
    sumSq += v * v;
    absSum += Math.abs(v);
    min = Math.min(min, v);
    max = Math.max(max, v);
    if (Math.abs(v) >= 0.999999 * Math.max(Math.abs(min), Math.abs(max), 1)) clippedSamples++;
    if (i > 0) {
      wl += Math.abs(v - x[i - 1]);
      const a = x[i - 1], b = v;
      if ((a < 0 && b >= 0) || (a > 0 && b <= 0)) zeroCrossings++;
    }
  }

  const mean = sum / n;
  const variance = Math.max(0, sumSq / n - mean * mean);
  const sd = Math.sqrt(variance);
  const rms = Math.sqrt(sumSq / n);
  const mav = absSum / n;
  const dt = 1 / input.samplingRateHz;
  const areaAbsolute = absSum * dt;
  const crestFactor = rms > 0 ? Math.max(Math.abs(min), Math.abs(max)) / rms : 0;
  const med = median(x);
  const warnings: string[] = [];

  if (Math.abs(mean) > Math.max(sd * 0.5, 1e-12)) warnings.push("Large DC offset relative to signal variation.");
  if (clippedSamples > Math.max(2, n * 0.001)) warnings.push("Potential amplitude clipping detected; inspect acquisition range.");
  if (sd === 0) warnings.push("Signal has zero variance.");

  return {
    sampleCount: n,
    durationSeconds: n / input.samplingRateHz,
    samplingRateHz: input.samplingRateHz,
    mean,
    median: med,
    min,
    max,
    peakToPeak: max - min,
    standardDeviation: sd,
    variance,
    rms,
    meanAbsoluteValue: mav,
    waveformLength: wl,
    zeroCrossings,
    areaAbsolute,
    crestFactor,
    quality: {
      finite: true,
      clippedSamples,
      dcOffset: mean,
      usable: warnings.length === 0 && sd > 0,
      warnings
    }
  };
}

export const NEURO_ENGINE_VERSION = "0.1.0";
export const NEURO_ENGINE_LIMITS = { maxSamples: MAX_SAMPLES, supportedModalities: ["EEG", "EMG", "ECG"] as const };
