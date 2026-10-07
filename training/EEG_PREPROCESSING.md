# NEXA EEG/EDF Preprocessing Specification

Version: v0.1
Status: design + validation contract

## Objective

Convert approved, de-identified EEG/EDF recordings into deterministic, auditable training examples without leaking patient identity or information across dataset splits.

## Required EDF validation

For every source EDF/EDF+ file, record:
- source SHA-256
- EDF/EDF+ format and parser version
- duration
- number of channels
- channel labels after canonical normalization
- sampling frequency per channel
- physical/digital min/max where available
- annotations/events with source provenance
- parser warnings/errors
- rejected-file reason when validation fails

Reject unreadable, structurally inconsistent, corrupt, identifier-bearing, or contract-incompatible files.

## Channel normalization

Use a deterministic mapping layer. Preserve source_label and canonical_label; never overwrite provenance. Record montage/reference, channel type, sampling rate, units, polarity/reference assumptions, and missing/interpolated status. Do not silently invent missing channels or references.

## Signal preprocessing

The pipeline is configuration-driven and versioned. Typical operations are channel selection/canonicalization, reference handling, justified line-noise filtering, justified band-pass filtering, artifact detection, optional resampling, amplitude/unit normalization, and epoch/window generation. Record every transformation parameter and software version. Retain raw EDF as source of truth whenever permitted.

## Epoch generation

Each epoch carries dataset_id, source_document_id, source_sha256, recording-relative start/end, channel list, sampling rate, preprocessing configuration ID, annotation/event labels, label provenance, and QC status.

Epochs inherit the identity/group of their source recording for splitting purposes.

## Leakage-safe splitting

Split at the highest available identity boundary, preferably patient/subject, then recording/session where subject identity is unavailable. Never randomly split adjacent windows from one recording across train and validation/test.

Invariants: no subject overlap across splits; no recording overlap; preprocessing statistics learned from training data only; locked test labels/evaluation artifacts are immutable.

## Annotation contract

Store event labels separately from waveform samples. Each label needs provenance and annotation status: source annotation, expert annotation, adjudicated annotation, or weak/programmatic label. Clinical claims must not rely on weak labels without explicit validation.

## QC and audit artifacts

Emit accepted/rejected manifest, rejection reasons, channel statistics, duration statistics, annotation statistics, split manifest, preprocessing configuration fingerprint, software/dependency versions, and dataset fingerprint.

The same input manifest, configuration, and software version should produce a reproducible preprocessing result.

## Medical safety boundary

This pipeline creates research/training data. It is not a diagnostic device by itself. Clinical deployment requires independent validation, governance, and applicable regulatory review.
