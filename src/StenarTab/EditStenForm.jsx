import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { updateStenObjekt } from '../api.js'
import { cmToMm, mmToCm } from '../Helpers/stoneUnits.js'
import { STEN_STATUS_OPTIONS } from './StenarSearchMenu.jsx'
import MaterialSelect from './MaterialSelect.jsx'

const PRIS_KATEGORIER = ['A', 'B', 'C', 'D']
const SKULPTUR_OPTIONS = ['', 'Liten', 'Stor']

function buildAttr(data) {
  return {
    material: data.material,
    modell: data.modell,
    hojd: cmToMm(data.hojd),
    bredd: cmToMm(data.bredd),
    djup: cmToMm(data.djup),
    skulptur: data.skulptur || '',
    laserportratt: !!data.laserportratt,
    lykthal: !!data.lykthal,
    specialBlasting: !!data.specialBlasting,
    prisKategori: data.prisKategori,
    framsida: data.framsida,
    baksida: data.baksida,
    kanter: data.kanter,
    arendeID: data.arendeID === '' || data.arendeID == null ? null : Number(data.arendeID),
    status: data.status,
  }
}

export default function EditStenForm({ sten, setStenar, onClose }) {
  const { attr } = sten
  const { register, handleSubmit } = useForm({
    defaultValues: {
      material: attr.material ?? '',
      modell: attr.modell ?? '',
      hojd: mmToCm(attr.hojd ?? 0),
      bredd: mmToCm(attr.bredd ?? 0),
      djup: mmToCm(attr.djup ?? 0),
      skulptur: attr.skulptur ?? '',
      laserportratt: !!attr.laserportratt,
      lykthal: !!attr.lykthal,
      specialBlasting: !!attr.specialBlasting,
      prisKategori: attr.prisKategori ?? 'A',
      framsida: attr.framsida ?? '',
      baksida: attr.baksida ?? '',
      kanter: attr.kanter ?? '',
      arendeID: attr.arendeID ?? '',
      status: attr.status ?? 'Behöver beställas',
    },
  })

  const onSubmit = async (data) => {
    const nextAttr = buildAttr(data)
    try {
      await updateStenObjekt(sten.id, { attr: nextAttr })
      setStenar((prev) =>
        prev.map((s) => (s.id === sten.id ? { ...s, attr: nextAttr } : s))
      )
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return createPortal(
    <div
      className="arende-jobb-form-overlay"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <form
        className="arende-jobb-form"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit(onSubmit)}
      >
        <h3>Redigera sten</h3>

        <label>
          Material
          <MaterialSelect
            register={register}
            initialMaterial={attr.material ?? ''}
          />
        </label>
        <label>
          Modell
          <input {...register('modell', { required: true })} />
        </label>
        <label>
          Höjd (cm)
          <input type="number" step="any" {...register('hojd', { required: true })} />
        </label>
        <label>
          Bredd (cm)
          <input type="number" step="any" {...register('bredd', { required: true })} />
        </label>
        <label>
          Djup (cm)
          <input type="number" step="any" {...register('djup', { required: true })} />
        </label>
        <label>
          Framsida
          <input {...register('framsida')} />
        </label>
        <label>
          Baksida
          <input {...register('baksida')} />
        </label>
        <label>
          Kanter
          <input {...register('kanter')} />
        </label>
        <label>
          Skulptur
          <select {...register('skulptur')}>
            {SKULPTUR_OPTIONS.map((option) => (
              <option key={option || 'none'} value={option}>
                {option || 'Ingen'}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priskategori
          <select {...register('prisKategori', { required: true })}>
            {PRIS_KATEGORIER.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select {...register('status', { required: true })}>
            {STEN_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ärende-ID
          <input type="number" {...register('arendeID')} />
        </label>

        <label>
          <span>Laserporträtt</span>
          <input type="checkbox" {...register('laserportratt')} />
        </label>
        <label>
          <span>Lykthål</span>
          <input type="checkbox" {...register('lykthal')} />
        </label>
        <label>
          <span>Special blasting</span>
          <input type="checkbox" {...register('specialBlasting')} />
        </label>

        <div className="arende-jobb-form-actions">
          <button type="button" onClick={onClose}>
            Avbryt
          </button>
          <button type="submit">Spara</button>
        </div>
      </form>
    </div>,
    document.body
  )
}
