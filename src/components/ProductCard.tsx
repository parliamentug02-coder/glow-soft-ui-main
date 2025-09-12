import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  isOnSale?: boolean;
  index: number;
}

const ProductCard = ({
  name,
  description,
  price,
  originalPrice,
  image,
  isNew,
  isOnSale,
  index
}: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Card className="card-soft overflow-hidden border-0 bg-gradient-soft relative">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
          {isNew && (
            <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
              Новинка
            </span>
          )}
          {isOnSale && (
            <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-medium">
              Знижка
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <Heart className="w-4 h-4" />
        </Button>

        {/* Product Image */}
        <div className="relative overflow-hidden">
          <motion.img
            src={image}
            alt={name}
            className="w-full h-64 object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-2 text-foreground">{name}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {description}
          </p>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">
                ₴{price.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₴{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              className="flex-1 btn-accent rounded-2xl"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Купити
            </Button>
            <Button 
              variant="outline" 
              className="px-6 rounded-2xl border-border hover:bg-background-secondary"
            >
              Детальніше
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;