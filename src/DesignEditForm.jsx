import { updateArende } from './api';
import './OversiktEditForm.css'
import { useState } from 'react'

export default function DesignEditForm({ arende, setDesignEdit, setActiveArende }) {

    const [formData, setFormData] = useState({
        modell: arende.modell,
        material: arende.material,
        typsnitt: arende.typsnitt,
        farg: arende.farg,
        forsankt: arende.forsankt,
        platsForFlerNamn: arende.platsForFlerNamn,
        avlidenNamn: arende.avlidenNamn,
        symboler: arende.symboler,
        fodelseDatum: arende.fodelseDatum,
        dodsDatum: arende.dodsDatum,
        minnesord: arende.minnesord,
        dekor: arende.dekor
    });

    function onSubmit() {
        const newArende = {
            ...arende,
            ...formData
        };

        updateArende(arende.id, newArende);
        setActiveArende(newArende);
        setDesignEdit(false);
    }

    return (
        <div>
            <form
                className="design-edit-form"
                onSubmit={(e) => { e.preventDefault(); onSubmit() }}
            >

                <div className="edit-form-entry">
                    <label><strong>Modell:</strong></label>
                    <input
                        name="modell"
                        value={formData.modell}
                        onChange={(e) => setFormData({ ...formData, modell: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Material:</strong></label>
                    <input
                        name="material"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Typsnitt:</strong></label>
                    <input
                        name="typsnitt"
                        value={formData.typsnitt}
                        onChange={(e) => setFormData({ ...formData, typsnitt: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Färg:</strong></label>
                    <input
                        name="farg"
                        value={formData.farg}
                        onChange={(e) => setFormData({ ...formData, farg: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Försänkt:</strong></label>
                    <select
                        name="forsankt"
                        value={formData.forsankt}
                        onChange={(e) => setFormData({ ...formData, forsankt: e.target.value })}
                    >   
                        <option value = {""}></option>
                        <option value={"Försänkt"}>Försänkt</option>
                        <option value={"Förhöjd"}>Förhöjd</option>
                    </select>
                </div>

                <div className="edit-form-entry">
                    <label><strong>Plats för fler namn:</strong></label>
                    <input
                        name="platsForFlerNamn"
                        value={formData.platsForFlerNamn}
                        onChange={(e) => setFormData({ ...formData, platsForFlerNamn: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Namn:</strong></label>
                    <input
                        name="avlidenNamn"
                        value={formData.avlidenNamn}
                        onChange={(e) => setFormData({ ...formData, avlidenNamn: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Symboler vid datum:</strong></label>
                    <input
                        name="symboler"
                        value={formData.symboler}
                        onChange={(e) => setFormData({ ...formData, symboler: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Födelsedatum:</strong></label>
                    <input
                        type="date"
                        name="fodelseDatum"
                        value={formData.fodelseDatum}
                        onChange={(e) => setFormData({ ...formData, fodelseDatum: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Dödsdatum:</strong></label>
                    <input
                        type="date"
                        name="dodsDatum"
                        value={formData.dodsDatum}
                        onChange={(e) => setFormData({ ...formData, dodsDatum: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Minnesord:</strong></label>
                    <input
                        name="minnesord"
                        value={formData.minnesord}
                        onChange={(e) => setFormData({ ...formData, minnesord: e.target.value })}
                    />
                </div>

                <div className="edit-form-entry">
                    <label><strong>Dekor:</strong></label>
                    <input
                        name="dekor"
                        value={formData.dekor}
                        onChange={(e) => setFormData({ ...formData, dekor: e.target.value })}
                    />
                </div>

                <div className="button-panel">
                    <button onClick={() => setDesignEdit(false)} type="button">Avbryt</button>
                    <button type="submit">Bekräfta</button>
                </div>

            </form>
        </div>
    );
}
