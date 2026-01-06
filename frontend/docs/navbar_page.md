# Navbar for the overall webapp

Since we would need a navigation bar in almost all pages of the web app. We could create 
the navbar as a separate component and then import it in different pages wherever it is needed

Navbar components -> { 
    Home page 
    Login/Signup
}

Steps ->{
    **export default function Navbar()**

    function -> block of code which can be called anytime ,anywhere and returns something, in our case Navbar function returns and renders navbar page

    default -> to indicate this is the default function that is being exported from this file

    export-> eventhough function could be called anywhere, it is still private and can be only called inside its own file, so we are exporting the function making it accessible for all files 
}