import { useForm } from 'react-hook-form'
import { addStenObjekt } from '../api.js'
import { cmToMm } from '../Helpers/stoneUnits.js'
import { STEN_STATUS_OPTIONS } from './StenarSearchMenu.jsx'
import MaterialSelect from './MaterialSelect.jsx'
import './RegistreraStenForm.css'

const PRIS_KATEGORIER = ['A', 'B', 'C', 'D']
const SKULPTUR_OPTIONS = ['', 'Liten', 'Stor']

export default function RegistreraStenForm({ setShowForm, setStenar, defaultArendeID }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      material: '',
      modell: '',
      hojd: '',
      bredd: '',
      djup: '',
      skulptur: '',
      laserportratt: false,
      lykthal: false,
      specialBlasting: false,
      prisKategori: 'A',
      framsida: '',
      baksida: '',
      kanter: '',
      arendeID: defaultArendeID ?? '',
      status: 'I lager',
    },
  })

  const onSubmit = async (data) => {
    const attr = {
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
      arendeID: data.arendeID === '' ? null : Number(data.arendeID),
      status: data.status,
    }

    try {
      const created = await addStenObjekt({ attr })
      setStenar((prev) => [...prev, created])
      reset()
      setShowForm(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form className="registrera-sten-form" onSubmit={handleSubmit(onSubmit)}>
      <h3>Registrera ny sten</h3>

      <label className="registrera-sten-field">
        Material
        <MaterialSelect register={register} />
      </label>
      <label className="registrera-sten-field">
        Modell
        <input {...register('modell', { required: true })} />
      </label>
      <label className="registrera-sten-field">
        Höjd (cm)
        <input type="number" step="any" {...register('hojd', { required: true })} />
      </label>
      <label className="registrera-sten-field">
        Bredd (cm)
        <input type="number" step="any" {...register('bredd', { required: true })} />
      </label>
      <label className="registrera-sten-field">
        Djup (cm)
        <input type="number" step="any" {...register('djup', { required: true })} />
      </label>
      <label className="registrera-sten-field">
        Framsida
        <input {...register('framsida')} />
      </label>
      <label className="registrera-sten-field">
        Baksida
        <input {...register('baksida')} />
      </label>
      <label className="registrera-sten-field">
        Kanter
        <input {...register('kanter')} />
      </label>
      <label className="registrera-sten-field">
        Skulptur
        <select {...register('skulptur')}>
          {SKULPTUR_OPTIONS.map((option) => (
            <option key={option || 'none'} value={option}>
              {option || 'Ingen'}
            </option>
          ))}
        </select>
      </label>
      <label className="registrera-sten-field">
        Priskategori
        <select {...register('prisKategori', { required: true })}>
          {PRIS_KATEGORIER.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="registrera-sten-field">
        Status
        <select {...register('status', { required: true })}>
          {STEN_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="registrera-sten-field">
        Ärende-ID
        <input type="number" {...register('arendeID')} />
      </label>

      <div className="registrera-sten-checkboxes">
        <label>
          <input type="checkbox" {...register('laserportratt')} />
          Laserporträtt
        </label>
        <label>
          <input type="checkbox" {...register('lykthal')} />
          Lykthål
        </label>
        <label>
          <input type="checkbox" {...register('specialBlasting')} />
          Special blasting
        </label>
      </div>

      <div className="registrera-sten-buttons">
        <button type="submit">Spara</button>
        <button type="button" onClick={() => setShowForm(false)}>
          Avbryt
        </button>
      </div>
    </form>
  )
}
