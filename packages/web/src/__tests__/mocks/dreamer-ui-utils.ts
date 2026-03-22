export function join(...args: Array<string | boolean | undefined | null>): string {
  return args.filter(Boolean).join(' ');
}
