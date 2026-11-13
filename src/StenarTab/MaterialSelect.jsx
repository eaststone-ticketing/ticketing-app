import { useEffect, useState } from 'react'
import { getStenar } from '../api.js'
import './MaterialSelect.css'

export default function MaterialSelect({
  register,
  setValue,
  name = 'material',
  required = true,
  initialMaterial = '',
  materials: materialsProp,
}) {
  const [materials, setMaterials] = useState(materialsProp ?? [])
  const [customMaterial, setCustomMaterial] = useState(false)
  const materialsReady = materials.length > 0

  useEffect(() => {
    if (materialsProp) {
      setMaterials(materialsProp)
      return
    }
    async function load() {
      try {
        const data = await getStenar()
        setMaterials(data.filter((s) => s?.namn).sort((a, b) => a.namn.localeCompare(b.namn, 'sv')))
      } catch (err) {
        console.error('Failed to load stenpedia materials:', err)
      }
    }
    load()
  }, [materialsProp])

  useEffect(() => {
    if (!initialMaterial || !materialsReady) return
    const inList = materials.some((s) => s.namn === initialMaterial)
    if (!inList) {
      setCustomMaterial(true)
    }
    if (setValue) {
      setValue(name, initialMaterial)
    }
  }, [initialMaterial, materials, materialsReady, setValue, name])

  return (
    <div className="material-select">
      {!customMaterial ? (
        <>
          <p className="material-select-toggle" onClick={() => setCustomMaterial(true)}>
            +Lägg till ny
          </p>
          {/* Remount once options exist so the saved value can match an <option>. */}
          <select
            key={materialsReady ? `material-loaded-${initialMaterial}` : 'material-loading'}
            defaultValue={initialMaterial || ''}
            {...register(name, { required })}
          >
            <option value="">Välj material</option>
            {materials.map((s) => (
              <option key={s.id} value={s.namn}>
                {s.namn}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <p className="material-select-toggle" onClick={() => setCustomMaterial(false)}>
            Använd existerande
          </p>
          <input {...register(name, { required })} placeholder="Nytt material" />
        </>
      )}
    </div>
  )
}
