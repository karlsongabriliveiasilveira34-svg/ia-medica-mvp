export function vectorToPg(vector) {
  return `[${vector.join(",")}]`;
}