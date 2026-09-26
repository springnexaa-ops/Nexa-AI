import { analyzeFile } from "./file-reader";

export async function analyzeUploadedEeg(request: Request, env: any): Promise<Response> {
  return analyzeFile(request, env);
}
