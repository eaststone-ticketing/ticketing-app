import { mmToCm } from '../Helpers/stoneUnits.js'
import './StenImportDuplicateDialog.css'

function DetailList({ attr, title }) {
  return (
    <div className="sten-import-duplicate-card">
      <h4>{title}</h4>
      <dl>
        <div>
          <dt>Material</dt>
          <dd>{attr.material || '—'}</dd>
        </div>
        <div>
          <dt>Modell</dt>
          <dd>{attr.modell || '—'}</dd>
        </div>
        <div>
          <dt>Mått</dt>
          <dd>
            {mmToCm(attr.bredd ?? 0)}x{mmToCm(attr.hojd ?? 0)}x{mmToCm(attr.djup ?? 0)}cm
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{attr.status || '—'}</dd>
        </div>
        <div>
          <dt>Ärende-ID</dt>
          <dd>{attr.arendeID ?? '—'}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function StenImportDuplicateDialog({
  existing,
  incomingAttr,
  onResolve,
}) {
  if (!existing || !incomingAttr) return null

  return (
    <div className="sten-import-duplicate-overlay" role="dialog" aria-modal="true">
      <div className="sten-import-duplicate-dialog">
        <h3>Möjlig dubblett hittad</h3>
        <p>
          Det finns redan en sten med samma material, modell och mått.
          Vill du behålla båda, eller välja en att behålla?
        </p>
        <div className="sten-import-duplicate-compare">
          <DetailList attr={existing.attr} title={`Befintlig (ID ${existing.id})`} />
          <DetailList attr={incomingAttr} title="Importerad" />
        </div>
        <div className="sten-import-duplicate-actions">
          <button type="button" onClick={() => onResolve('keep-both')}>
            Behåll båda
          </button>
          <button type="button" onClick={() => onResolve('keep-existing')}>
            Behåll befintlig
          </button>
          <button type="button" onClick={() => onResolve('keep-imported')}>
            Behåll importerad
          </button>
        </div>
      </div>
    </div>
  )
}
