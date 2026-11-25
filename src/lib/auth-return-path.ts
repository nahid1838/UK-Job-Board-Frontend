export function applicationReturnPath(value: unknown) {
  return typeof value === "string" && /^\/jobs\/[a-f0-9]{24}\/apply$/i.test(value) ? value : undefined;
}
