/**
 * Nexa NeuroSignal Engine v0.1
 * Original deterministic signal QC/feature implementation.
 */

export type NeuroModality = "EEG" | "EMG" | "ECG";
export interface NeuroSignalInput { modality: NeuroModality; samplingRateHz: number; signal: number[]; }
export interface NeuroFeatures {
  sampleCount:number; durationSeconds:number; samplingRateHz:number; mean:number; median:number; min:number; max:number;
  peakToPeak:number; standardDeviation:number; variance:number; rms:number; meanAbsoluteValue:number; waveformLength:number;
  zeroCrossings:number; areaAbsolute:number; crestFactor:number;
  quality:{finite:boolean; clippedSamples:number; dcOffset:number; usable:boolean; warnings:string[]};
}
const MAX_SAMPLES=200_000;
export function validateNeuroSignal(input:NeuroSignalInput):string[]{
  const errors:string[]=[];
  if(!["EEG","EMG","ECG"].includes(input.modality))errors.push("Unsupported modality.");
  if(!Number.isFinite(input.samplingRateHz)||input.samplingRateHz<=0||input.samplingRateHz>100_000)errors.push("samplingRateHz must be between 0 and 100000.");
  if(!Array.isArray(input.signal)||input.signal.length<16)errors.push("signal must contain at least 16 samples.");
  if(Array.isArray(input.signal)&&input.signal.length>MAX_SAMPLES)errors.push(`signal exceeds the ${MAX_SAMPLES} sample safety limit.`);
  if(Array.isArray(input.signal)&&input.signal.some(v=>!Number.isFinite(v)))errors.push("signal contains non-finite samples.");
  return errors;
}
function median(values:number[]){const s=[...values].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}
export function extractNeuroFeatures(input:NeuroSignalInput):NeuroFeatures{
  const errors=validateNeuroSignal(input);if(errors.length)throw new Error(errors.join(" "));
  const x=input.signal,n=x.length;let sum=0,sumSq=0,absSum=0,wl=0,zeroCrossings=0,min=Infinity,max=-Infinity;
  for(const v of x){sum+=v;sumSq+=v*v;absSum+=Math.abs(v);min=Math.min(min,v);max=Math.max(max,v);}
  for(let i=1;i<n;i++){wl+=Math.abs(x[i]-x[i-1]);const a=x[i-1],b=x[i];if((a<0&&b>=0)||(a>0&&b<=0))zeroCrossings++;}
  const mean=sum/n,variance=Math.max(0,sumSq/n-mean*mean),sd=Math.sqrt(variance),rms=Math.sqrt(sumSq/n),dt=1/input.samplingRateHz;
  const clippedThreshold=Math.max((max-min)*0.0005,1e-12);let clippedSamples=0;
  for(const v of x)if(Math.abs(v-max)<=clippedThreshold||Math.abs(v-min)<=clippedThreshold)clippedSamples++;
  const warnings:string[]=[];if(Math.abs(mean)>Math.max(sd*0.5,1e-12))warnings.push("Large DC offset relative to signal variation.");
  if(clippedSamples>Math.max(2,n*0.01))warnings.push("Potential amplitude clipping detected; inspect acquisition range.");
  if(sd===0)warnings.push("Signal has zero variance.");
  return{sampleCount:n,durationSeconds:n/input.samplingRateHz,samplingRateHz:input.samplingRateHz,mean,median:median(x),min,max,peakToPeak:max-min,standardDeviation:sd,variance,rms,meanAbsoluteValue:absSum/n,waveformLength:wl,zeroCrossings,areaAbsolute:absSum*dt,crestFactor:rms>0?Math.max(Math.abs(min),Math.abs(max))/rms:0,quality:{finite:true,clippedSamples,dcOffset:mean,usable:warnings.length===0&&sd>0,warnings}};
}
export const NEURO_ENGINE_VERSION="0.1.1";
export const NEURO_ENGINE_LIMITS={maxSamples:MAX_SAMPLES,supportedModalities:["EEG","EMG","ECG"] as const};
