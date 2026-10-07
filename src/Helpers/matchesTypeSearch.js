import getTypes from './getTypes.js';

// Search labels that should match more than one stored spelling.
const TYPE_SEARCH_ALIASES = {
  Inspektion: ["Inspektion", "Inspektering"],
};

export default function matchesTypeSearch(arendeTyp, typeToSearch) {
  if (!typeToSearch) return true;
  const types = getTypes(arendeTyp);
  const aliases = TYPE_SEARCH_ALIASES[typeToSearch] ?? [typeToSearch];
  return types.some(type => aliases.includes(type));
}
