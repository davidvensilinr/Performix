import Navbar from "../../components/Navbar";
export default function Login(){
    return(
        <div>
            <Navbar/>
            <div className="flex flex-col items-center justify-center">
            <h1 className="text-center pb-4 text-2xl font-serif">Login</h1>
            <div style={{backgroundColor:"#7825ff"}} className="p-4 rounded-lg ">
            <form>
            <div className="flex flex-row items-center pb-4">
                <h3 className="text-white w-1/3" >Email :</h3>
                <input type="email" placeholder="Enter your email" className="w-2/3"/>
                </div>
            <div className="flex flex-row items-center pb-4">
                <h3 className="text-white w-1/3" >Password :</h3>
                <input type="password" placeholder="Enter your password" className="w-2/3"/>
                </div>
                <button className=" text-black flex items-center justify-center w-full bg-white transition duration-1000 hover:bg-gray-300 rounded-md">Login</button>
            </form>
            </div>
            </div>
        </div>
    )
}