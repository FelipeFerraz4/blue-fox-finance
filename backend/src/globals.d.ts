declare var process: any;
declare module 'crypto' {
  export function randomUUID(): string;
}
