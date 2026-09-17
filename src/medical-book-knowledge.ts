export const MEDICAL_BOOK_KNOWLEDGE_VERSION = "preston-shapiro-4e-nexa-protocol-2.0.0";

// NEXA Medical Knowledge Protocol
// Source: user-supplied Preston/Shapiro, Electromyography and Neuromuscular Disorders,
// Fourth Edition. This file preserves the source's chapter-level scope and organizes it
// into NEXA retrieval stages. It does not reproduce the copyrighted book text.

export type KnowledgeChapter = {
  chapter: number;
  title: string;
  domains: string[];
  protocolStages: string[];
  keywords: string[];
};

export const PRESTON_SHAPIRO_CHAPTERS: KnowledgeChapter[] = [
  { chapter:1, title:"Approach to Nerve Conduction Studies, Electromyography, and Neuromuscular Ultrasound", domains:["EDX","NCS","EMG","NMUS"], protocolStages:["clinical-question","localization","study-selection"], keywords:["approach","edx","ncs","emg","ultrasound"] },
  { chapter:2, title:"Anatomy and Neurophysiology for Electrodiagnostic Studies", domains:["anatomy","neurophysiology"], protocolStages:["anatomy","physiology","localization"], keywords:["anatomy","physiology","nerve","muscle","motor unit","peripheral nervous system"] },
  { chapter:3, title:"Basic Nerve Conduction Studies", domains:["NCS"], protocolStages:["ncs","measurement","quality-control"], keywords:["ncs","nerve conduction","motor","sensory","mixed","cmAP","snap","conduction velocity"] },
  { chapter:4, title:"Late Responses", domains:["NCS","late responses"], protocolStages:["late-responses","localization"], keywords:["f wave","f-wave","late response"] },
  { chapter:5, title:"Blink Reflex", domains:["blink reflex","cranial neurophysiology"], protocolStages:["reflex-testing","localization"], keywords:["blink reflex","r1","r2","facial","trigeminal"] },
  { chapter:6, title:"Repetitive Nerve Stimulation", domains:["NMJ","RNS"], protocolStages:["nmj","rns","interpretation"], keywords:["rns","repetitive nerve stimulation","decrement","increment","neuromuscular junction"] },
  { chapter:7, title:"Anomalous Innervations", domains:["anatomy","NCS","EMG"], protocolStages:["technical-confounders","localization"], keywords:["anomalous innervation","Martin-Gruber","Riche-Cannieu","cross-over"] },
  { chapter:8, title:"Artifacts and Technical Factors", domains:["quality control","artifacts"], protocolStages:["quality-control","pre-interpretation"], keywords:["artifact","temperature","electrode","stimulation","ground","distance","technical"] },
  { chapter:9, title:"Basic Statistics for Electrodiagnostic Studies", domains:["statistics","reference values"], protocolStages:["reference-range","interpretation"], keywords:["statistics","normal value","reference range","sensitivity","specificity"] },
  { chapter:10, title:"Routine Upper Extremity, Facial, and Phrenic Nerve Conduction Techniques", domains:["NCS","upper limb","facial","phrenic"], protocolStages:["ncs","upper-limb","cranial","respiratory"], keywords:["upper extremity","facial nerve","phrenic","median","ulnar","radial"] },
  { chapter:11, title:"Routine Lower Extremity Nerve Conduction Techniques", domains:["NCS","lower limb"], protocolStages:["ncs","lower-limb"], keywords:["lower extremity","peroneal","tibial","sural","femoral"] },
  { chapter:12, title:"Basic Overview of Electromyography", domains:["needle EMG"], protocolStages:["emg","study-selection"], keywords:["emg","needle emg","electromyography","insertional","activation"] },
  { chapter:13, title:"Anatomy for Needle Electromyography", domains:["needle EMG","anatomy"], protocolStages:["emg","anatomy","muscle-selection"], keywords:["needle anatomy","muscle anatomy","innervation","myotome"] },
  { chapter:14, title:"Basic Electromyography: Analysis of Spontaneous Activity", domains:["needle EMG"], protocolStages:["emg","spontaneous-activity"], keywords:["fibrillation","positive sharp wave","fasciculation","myotonic","spontaneous activity"] },
  { chapter:15, title:"Basic Electromyography: Analysis of Motor Unit Action Potentials", domains:["needle EMG","MUAP"], protocolStages:["emg","muap","recruitment"], keywords:["muap","motor unit","duration","amplitude","polyphasia","recruitment","interference pattern"] },
  { chapter:16, title:"Clinical–Electrophysiologic Correlations: Overview and Common Patterns", domains:["EDX interpretation"], protocolStages:["pattern-recognition","clinical-correlation"], keywords:["pattern","clinical correlation","localization","axonal","demyelinating","neurogenic","myopathic"] },
  { chapter:17, title:"Fundamentals of Neuromuscular Ultrasound", domains:["NMUS"], protocolStages:["ultrasound","anatomy","correlation"], keywords:["neuromuscular ultrasound","ultrasound","nerve ultrasound","muscle ultrasound"] },
  { chapter:18, title:"Neuromuscular Ultrasound of Mononeuropathies", domains:["NMUS","mononeuropathy"], protocolStages:["ultrasound","mononeuropathy","localization"], keywords:["mononeuropathy","nerve CSA","cross-sectional area","entrapment"] },
  { chapter:19, title:"Neuromuscular Ultrasound of Polyneuropathy, Motor Neuron Disease, and Myopathy", domains:["NMUS","polyneuropathy","motor neuron","myopathy"], protocolStages:["ultrasound","pattern-recognition"], keywords:["polyneuropathy","motor neuron disease","myopathy","ultrasound"] },
  { chapter:20, title:"Median Neuropathy at the Wrist", domains:["median neuropathy","CTS"], protocolStages:["mononeuropathy","upper-limb","localization"], keywords:["median neuropathy","carpal tunnel","cts","median sensory","median motor"] },
  { chapter:21, title:"Proximal Median Neuropathy", domains:["median neuropathy"], protocolStages:["mononeuropathy","upper-limb","localization"], keywords:["proximal median neuropathy","median nerve"] },
  { chapter:22, title:"Ulnar Neuropathy at the Elbow", domains:["ulnar neuropathy"], protocolStages:["mononeuropathy","upper-limb","localization"], keywords:["ulnar neuropathy","elbow","cubital tunnel","conduction block"] },
  { chapter:23, title:"Ulnar Neuropathy at the Wrist", domains:["ulnar neuropathy"], protocolStages:["mononeuropathy","upper-limb","localization"], keywords:["ulnar neuropathy","wrist","Guyon"] },
  { chapter:24, title:"Radial Neuropathy", domains:["radial neuropathy"], protocolStages:["mononeuropathy","upper-limb","localization"], keywords:["radial neuropathy","radial nerve","spiral groove","posterior interosseous"] },
  { chapter:25, title:"Peroneal Neuropathy", domains:["peroneal neuropathy"], protocolStages:["mononeuropathy","lower-limb","localization"], keywords:["peroneal neuropathy","fibular","fibular head","foot drop"] },
  { chapter:26, title:"Femoral Neuropathy", domains:["femoral neuropathy"], protocolStages:["mononeuropathy","lower-limb","localization"], keywords:["femoral neuropathy","femoral nerve"] },
  { chapter:27, title:"Tarsal Tunnel Syndrome", domains:["tibial neuropathy"], protocolStages:["mononeuropathy","lower-limb","localization"], keywords:["tarsal tunnel","tibial neuropathy"] },
  { chapter:28, title:"Facial and Trigeminal Neuropathy", domains:["cranial neuropathy"], protocolStages:["cranial","localization"], keywords:["facial neuropathy","trigeminal","facial nerve"] },
  { chapter:29, title:"Polyneuropathy", domains:["polyneuropathy"], protocolStages:["polyneuropathy","pattern-recognition","severity"], keywords:["polyneuropathy","sensorimotor","length dependent","axonal","demyelinating"] },
  { chapter:30, title:"Amyotrophic Lateral Sclerosis and Its Variants", domains:["motor neuron disease"], protocolStages:["motor-neuron","emg","pattern-recognition"], keywords:["als","amyotrophic lateral sclerosis","motor neuron"] },
  { chapter:31, title:"Atypical and Inherited Motor Neuron Disorders", domains:["motor neuron disease"], protocolStages:["motor-neuron","differential"], keywords:["motor neuron","inherited","atypical"] },
  { chapter:32, title:"Radiculopathy", domains:["radiculopathy"], protocolStages:["radiculopathy","localization","emg"], keywords:["radiculopathy","root","paraspinal","myotome","dorsal root ganglion"] },
  { chapter:33, title:"Brachial Plexopathy", domains:["plexopathy"], protocolStages:["plexus","localization","emg"], keywords:["brachial plexus","plexopathy","upper trunk","lower trunk"] },
  { chapter:34, title:"Proximal Neuropathies of the Shoulder and Arm", domains:["proximal neuropathy"], protocolStages:["upper-limb","localization"], keywords:["proximal neuropathy","shoulder","arm"] },
  { chapter:35, title:"Lumbosacral Plexopathy", domains:["plexopathy"], protocolStages:["plexus","lower-limb","localization"], keywords:["lumbosacral plexopathy","plexus"] },
  { chapter:36, title:"Sciatic Neuropathy", domains:["sciatic neuropathy"], protocolStages:["mononeuropathy","lower-limb","localization"], keywords:["sciatic neuropathy","sciatic nerve"] },
  { chapter:37, title:"Neuromuscular Junction Disorders", domains:["NMJ"], protocolStages:["nmj","rns","emg"], keywords:["myasthenia","lambert-eaton","neuromuscular junction","single fiber"] },
  { chapter:38, title:"Myopathy", domains:["myopathy"], protocolStages:["myopathy","emg","pattern-recognition"], keywords:["myopathy","myopathic","muscle disease"] },
  { chapter:39, title:"Myotonic Muscle Disorders and Periodic Paralysis Syndromes", domains:["myotonia","periodic paralysis"], protocolStages:["emg","muscle","pattern-recognition"], keywords:["myotonic","myotonia","periodic paralysis"] },
  { chapter:40, title:"Approach to Electrodiagnostic Studies in the Intensive Care Unit", domains:["ICU EDX"], protocolStages:["icu","study-selection","quality-control"], keywords:["icu","critical illness","ventilator","weakness"] },
  { chapter:41, title:"Approach to Pediatric Electromyography", domains:["pediatric EDX"], protocolStages:["pediatric","reference-range","study-selection"], keywords:["pediatric","child","infant","children"] },
  { chapter:42, title:"Basics of Electricity and Electronics for Electrodiagnostic Studies", domains:["instrumentation"], protocolStages:["instrumentation","quality-control"], keywords:["electricity","electronics","amplifier","filter","instrumentation"] },
  { chapter:43, title:"Electrical Safety and Iatrogenic Complications of Electrodiagnostic Studies", domains:["safety"], protocolStages:["safety","pre-interpretation"], keywords:["electrical safety","complication","pacemaker","dbs","vns","anticoagulant"] }
];

