import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { getArenden, updateArende, updateStenObjekt } from '../api.js'
import { cmToMm, mmToCm } from '../Helpers/stoneUnits.js'
import calculateStonePrice from '../Helpers/calculateStonePrice.js'
import { usePriceConfig } from '../Helpers/PriceConfigContext.jsx'
import {
  applyArtiklarToArende,
  artiklarAfterStoneLinked,
} from '../Helpers/artiklarHelpers.js'
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

export default function EditStenForm({ sten, setStenar, setArenden, onClose }) {
  const { priceConfig } = usePriceConfig()
  const { attr } = sten
  const { register, handleSubmit, setValue } = useForm({
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
    if (attr.status === 'Arkiverad') {
      onClose()
      return
    }
    const nextAttr = buildAttr(data)
    // Arkiverad can only be set by closing the linked ärende.
    if (nextAttr.status === 'Arkiverad') {
      nextAttr.status = attr.status
    }
    try {
      await updateStenObjekt(sten.id, { attr: nextAttr })
      setStenar((prev) =>
        prev.map((s) => (s.id === sten.id ? { ...s, attr: nextAttr } : s))
      )

      const previousArendeID = attr.arendeID == null || attr.arendeID === ''
        ? null
        : Number(attr.arendeID)
      const nextArendeID = nextAttr.arendeID
      const newlyLinked =
        nextArendeID != null &&
        Number(nextArendeID) !== 0 &&
        Number(nextArendeID) !== Number(previousArendeID)

      if (newlyLinked) {
        const isSockel =
          String(nextAttr.modell || '').trim().toLowerCase() === 'sockel'
        const stonePrice = calculateStonePrice(nextAttr, priceConfig)
        try {
          const arenden = await getArenden()
          const arende = arenden.find(
            (a) => Number(a.id) === Number(nextArendeID)
          )
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
        <div className="arende-jobb-form-header">
          <h3>Redigera sten</h3>
          <button
            type="button"
            className="arende-jobb-form-close"
            onClick={onClose}
            aria-label="Stäng"
            title="Stäng"
          >
            ×
          </button>
        </div>

        <label>
          Material
          <MaterialSelect
            register={register}
            setValue={setValue}
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
