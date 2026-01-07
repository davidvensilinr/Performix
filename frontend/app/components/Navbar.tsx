export default function Navbar(){
    return (
        <>
        <nav style={{backgroundColor:'#7825ff'}} className="flex justify-between items-center p-4 bg-white">
            <button className="font-serif text-2xl">Home</button>
            <button className="font-serif  text-2xl">Analysis-DashBoard</button>
            <button className="font-serif text-2xl">Login/Signup</button>
        </nav>
        </>
    );
}