export const NEXA_PROTOCOL = [
  "01 clinical question and symptom phenotype",
  "02 neurologic localization hypothesis",
  "03 choose the minimum clinically useful EDX/NCS/EMG/NMUS protocol",
  "04 verify patient preparation, temperature, equipment, electrodes, stimulation and reference ranges",
  "05 interpret motor NCS: distal latency, CMAP amplitude/area/duration, segmental conduction and waveform morphology",
  "06 interpret sensory NCS: SNAP latency, amplitude, duration and velocity",
  "07 interpret late responses and reflex studies when clinically indicated",
  "08 interpret repetitive stimulation / NMJ testing when indicated",
  "09 perform and interpret needle EMG: insertional activity, spontaneous activity, MUAP morphology, recruitment and distribution",
  "10 integrate anatomic distribution across nerves, roots, plexus, motor neuron, NMJ and muscle",
  "11 classify the physiologic pattern without overcalling isolated abnormalities: focal, multifocal or generalized; axonal, demyelinating, neurogenic or myopathic",
  "12 correlate with clinical history and examination and explicitly account for technical confounders",
  "13 use neuromuscular ultrasound as a complementary structural/localization layer when appropriate",
  "14 generate a structured report: observations -> interpretation -> localization/pattern -> severity/temporal features when supported -> limitations",
  "15 never invent absent measurements, laboratory reference ranges, waveform features, patient history or diagnosis; require qualified clinician review for patient-specific decisions"
] as const;

