import { typeColor } from '../../Helpers/ticketColors.js'
import {
  DEPENDENT_TYPES,
  getAvailableTypesToAdd,
  canCombineTypes,
} from '../../Helpers/arendeTypeOptions.js'
import './ArendeTypTagPicker.css'

export default function ArendeTypTagPicker({ types = [], onChange }) {
  const canCombine = canCombineTypes(types)
  const availableTypes = getAvailableTypesToAdd(types, {
    includeNonCombinableWhenEmpty: true,
  })

  function addType(typeToAdd) {
    if (!typeToAdd || types.includes(typeToAdd)) return
    const requiredType = DEPENDENT_TYPES[typeToAdd]
    if (requiredType && !types.includes(requiredType)) return
    onChange([...types, typeToAdd])
  }

  function removeType(typeToRemove) {
    if (types.length <= 1) {
      onChange([])
      return
    }
    if (
      Object.values(DEPENDENT_TYPES).includes(typeToRemove) &&
      types.some((type) => DEPENDENT_TYPES[type] === typeToRemove)
    ) {
      window.alert(
        `Ta bort beroende typer (t.ex. Omslipning) innan du tar bort ${typeToRemove}.`
      )
      return
    }
    onChange(types.filter((type) => type !== typeToRemove))
  }

  return (
    <div className="arende-typ-tags new-arende-typ-tags">
      {types.length === 0 && (
        <span className="new-arende-typ-tags-empty">Välj ärendetyp</span>
      )}
      {types.map((type) => (
        <p
          className="arende-typ-tag"
          key={type}
          style={{ backgroundColor: typeColor[type]?.[0] || 'transparent' }}
        >
          {type}
          <button
            type="button"
            className="arende-typ-tag-delete-button"
            onClick={() => removeType(type)}
            aria-label={`Ta bort ${type}`}
          >
            x
          </button>
        </p>
      ))}
      {canCombine && availableTypes.length > 0 && (
        <select
          className="arende-typ-tag-add-button"
          value=""
          onChange={(e) => addType(e.target.value)}
          aria-label="Lägg till ärendetyp"
        >
          <option value="">+</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
