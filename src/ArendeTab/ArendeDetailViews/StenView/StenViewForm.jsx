import {useEffect} from 'react'
import { useForm } from 'react-hook-form';
import { updateArende } from '../../../api.js';

export function StenViewForm({fields, activeArende, setActiveArende, setEditSten}) {

    const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
    }  = useForm();

      useEffect(() => {
    if (activeArende) {
      reset(activeArende);
    }
  }, [activeArende, reset]);

    const inputField = (label, namn, type, required = false, options = []) => {
    return <div className = "sten-field">
    {type !== "dropdown" && <label htmlFor = {namn}>{label}: 
        <input 
          id = {namn} 
          type = {type}
          {...register(namn , {required: required})}>
        </input>
    </label>}

    {type === "dropdown" && <label htmlFor = {namn}>{label} 
      <select id = {namn} {...register(namn, {required: required})}>
        <option>-</option>
        {options.map(o =>
          <option>{o}</option>
        )}
      </select>
      </label>}
    </div>
    }

    const mapInputFields = (entryArray, sectionLabel) => {
    return (
        <div>
        <h4>{sectionLabel}</h4>
        {entryArray.map((entry, index) => (
            <div key={index}>
                {inputField(entry.label, entry.name, entry.type)}
            </div>
        ))}
        </div>
    );
    };

    const onSubmit = async (data) => {
      try {
        const newArende = { ...activeArende, ...data};
        await updateArende(activeArende.id, newArende);
        setActiveArende(newArende);
      }
      catch(err) {
        console.log(err)
      }

      setEditSten(false);
    };

    return <form onSubmit={handleSubmit(onSubmit)} className = "sten-view-form">
        {mapInputFields(fields, "Sten")}
        <button type = "submit">Bekräfta</button>
    </form>

}