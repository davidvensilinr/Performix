import Link from 'next/link';
export default function Navbar(){
    return (
        <>
        <h1 className="font-sans text-center font-bold p-4 text-4xl">Performix</h1>
        <nav style={{backgroundColor:'#7825ff'}} className="m-4 p-4 rounded-2xl h-10 flex justify-between items-center p-4 bg-white">
            <Link href="/"><button className="font-serif text-2xl text-white">Home</button></Link>
            <Link href="/pages/analysis"><button className="font-serif  text-2xl text-white">Analysis-DashBoard</button></Link>
            <Link href="/pages/login"><button className="font-serif text-2xl text-white">Login/Signup</button></Link>
        </nav>
        </>
    );
}