export const OPEN_MEDICAL_SOURCES = [
  { id:"AANEM", name:"American Association of Neuromuscular & Electrodiagnostic Medicine", scope:"EDX/NCS/EMG education, study resources, ethical guidance and reference lists", url:"https://www.aanem.org/" },
  { id:"IFCN", name:"International Federation of Clinical Neurophysiology", scope:"clinical neurophysiology guidelines, education and practice resources", url:"https://www.ifcn.info/" },
  { id:"ILAE", name:"International League Against Epilepsy", scope:"EEG, epilepsy and neurophysiology guidelines", url:"https://www.ilae.org/" },
  { id:"NCBI", name:"NCBI Bookshelf / StatPearls", scope:"open medical reference chapters and clinical neurophysiology reviews", url:"https://www.ncbi.nlm.nih.gov/books/" },
  { id:"PhysioNet", name:"PhysioNet", scope:"open neurophysiology datasets, waveform examples and reproducible signal-processing resources", url:"https://physionet.org/" }
] as const;

const BASE = `NEXA Medical uses the user-supplied Preston/Shapiro Fourth Edition as a primary structured reference for electrodiagnostic medicine. The source scope is preserved at chapter level and reorganized into the NEXA protocol; the copyrighted book text itself is not reproduced. Patient-specific interpretation must use only measurements and observations actually supplied, with technical adequacy, laboratory reference ranges and clinical correlation explicitly considered.`;

