import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const CategoriesPage = () => {
  const groups = [
    {
      title: 'Автомобілі',
      items: [
        { title: 'Продаж Автомобілі', href: '/automobiles/sale' },
        { title: 'Продаж вантажівок', href: '/automobiles/trucks' },
        { title: 'Продаж Вініли', href: '/automobiles/vinyls' },
        { title: 'Продаж Деталі', href: '/automobiles/parts' },
        { title: 'Продаж Номера', href: '/automobiles/numbers' },
        { title: 'Оренда автомобіля', href: '/automobiles/car-rental' },
        { title: 'Оренда вантажівок', href: '/automobiles/truck-rental' },
      ],
    },
    {
      title: 'Одяг',
      items: [
        { title: 'Продаж одягу', href: '/clothing/sale' },
        { title: 'Продаж аксесуарів', href: '/clothing/accessories' },
        { title: 'Продаж рюкзаків', href: '/clothing/backpacks' },
      ],
    },
    {
      title: 'Нерухомість',
      items: [
        { title: 'Продаж бізнесу', href: '/real-estate/business' },
        { title: 'Продаж квартир', href: '/real-estate/apartments' },
        { title: 'Продаж приватних будинків', href: '/real-estate/houses' },
        { title: 'Оренда теплиць', href: '/real-estate/greenhouses' },
      ],
    },
    {
      title: 'Інше',
      items: [
        { title: 'Різне', href: '/other/misc' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Категорії</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Оберіть категорію, щоб переглянути доступні підрозділи
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {groups.map((group, gi) => (
              <motion.article
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: "0 20px 60px -15px hsl(var(--shadow-soft) / 0.4)"
                }}
                transition={{ duration: 0.4, delay: gi * 0.05 }}
                className="glass-card p-6" // Changed to glass-card
              >
                <h2 className="text-xl font-semibold mb-4 text-foreground group-hover:text-accent transition-colors duration-300">{group.title}</h2>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <motion.li key={item.href} whileHover={{ x: 5 }}>
                      <Link
                        to={item.href}
                        className="block rounded-xl px-4 py-3 text-sm text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 hover:shadow-sm transform-gpu glow-on-hover"
                      >
                        {item.title}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoriesPage;