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

    **nav** -> to indicate these particular elements inside for specifically for navigation

    nav -> class{
        flex justify-between items-center -> {
            flex : makes the direct children to be laid horizontally
            justify-between:spaces the direct children equally , first child at the start(left most) and last child at the end(right most)
            items-center:aligns the direct children vertically in the center
        }
    }

}
