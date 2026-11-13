import { getStenObjekt, updateStenObjekt } from '../api.js'

/** Sets status "Arkiverad" on all stenObjekt linked to the given ärende. */
export default async function archiveLinkedStones(arendeID) {
  if (arendeID == null) return []

  const stenar = await getStenObjekt()
  const linked = stenar.filter(
    (s) =>
      Number(s.attr?.arendeID) === Number(arendeID) &&
      s.attr?.status !== 'Arkiverad'
  )

  await Promise.all(
    linked.map((s) =>
      updateStenObjekt(s.id, {
        attr: { ...s.attr, status: 'Arkiverad' },
      })
    )
  )

  return linked.map((s) => s.id)
}
