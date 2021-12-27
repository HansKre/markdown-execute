export enum Runtime {
  shell = 'Shell',
  nodeJs = 'NodeJs',
}

export interface Command {
  runtime: Runtime;
  command: string;
}
