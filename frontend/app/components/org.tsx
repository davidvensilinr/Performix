import Link from 'next/link'

type props = {
    id: number,
    name: string;
    managed_by: string;
}

export default function Org({ id, name, managed_by }: props) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{name}</h3>
                <p className="text-sm text-gray-500 mb-4">Managed by: <span className="font-medium text-gray-700">{managed_by}</span></p>
            </div>
            <Link href={'/pages/organisation_dashboard/' + id} className="block">
                <button className="w-full py-2 px-4 bg-gray-50 text-[#7825ff] font-medium rounded-lg hover:bg-[#7825ff] hover:text-white transition-all duration-200 border border-[#7825ff]/20">
                    View Dashboard
                </button>
            </Link>
        </div>
    )
}