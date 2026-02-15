import Link from 'next/link'
type props={
    id:number,
    name:string;
    managed_by:string;
}
export default function Org({id,name,managed_by}:props){
    return(
        <tr>
            <td className="px-2 py-2">{name} </td>
            <td className="px-2 py-2"> {managed_by}</td>
            <Link href={'/pages/organisation_dashboard/'}><td className="px-2 py-2 bg-white rounded-3xl hover:bg-gray-200"><button>View</button></td></Link>
        </tr>
    )
}