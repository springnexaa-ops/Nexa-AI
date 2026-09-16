# Nexa NeuroSignal provenance

Nexa uses the following public projects as **architectural and algorithmic references**, not as a wholesale code import:

- EEGsynth — real-time EEG/EMG modular architecture. The upstream project is GPL and explicitly states that it is not intended for diagnostic or clinical applications.
- EMG Signal Processing Library (cancui) — real-time EMG filtering/rectification/moving-average concepts. Review the upstream license before reusing any source code.
- EEG-EMG-analytics (CisottoGiulia) — time/frequency feature vocabulary and extraction workflow. Review the upstream GPL-3.0 license before reuse.
- EEG-ECG-EMG-Analysis — classical signal analysis and ML workflow reference.
- EMG_ANN — EMG dataset, feature extraction and classification workflow reference; upstream README identifies MIT licensing.
- EEG-Signal-Processing-with-Python — EEG processing reference; license must be retained if code is reused.
- urban-environment-eeg-analysis — EEG preprocessing/statistical workflow reference.
- EEG-Datasets — public dataset catalog reference.
- BrainFlow — candidate acquisition/processing SDK; upstream project identifies MIT licensing.

## Nexa implementation boundary

1. Prefer original implementations of generic signal-processing mathematics.
2. Do not copy complete upstream repositories into the production Worker.
3. Record upstream repository, commit/version and license before incorporating source code.
4. Keep patient data, medical books and provider secrets outside the public Git repository.
5. Do not use this signal engine as an autonomous diagnostic classifier.
6. Medical outputs must preserve uncertainty, provenance and clinician-review requirements.

## Current implementation

`src/neuro-signal.ts` is original Nexa code providing deterministic signal validation and basic time-domain features for EEG, EMG and ECG. It is intentionally independent of third-party runtime dependencies so the Cloudflare Worker remains small and deployable.
