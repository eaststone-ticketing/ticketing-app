import getTypes from './getTypes.js';

export default function hasType(arendeTyp, type) {
  return getTypes(arendeTyp).includes(type);
}
