import react from "react";
import Header from "./Components/Header/Header";
import HeroSection from "./Components/Hero/HeroSection";
import ImpactMessage from "./Components/ImpactMessage/ImpactMessage";
import AboutPage from "./Components/AboutPage/AboutPage";
import ServicesPage from "./Components/ServicePage/ServicesPage";
import ProjectsPage from "./Components/ProjectPage/ProjectPage";
import ContactPage from "./Components/ContactPage/ContactPage";
import TestimonialsPage from "./Components/TestimonialsPage/TestimonialsPage";
import Footer from "./Components/Footer/Footer";
const App = () => {

  return (
    <>
    <Header/>
    <HeroSection/>
    <ImpactMessage/>
    <AboutPage/>
    <ServicesPage/>
    <ProjectsPage/>
    <ContactPage/>
    <TestimonialsPage/>
    <Footer/>
   </>
  );
};

export default App;

