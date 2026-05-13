import {getUsers} from '../api.js'
import {useState, useEffect} from 'react'
import './ArbetsplaneringTab.css'

export default function ArbetsplaneringTab({ arenden = [] }){

    const [users, setUsers] = useState([])
    const [assignmentByArendeId, setAssignmentByArendeId] = useState({})
    const [draggedArendeId, setDraggedArendeId] = useState(null)
    const [typeFilter, setTypeFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [avlidenSearch, setAvlidenSearch] = useState("")
    const [completedArendeIds, setCompletedArendeIds] = useState(new Set())
    const loggedInUserName = JSON.parse(localStorage.getItem("user"))?.userName ?? ""

    const statusColor = {
        "Nytt": ["rgb(200,155,255)", "rgb(200,198,255)"],
        "Väntar svar av kund":["rgb(200,155,255)", "rgb(255, 225, 115)"],
        "Väntar svar av kyrkogård":["rgb(200,155,255)", "rgb(243, 100, 255)"],
        "Väntar svar av kund och kyrkogård":["rgb(200,155,255)", "rgb(123, 245, 200)"],
        "Godkänd av kund" : ["rgb(240, 245, 145)", "rgb(255, 225, 115)"],
        "Godkänd av kund, väntar svar av kyrkogård" : ["rgb(240, 245, 145)","rgb(243, 100, 255)"],
        "Godkänd av kyrkogård" : ["rgb(243, 145, 228)", "rgb(243, 100, 255) "],
        "Godkänd av kyrkogård, väntar svar av kund" : ["rgb(243, 145, 228)", "rgb(255, 225, 115)"],
        "Redo" : ["rgb(153, 245, 153)",  "rgb(123, 245, 200)"],
        "Stängt" : ["rgb(196, 196, 196)", "rgb(199, 199, 199)"],
        "LEGACY" : ["rgb(213, 223, 215)",  "rgb(223, 233, 225)"],
        "raderad" : ["rgb(200,155,255)", "rgb(200,198,255)"]
    }

    const typeColor = {
        "Ny sten": ["rgba(211, 229, 255, 1)", "rgba(211, 229, 255, 1)"],
        "Stabilisering": ["rgba(245, 211, 179, 1)", "rgba(245, 211, 179, 1)"],
        "Nyinskription": ["rgba(255, 211, 242, 1)", "rgba(255, 211, 242, 1)"],
        "Ommålning": ["rgba(255, 211, 211, 1)", "rgba(255, 211, 211, 1)"],
        "Rengöring": ["rgba(255, 248, 211, 1)", "rgba(255, 248, 211, 1)"],
        "Inspektering": ["rgba(252, 255, 211, 1)", "rgba(252, 255, 211, 1)"],
        "Övrigt" : ["rgba(200, 200, 200, 1)", "rgba(200, 200, 200, 1)"]
    }

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

    function handleDragStart(arendeId) {
        setDraggedArendeId(arendeId)
    }

    function handleDropOnUser(userId) {
        if (!draggedArendeId) {
            return
        }

        setAssignmentByArendeId((prev) => {
            return {
                ...prev,
                [draggedArendeId]: {
                    userId,
                    assignedBy: loggedInUserName || "Okänd användare"
                }
            }
        })
        setDraggedArendeId(null)
    }

    function handleDropOnUnassignedPanel() {
        if (!draggedArendeId) {
            return
        }

        setAssignmentByArendeId((prev) => {
            const next = { ...prev }
            delete next[draggedArendeId]
            return next
        })
        setDraggedArendeId(null)
    }

    function handleComplete(arendeId) {
        setAssignmentByArendeId((prev) => {
            const next = { ...prev }
            delete next[arendeId]
            return next
        })
        setCompletedArendeIds((prev) => new Set(prev).add(arendeId))
    }

    function ArendeCard({ arende, assignedBy, showCompletedButton }) {
        return (
            <div
                className = "arbetsplanering-arende-card"
                draggable
                onDragStart={() => handleDragStart(arende.id)}
                onDragEnd={() => setDraggedArendeId(null)}
                style={{
                    "--status-color-start": statusColor[arende.status]?.[0] || "transparent",
                    "--status-color-end": statusColor[arende.status]?.[1] || "transparent",
                    "--arende-type-color-start": typeColor[arende.arendeTyp]?.[0] || "transparent",
                    "--arende-type-color-end": typeColor[arende.arendeTyp]?.[1] || "transparent"
                }}
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
                                handleComplete(arende.id)
                            }}
                        >
                            Completed
                        </button>
                    )}
                </div>
            </div>
        )
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
                {unassignedActiveArenden.map((arende) => <ArendeCard key = {arende.id} arende = {arende} />)}
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
                onDrop={() => handleDropOnUser(userId)}
            >
            <p className = "user-column-header">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</p>
            <div className = "user-column-drop-area">
                {assignedForUser.length === 0 && <p className = "drop-hint">Släpp ärende här</p>}
                {assignedForUser.map((arende) => <ArendeCard
                    key = {arende.id}
                    arende = {arende}
                    assignedBy = {assignmentByArendeId[arende.id]?.assignedBy}
                    showCompletedButton = {user.username?.toLowerCase() === loggedInUserName.toLowerCase()}
                />)}
            </div>
        </div>})}
        </div>
    </div>
}