export default function getTypes(arendeTyp) {
  return String(arendeTyp ?? "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
}
