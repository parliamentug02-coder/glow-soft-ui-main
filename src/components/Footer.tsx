import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    'VIP статус': ['Купівля VIP статусу за телеграмом @TheDuma']
  };

  return (
    <footer className="bg-background-secondary border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
            >
              Skoropad
            </motion.div>
            
            <p className="text-muted-foreground max-w-sm">
              Найкраща платформа для розміщення оголошень в Україні. 
              Швидко, зручно та безпечно.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+380 (44) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@skoropad.ua</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Київ, вул. Хрещатик, 1</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-accent transition-colors hover:scale-[1.02] inline-block transform-gpu"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <p className="text-muted-foreground text-sm">
            © 2024 Skoropad. Всі права захищені.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors hover:scale-[1.02] inline-block transform-gpu">
              Політика конфіденційності
            </a>
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors hover:scale-[1.02] inline-block transform-gpu">
              Умови використання
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;