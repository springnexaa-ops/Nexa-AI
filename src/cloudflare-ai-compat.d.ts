declare global {
  interface Ai {
    run(model: string, input: any, options?: any): any;
  }
}

export {};
