import {getUsers} from '../api.js'
import {useState, useEffect} from 'react'
import './ArbetsplaneringTab.css'
import { statusColor, typeColor, ticketColorStyle } from '../Helpers/ticketColors.js'

/* Defined at module level so re-renders of the tab don't remount the cards.
   The dragged id travels in the drag event's dataTransfer instead of React
   state — updating state during dragstart re-renders mid-drag and makes the
   browser cancel the drag (the "have to drag twice" bug). */
function ArendeCard({ arende, assignedBy, showCompletedButton, onComplete }) {
    return (
        <div
            className = "arbetsplanering-arende-card"
            draggable
            onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", String(arende.id))
                event.dataTransfer.effectAllowed = "move"
            }}
            style={ticketColorStyle(arende.status, arende.arendeTyp)}
        >
            <div className = "arbetsplanering-card-streak status" />
            <div className = "arbetsplanering-card-streak type" />
            <div className = "arbetsplanering-card-content">
                <p className = "arbetsplanering-arende-title">#{arende.id} {arende.avlidenNamn}</p>
                <p className = "arbetsplanering-arende-status">{arende.status}</p>
                <p className = "arbetsplanering-arende-status">{arende.arendeTyp ?? "Okänd typ"}</p>
                {assignedBy && <p className = "arbetsplanering-assigned-by">Tilldelad av: {assignedBy}</p>}
                {showCompletedButton && (
                    <button
                        className = "arbetsplanering-complete-button"
                        onClick = {(event) => {
                            event.stopPropagation()
                            onComplete(arende.id)
                        }}
                    >
                        Completed
                    </button>
                )}
            </div>
        </div>
    )
}

function readDraggedArendeId(event) {
    const raw = event.dataTransfer.getData("text/plain")
    const id = Number(raw)
    return Number.isNaN(id) ? null : id
}

export default function ArbetsplaneringTab({ arenden = [] }){

    const [users, setUsers] = useState([])
    const [assignmentByArendeId, setAssignmentByArendeId] = useState({})
    const [typeFilter, setTypeFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [avlidenSearch, setAvlidenSearch] = useState("")
    const [completedArendeIds, setCompletedArendeIds] = useState(new Set())
    const loggedInUserName = JSON.parse(localStorage.getItem("user"))?.userName ?? ""

    useEffect(() => {
        async function loadUsers(){
            const users = await getUsers();
            setUsers(users);
        };
        loadUsers();
        }, []);
    
    const usersSortedAlphabetically = [...users].sort((a,b) => a.username.localeCompare(b.username))

    const activeArenden = arenden.filter(
        (arende) => arende.status !== "Stängt" && arende.status !== "LEGACY" && arende.status !== "raderad"
    )
    const visibleArenden = activeArenden.filter((arende) => !completedArendeIds.has(arende.id))
    const activeArendenById = new Map(visibleArenden.map((arende) => [arende.id, arende]))

    const assignedArendeIds = new Set(
        Object.entries(assignmentByArendeId)
            .filter(([arendeId]) => activeArendenById.has(Number(arendeId)))
            .map(([arendeId]) => Number(arendeId))
    )

    const unassignedActiveArenden = visibleArenden
        .filter((arende) => !assignedArendeIds.has(arende.id))
        .filter((arende) => typeFilter === "" || arende.arendeTyp === typeFilter)
        .filter((arende) => statusFilter === "" || arende.status === statusFilter)
        .filter((arende) => (arende.avlidenNamn ?? "").toLowerCase().includes(avlidenSearch.toLowerCase()))

    const allArendeTyper = Object.keys(typeColor)
    const allStatuses = Object.keys(statusColor).filter((status) => status !== "Stängt" && status !== "LEGACY" && status !== "raderad")

    function handleDropOnUser(event, userId) {
        event.preventDefault()
        const arendeId = readDraggedArendeId(event)
        if (!arendeId) {
            return
        }

        setAssignmentByArendeId((prev) => {
            return {
                ...prev,
                [arendeId]: {
                    userId,
                    assignedBy: loggedInUserName || "Okänd användare"
                }
            }
        })
    }

    function handleDropOnUnassignedPanel(event) {
        event.preventDefault()
        const arendeId = readDraggedArendeId(event)
        if (!arendeId) {
            return
        }

        setAssignmentByArendeId((prev) => {
            const next = { ...prev }
            delete next[arendeId]
            return next
        })
    }

    function handleComplete(arendeId) {
        setAssignmentByArendeId((prev) => {
            const next = { ...prev }
            delete next[arendeId]
            return next
        })
        setCompletedArendeIds((prev) => new Set(prev).add(arendeId))
    }

    return <div className = "arbetsplanering-layout">
        <div
            className = "ticket-assign-panel"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDropOnUnassignedPanel}
        >
            <h3>Aktiva ärenden</h3>
            <input
                className = "arbetsplanering-search"
                type = "text"
                placeholder = "Sök avliden namn"
                value = {avlidenSearch}
                onChange = {(event) => setAvlidenSearch(event.target.value)}
            />
            <div className = "arbetsplanering-filter-row">
                <select
                    className = "arbetsplanering-filter-select"
                    value = {typeFilter}
                    onChange = {(event) => setTypeFilter(event.target.value)}
                >
                    <option value = "">Alla ärendetyper</option>
                    {allArendeTyper.map((typ) => (
                        <option key = {typ} value = {typ}>
                            {typ}
                        </option>
                    ))}
                </select>
                <select
                    className = "arbetsplanering-filter-select"
                    value = {statusFilter}
                    onChange = {(event) => setStatusFilter(event.target.value)}
                >
                    <option value = "">Alla statusar</option>
                    {allStatuses.map((status) => (
                        <option key = {status} value = {status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>
            <div className = "arbetsplanering-results-scroll">
                {unassignedActiveArenden.length === 0 && <p className = "drop-hint">Inga oplacerade aktiva ärenden.</p>}
                {unassignedActiveArenden.map((arende) => <ArendeCard key = {arende.id} arende = {arende} onComplete = {handleComplete} />)}
            </div>
        </div>
        <div className = "user-columns-container">
        {usersSortedAlphabetically.map((user) => {
            const userId = String(user.id)
            const assignedForUser = Object.entries(assignmentByArendeId)
                .filter(([, assignment]) => assignment.userId === userId)
                .map(([arendeId]) => activeArendenById.get(Number(arendeId)))
                .filter(Boolean)
            return <div
                key = {userId}
                className = "user-column"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDropOnUser(event, userId)}
            >
            <p className = "user-column-header">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</p>
            <div className = "user-column-drop-area">
                {assignedForUser.length === 0 && <p className = "drop-hint">Släpp ärende här</p>}
                {assignedForUser.map((arende) => <ArendeCard
                    key = {arende.id}
                    arende = {arende}
                    assignedBy = {assignmentByArendeId[arende.id]?.assignedBy}
                    showCompletedButton = {user.username?.toLowerCase() === loggedInUserName.toLowerCase()}
                    onComplete = {handleComplete}
                />)}
            </div>
        </div>})}
        </div>
    </div>
}
