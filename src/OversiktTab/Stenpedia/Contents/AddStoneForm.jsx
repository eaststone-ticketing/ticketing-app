import { addSten } from '../../../api.js'
import { useForm } from 'react-hook-form';
import './AddStoneForm.css'

export function AddStoneForm({setIsStoneFormVisible, setStenar}) {
    const {
    register,
    handleSubmit,
    formState: { errors },
    reset
    }  = useForm();

    const onSubmit = async (data) => {

        try {
        await addSten(data)
        } catch(err){
            console.error(err)
        }
        reset();
        setIsStoneFormVisible(false)
    }

    return <div>
        <form onSubmit = {handleSubmit(onSubmit)} className = "add-stone-form">
             <label className = "add-stone-form-entry"> Namn
                <input {...register("namn", {required: true})}></input>
             </label>
             <label className = "add-stone-form-entry"> Infotext
                <textarea {...register("info", {required: true})}></textarea>
             </label>
             <div className = "add-stone-form-buttons">
             <button type = "submit">Spara</button>
             <button type = "button" onClick = {() => setIsStoneFormVisible(false)}>Avbryt</button>
             </div>
        </form>
    </div>
}