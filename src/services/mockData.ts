
import { Product, Order } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium T-Shirt',
    description: 'High-quality cotton t-shirt available in multiple colors',
    price: 15.99,
    minQuantity: 10,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 500,
    category: 'clothing'
  },
  {
    id: '2',
    name: 'Bluetooth Speaker',
    description: 'Portable wireless speaker with 10-hour battery life',
    price: 45.99,
    minQuantity: 5,
    image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 120,
    category: 'electronics'
  },
  {
    id: '3',
    name: 'Coffee Beans (1kg)',
    description: 'Premium arabica coffee beans, ethically sourced',
    price: 24.99,
    minQuantity: 5,
    image: 'https://images.unsplash.com/photo-1559525839-d3d301140615?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 200,
    category: 'food'
  },
  {
    id: '4',
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    price: 129.99,
    minQuantity: 2,
    image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 50,
    category: 'furniture'
  },
  {
    id: '5',
    name: 'Smart Watch',
    description: 'Fitness tracker with heart rate monitoring',
    price: 89.99,
    minQuantity: 3,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 75,
    category: 'electronics'
  },
  {
    id: '6',
    name: 'Ceramic Mug Set',
    description: 'Set of 6 handcrafted ceramic mugs',
    price: 34.99,
    minQuantity: 4,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 100,
    category: 'other'
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Retail Store',
    items: [
      { product: mockProducts[0], quantity: 20 },
      { product: mockProducts[2], quantity: 10 }
    ],
    total: 569.70,
    status: 'delivered',
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-18T14:20:00Z',
    paymentMethod: 'stripe'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Retail Store',
    items: [
      { product: mockProducts[3], quantity: 5 },
      { product: mockProducts[5], quantity: 8 }
    ],
    total: 929.87,
    status: 'processing',
    createdAt: '2023-06-20T09:15:00Z',
    updatedAt: '2023-06-20T09:15:00Z',
    paymentMethod: 'paypal'
  }
];

// Mock data service functions
export const getProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProducts), 500);
  });
};

export const getProductById = (id: string): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProducts.find(p => p.id === id)), 300);
  });
};

export const getProductsByCategory = (category: string): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = category === 'all' 
        ? mockProducts 
        : mockProducts.filter(p => p.category === category);
      resolve(filtered);
    }, 300);
  });
};

export const getOrders = (): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockOrders), 500);
  });
};

export const getOrderById = (id: string): Promise<Order | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockOrders.find(o => o.id === id)), 300);
  });
};

export const getUserOrders = (userId: string): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockOrders.filter(o => o.userId === userId)), 500);
  });
};
