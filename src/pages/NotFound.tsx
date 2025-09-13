import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="mb-8">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                404
              </h1>
              <h2 className="text-2xl font-bold mb-4">Сторінка не знайдена</h2>
              <p className="text-muted-foreground mb-8">
                Вибачте, але сторінка яку ви шукаете не існує або була переміщена.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="btn-accent rounded-2xl hover:scale-105 transition-transform"
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  На головну
                </Link>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="rounded-2xl hover:scale-105 transition-transform"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default NotFound;