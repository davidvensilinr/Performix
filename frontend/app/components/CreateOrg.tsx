import {useState} from "react";
type props={
     name:string;
    managed_by:string;
}
export default function CreateOrg(){
    const [org,setOrg]=useState("");
    const [managed,setManaged]=useState("");
    const addOrg=async(e:React.FormEvent)=>{
        e.preventDefault();
        const res= await fetch("/api/organisation",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                name: org,
                managed_by: managed
            })
        })
        setOrg("");
        setManaged("");
    }
    return(
        <form onSubmit={addOrg}>
            <input placeholder="company name" value={org} onChange={(e)=>setOrg(e.target.value)}/>
            <input placeholder="managed by" value={managed} onChange={(e)=>setManaged(e.target.value)}/>
            <button type="submit">Add</button>
        </form>

    );
}