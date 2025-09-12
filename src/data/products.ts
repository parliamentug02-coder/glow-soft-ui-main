import phone1 from '@/assets/phone-1.jpg';
import headphones1 from '@/assets/headphones-1.jpg';
import laptop1 from '@/assets/laptop-1.jpg';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isOnSale?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'Найпотужніший iPhone з титановим корпусом і революційним процесором A17 Pro',
    price: 45999,
    originalPrice: 49999,
    image: phone1,
    category: 'Смартфони',
    isNew: true,
    isOnSale: true
  },
  {
    id: '2',
    name: 'AirPods Pro 2',
    description: 'Бездротові навушники з активним шумозаглушенням і просторовим звуком',
    price: 8999,
    image: headphones1,
    category: 'Навушники',
    isNew: true
  },
  {
    id: '3',
    name: 'MacBook Air M3',
    description: 'Ультратонкий ноутбук з процесором M3 для професійної роботи',
    price: 52999,
    originalPrice: 56999,
    image: laptop1,
    category: 'Ноутбуки',
    isOnSale: true
  },
  {
    id: '4',
    name: 'Samsung Galaxy S24',
    description: 'Флагманський смартфон з AI-функціями та професійною камерою',
    price: 34999,
    image: phone1,
    category: 'Смартфони'
  },
  {
    id: '5',
    name: 'Sony WH-1000XM5',
    description: 'Преміальні навушники з найкращим шумозаглушенням в індустрії',
    price: 12999,
    originalPrice: 14999,
    image: headphones1,
    category: 'Навушники',
    isOnSale: true
  },
  {
    id: '6',
    name: 'Dell XPS 13',
    description: 'Компактний ноутбук для бізнесу з безрамковим дисплеєм',
    price: 42999,
    image: laptop1,
    category: 'Ноутбуки',
    isNew: true
  }
];

export const categories = [
  'Всі товари',
  'Смартфони',
  'Ноутбуки',
  'Навушники',
  'Планшети',
  'Аксесуари'
];