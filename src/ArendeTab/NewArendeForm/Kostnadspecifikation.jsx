import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './Kostnadspecifikation.css'
import { FARG_TILLAGG_OPTIONS, sumKostnadLines } from '../../Helpers/buildKostnadLines.js'

function AmountInput({ value, onChange, missing }) {
  if (missing && (value == null || value === '')) {
    return (
      <input
        type="number"
        className="kostnadspecifikation-amount-input kostnadspecifikation-amount-missing"
        placeholder="Pris saknas."
        value=""
        onChange={(e) => {
          const raw = e.target.value
          if (raw === '') {
            onChange(null)
            return
          }
          const n = Number(raw)
          if (Number.isFinite(n)) onChange(n)
        }}
      />
    )
  }

  return (
    <input
      type="number"
      className="kostnadspecifikation-amount-input"
      value={value ?? ''}
      onChange={(e) => {
        const raw = e.target.value
        if (raw === '') {
          onChange(null)
          return
        }
        const n = Number(raw)
        if (Number.isFinite(n)) onChange(n)
      }}
    />
  )
}

function LineAmount({ line, onAmountChange, editable }) {
  if (!editable) {
    if (typeof line.amount === 'number') {
      return (
        <span className="kostnadspecifikation-amount">
          {line.amount.toLocaleString('sv-SE')} kr
        </span>
      )
    }
    return (
      <span className="kostnadspecifikation-amount kostnadspecifikation-amount-missing">
        Pris saknas.
      </span>
    )
  }

  return (
    <AmountInput
      value={line.amount}
      missing={line.amount == null}
      onChange={(amount) => onAmountChange(line.id, amount)}
    />
  )
}

export default function Kostnadspecifikation({
  lines = [],
  emptyMessage = 'Välj ärendetyp för att se kostnader.',
  onAmountChange,
  fargTillagg = null,
  onAddFargTillagg,
  onRemoveFargTillagg,
  onFargTillaggAmountChange,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)
  const addButtonRef = useRef(null)
  const menuRef = useRef(null)
  const displayLines = fargTillagg ? [...lines, fargTillagg] : lines
  const total = sumKostnadLines(displayLines)
  const hasLines = displayLines.length > 0
  const availableTillagg = FARG_TILLAGG_OPTIONS.filter(
    (opt) => opt.id !== fargTillagg?.optionId
  )

  useLayoutEffect(() => {
    if (!menuOpen || !addButtonRef.current) {
      setMenuPos(null)
      return
    }

    function updateMenuPos() {
      const rect = addButtonRef.current.getBoundingClientRect()
      const menuHeight = menuRef.current?.offsetHeight ?? 220
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < menuHeight + 12 && rect.top > spaceBelow
      setMenuPos({
        left: rect.left,
        top: openUpward ? undefined : rect.bottom + 6,
        bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
        minWidth: Math.max(192, rect.width),
      })
    }

    updateMenuPos()
    const rafId = requestAnimationFrame(updateMenuPos)
    window.addEventListener('resize', updateMenuPos)
    window.addEventListener('scroll', updateMenuPos, true)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateMenuPos)
      window.removeEventListener('scroll', updateMenuPos, true)
    }
  }, [menuOpen, availableTillagg.length])

  useEffect(() => {
    if (!menuOpen) return

    function handlePointerDown(e) {
      if (
        addButtonRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return
      }
      setMenuOpen(false)
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <aside className="kostnadspecifikation" aria-label="Kostnadspecifikation">
      <h4>Kostnadspecifikation</h4>

      <div className="kostnadspecifikation-body">
        {!hasLines && (
          <p className="kostnadspecifikation-empty">{emptyMessage}</p>
        )}

        {hasLines && (
          <ul className="kostnadspecifikation-list">
            {lines.map((line) => (
              <li key={line.id} className="kostnadspecifikation-item">
                <div className="kostnadspecifikation-row">
                  <span className="kostnadspecifikation-label">{line.label}</span>
                  <LineAmount
                    line={line}
                    onAmountChange={onAmountChange}
                    editable={!line.children?.length}
                  />
                </div>
                {line.children?.length > 0 && (
                  <ul className="kostnadspecifikation-children">
                    {line.children.map((child) => (
                      <li
                        key={child.id}
                        className="kostnadspecifikation-row kostnadspecifikation-child"
                      >
                        <span className="kostnadspecifikation-label">{child.label}</span>
                        <LineAmount
                          line={child}
                          onAmountChange={onAmountChange}
                          editable
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            {fargTillagg && (
              <li className="kostnadspecifikation-item">
                <div className="kostnadspecifikation-row">
                  <span className="kostnadspecifikation-label">
                    {fargTillagg.label}
                    <button
                      type="button"
                      className="kostnadspecifikation-remove"
                      onClick={onRemoveFargTillagg}
                      aria-label={`Ta bort ${fargTillagg.label}`}
                    >
                      ×
                    </button>
                  </span>
                  <AmountInput
                    value={fargTillagg.amount}
                    onChange={onFargTillaggAmountChange}
                  />
                </div>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="kostnadspecifikation-add">
        <button
          ref={addButtonRef}
          type="button"
          className="kostnadspecifikation-add-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          +
        </button>
        {menuOpen &&
          createPortal(
            <ul
              ref={menuRef}
              className="kostnadspecifikation-add-menu"
              role="menu"
              style={
                menuPos
                  ? {
                      left: menuPos.left,
                      top: menuPos.top,
                      bottom: menuPos.bottom,
                      minWidth: menuPos.minWidth,
                    }
                  : { left: 0, top: 0, visibility: 'hidden' }
              }
            >
              {availableTillagg.map((opt) => (
                <li key={opt.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onAddFargTillagg(opt)
                      setMenuOpen(false)
                    }}
                  >
                    {opt.label}
                    <span className="kostnadspecifikation-add-menu-price">
                      {opt.amount.toLocaleString('sv-SE')} kr
                    </span>
                  </button>
                </li>
              ))}
            </ul>,
            document.body
          )}
      </div>

      {hasLines && (
        <div className="kostnadspecifikation-total">
          <span>Totalt</span>
          <span>
            {typeof total === 'number' ? `${total.toLocaleString('sv-SE')} kr` : '—'}
          </span>
        </div>
      )}
    </aside>
  )
}
