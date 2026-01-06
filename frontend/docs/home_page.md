# Setting up the home page of the web app
 First we need to setup the title of the app to be displayed when the app is opened

 So let's use tailwind css to add animation to the title and add title at the top of the page

 Title -> {
    font-family - sans -> font-sans
    center aligned -> text-center
    bold text -> font-bold
    size - 4xl -> text-4xl
    padding 4px -> p-4
 }

 Now we have to setup for navigation bar below the title so that users could navigate through the pages they would like to visit

 The navbar is created as a component in the component file

 Let's import the navbar to the home page now 

 Steps -> {
    import Navbar from "./components/Navbar" -> we are importing the Navbar function that was exported in that file

    <Navbar/> - we are directing code to render the navbar code here  
 }