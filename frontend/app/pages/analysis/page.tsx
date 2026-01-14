import Navbar from "@/app/components/Navbar"
export default function Analysis(){
    return(
        <div>
        <Navbar/>
        <div className="flex flex-col items-center justify-center gap-4">
        <button className="bg-white w-1/2 h-1/2 rounded-full font-mono font-bold hover:bg-gray-300 transition duration-500 p-2 text-xl">Add your Organisation +</button>
        <h1 className=" text-white font-serif font-bold text-2xl w-full text-center">Select to View Analysis of your Organisation</h1></div>
        </div>
    );
}