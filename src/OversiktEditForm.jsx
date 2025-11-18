export default function OverSiktEditForm({arende}){
    return <div>
        <form>
            <div>
                <label><strong>Dödsdatum:</strong></label>
                <input type ="date"></input>
            </div>
            <div>
                <label><strong>Födelsedatum:</strong></label>
                <input type ="date"></input>
            </div>
            <div>
                <label><strong>Beställare: {arende.bestallare}</strong></label>
            </div>
            <div>
                <label><strong>Email: {arende.email}</strong></label>
            </div>
            <div>
                <label><strong>Telefonnummer: {arende.tel}</strong></label>
            </div>
            <div>
                <label><strong>Kyrkogård:</strong></label>
                <select>
                    <option>Välj kyrkogård</option>
                </select>
            </div>
            <div>
                <label><strong>Kvarter:</strong></label>
                <input></input>
            </div>
            <div>
                <label><strong>Gravnummer:</strong></label>
                <input></input>
            </div>
        </form>
    </div>
}