function normalize(q: string): string {
  return String(q || "").toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

export function getMedicalBookContext(query: string): string {
  const q = normalize(query);
  const hits = PRESTON_SHAPIRO_CHAPTERS.filter(ch => ch.keywords.some(k => q.includes(k.toLowerCase())));
  const selected = hits.length ? hits.slice(0, 8) : PRESTON_SHAPIRO_CHAPTERS.slice(0, 3);
  const protocol = NEXA_PROTOCOL.join("\n");
  const chapters = selected.map(ch => `Chapter ${ch.chapter}: ${ch.title} | domains=${ch.domains.join(", ")} | stages=${ch.protocolStages.join(", ")}`).join("\n");
  return `${BASE}\n\nNEXA interpretation protocol:\n${protocol}\n\nRelevant source chapters:\n${chapters}\n\nAnswering rule: explain the supplied findings directly when sufficient data are present; distinguish observed values from interpretation; state what additional data are required when they are missing; do not issue a blanket refusal merely because the user asks about an NCS, EMG, EDX, RNS, NMUS or related report.`;
}

export function getMedicalKnowledgeManifest() {
  return {
    version: MEDICAL_BOOK_KNOWLEDGE_VERSION,
    primarySource: "Preston/Shapiro, Electromyography and Neuromuscular Disorders, Fourth Edition",
    chapterCount: PRESTON_SHAPIRO_CHAPTERS.length,
    protocolSteps: NEXA_PROTOCOL.length,
    externalSources: OPEN_MEDICAL_SOURCES.map(s => s.id)
  };
}
