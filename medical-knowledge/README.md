# Nexa Medical Knowledge Resource

## Source

- **Title:** *Electromyography and Neuromuscular Disorders: Clinical-Electrophysiologic-Ultrasound Correlations*
- **Edition:** Fourth Edition
- **Authors:** David C. Preston, MD; Barbara E. Shapiro, MD, PhD
- **Publisher:** Elsevier
- **Copyright:** 2021
- **ISBN:** 978-0-323-66180-5

This repository contains **original structured knowledge derived from the supplied reference**, not a copy of the book. The source itself states that it is copyrighted and that reproduction or transmission requires permission. The supplied PDF should therefore remain a private source document and should not be committed to this public repository.

## Intended use

This resource is a retrieval-oriented foundation for Nexa AI's electrophysiology/neuromuscular reasoning layer. It is intended for education and clinical decision support, not autonomous diagnosis or treatment.

## Core reasoning domains

1. **Clinical context first** — EDX interpretation should be integrated with symptoms, time course, examination and the clinical differential.
2. **Localization** — organize the differential around motor neuron, sensory neuron, root, plexus, peripheral nerve, neuromuscular junction, muscle and central nervous system localizations.
3. **Nerve fiber involvement** — distinguish predominantly motor, sensory or sensorimotor patterns.
4. **Pathophysiology** — characterize patterns as primarily axonal, demyelinating or mixed, using the complete NCS/EMG pattern rather than one measurement.
5. **Temporal course** — consider hyperacute, acute, subacute and chronic patterns and whether electrodiagnostic findings fit the reported symptom duration.
6. **Needle EMG** — evaluate spontaneous activity, MUAP morphology and recruitment together.
7. **Neuromuscular junction** — consider RNS/exercise testing when the clinical or electrophysiologic pattern suggests a transmission disorder.
8. **Ultrasound correlation** — use neuromuscular ultrasound as a complementary structural/dynamic study rather than as a replacement for EDX physiology.
9. **Technical quality** — account for temperature, stimulation, recording quality, artifacts, anatomy and laboratory-specific reference ranges.
10. **Human oversight** — automated output must be framed as decision support and reviewed by an appropriately qualified clinician.

## RAG design

The production knowledge layer should store:

- source identifier and edition
- chapter/section
- topic and subtopic
- concise original summary
- clinical reasoning tags
- applicable test type (NCS, needle EMG, RNS, ultrasound)
- contraindication/limitation notes where applicable
- source page locator
- confidence/provenance metadata

Do **not** store the complete copyrighted book text in the public Git repository.

## Safety boundary

Nexa Medical should not present a retrieved reference statement as a patient-specific diagnosis. Patient-specific interpretation requires the clinical history, examination, complete study quality assessment and qualified clinician review.
