import MaterialSelect from '../../StenarTab/MaterialSelect.jsx'
import { STEN_STATUS_OPTIONS } from '../../StenarTab/StenarSearchMenu.jsx'
import './StenObjektSection.css'

const SKULPTUR_OPTIONS = ['', 'Liten', 'Stor']
const PRIS_KATEGORIER = ['A', 'B', 'C', 'D']
export const TEXTKOMPLETTERING_STATUS = ['I lager', 'Behöver hämtas']

export default function StenObjektSection({
  title,
  prefix,
  register,
  setValue,
  required = true,
  fixedModell = null,
  showMaterial = false,
  showSkulptur = true,
  showPrisKategori = true,
  showLaserportratt = true,
  showLykthal = true,
  showSpecialBlasting = true,
  statusOptions = STEN_STATUS_OPTIONS,
  defaultStatus = 'Behöver beställas',
}) {
  const field = (name) => `${prefix}.${name}`
  const showCheckboxes = showLaserportratt || showLykthal || showSpecialBlasting

  return (
    <div className="sten-objekt-section">
      <h4>{title}</h4>
      {fixedModell != null ? (
        <p className="sten-objekt-fixed-modell">
          Modell: <strong>{fixedModell}</strong>
        </p>
      ) : (
        <label className="input-field">
          Modell
          <input type="text" {...register(field('modell'), { required })} />
        </label>
      )}
      {showMaterial && (
        <label className="input-field sten-objekt-material-field">
          Material
          <MaterialSelect
            register={register}
            setValue={setValue}
            name={field('material')}
            required={required}
          />
        </label>
      )}
      <label className="input-field">
        Höjd (cm)
        <input type="number" step="any" {...register(field('hojd'), { required })} />
      </label>
      <label className="input-field">
        Bredd (cm)
        <input type="number" step="any" {...register(field('bredd'), { required })} />
      </label>
      <label className="input-field">
        Djup (cm)
        <input type="number" step="any" {...register(field('djup'), { required })} />
      </label>
      {showSkulptur && (
        <label className="input-field">
          Skulptur
          <select {...register(field('skulptur'))}>
            {SKULPTUR_OPTIONS.map((option) => (
              <option key={option || 'none'} value={option}>
                {option || 'Ingen'}
              </option>
            ))}
          </select>
        </label>
      )}
      {showPrisKategori && (
        <label className="input-field">
          Priskategori
          <select {...register(field('prisKategori'), { required })} defaultValue="A">
            {PRIS_KATEGORIER.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="input-field">
        Status
        <select {...register(field('status'), { required })} defaultValue={defaultStatus}>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      {showCheckboxes && (
        <div className="sten-objekt-checkboxes">
          {showLaserportratt && (
            <label className="input-field-checkbox">
              Laserporträtt
              <input type="checkbox" {...register(field('laserportratt'))} />
            </label>
          )}
          {showLykthal && (
            <label className="input-field-checkbox">
              Lykthål
              <input type="checkbox" {...register(field('lykthal'))} />
            </label>
          )}
          {showSpecialBlasting && (
            <label className="input-field-checkbox">
              Special blasting
              <input type="checkbox" {...register(field('specialBlasting'))} />
            </label>
          )}
        </div>
      )}
    </div>
  )
}
