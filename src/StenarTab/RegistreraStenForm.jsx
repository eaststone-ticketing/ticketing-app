import { useForm } from 'react-hook-form'
import { addStenObjekt, getArenden, updateArende } from '../api.js'
import { cmToMm } from '../Helpers/stoneUnits.js'
import calculateStonePrice from '../Helpers/calculateStonePrice.js'
import { usePriceConfig } from '../Helpers/PriceConfigContext.jsx'
import {
  applyArtiklarToArende,
  artiklarAfterStoneLinked,
} from '../Helpers/artiklarHelpers.js'
import { STEN_STATUS_OPTIONS } from './StenarSearchMenu.jsx'
import MaterialSelect from './MaterialSelect.jsx'
import './RegistreraStenForm.css'

const PRIS_KATEGORIER = ['A', 'B', 'C', 'D']
const SKULPTUR_OPTIONS = ['', 'Liten', 'Stor']

export default function RegistreraStenForm({ setShowForm, setStenar, setArenden, defaultArendeID }) {
  const { priceConfig } = usePriceConfig()
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

      if (attr.arendeID) {
        const isSockel = String(attr.modell || '').trim().toLowerCase() === 'sockel'
        const stonePrice = calculateStonePrice(attr, priceConfig)
        try {
          const arenden = await getArenden()
          const arende = arenden.find((a) => Number(a.id) === Number(attr.arendeID))
          if (arende) {
            const nextArtiklar = artiklarAfterStoneLinked(arende.artiklar, {
              isSockel,
              stonePrice,
              sockelPrice: priceConfig.SOCKEL_STANDARD,
            })
            const updated = applyArtiklarToArende(arende, nextArtiklar)
            if (
              JSON.stringify(updated.artiklar) !==
              JSON.stringify(arende.artiklar || {})
            ) {
              await updateArende(arende.id, updated)
              setArenden?.((prev) =>
                (prev || []).map((a) => (a.id === updated.id ? updated : a))
              )
            }
          }
        } catch (artiklarErr) {
          console.error('Kunde inte uppdatera artiklar på ärendet:', artiklarErr)
        }
      }

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
