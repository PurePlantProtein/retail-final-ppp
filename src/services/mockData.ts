
import { Product, Order, OrderStatus, AminoAcid, NutritionalValue } from '@/types/product';

// Mock data for products
let productsList: Product[] = [
  {
    id: '1',
    name: 'Whey Protein Isolate',
    description: 'High-quality whey protein isolate for muscle recovery.',
    price: 79.99,
    image: 'https://m.media-amazon.com/images/I/71xbJvzzmdL._AC_UF1000,1000_QL80_.jpg',
    category: 'Protein',
    stock: 50,
    min_quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    weight: 1000,
    bag_size: '1kg',
    number_of_servings: 33,
    serving_size: '30g',
    ingredients: 'Whey Protein Isolate, Natural Flavors, Sucralose',
    nutritional_info: [
      { name: "Protein", perServing: "25g", per100g: "83g" },
      { name: "Carbs", perServing: "3g", per100g: "10g" },
      { name: "Fat", perServing: "1g", per100g: "3g" }
    ],
    amino_acid_profile: [
      { name: "Leucine", amount: "2.5g" },
      { name: "Isoleucine", amount: "1.5g" },
      { name: "Valine", amount: "1.5g" }
    ]
  },
  {
    id: '2',
    name: 'Creatine Monohydrate',
    description: 'Pure creatine monohydrate for increased strength and power.',
    price: 29.99,
    image: 'https://cdn.shopify.com/s/files/1/0620/4474/7479/products/creatine-monohydrate-unflavored-1kg-147884_540x.jpg?v=1664969434',
    category: 'Performance',
    stock: 100,
    min_quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    weight: 500,
    bag_size: '500g',
    number_of_servings: 166,
    serving_size: '3g',
    ingredients: 'Creatine Monohydrate',
    nutritional_info: [
      { name: "Creatine", perServing: "3g", per100g: "100g" },
      { name: "Calories", perServing: "0", per100g: "0" }
    ],
    amino_acid_profile: []
  },
  {
    id: '3',
    name: 'BCAA Powder',
    description: 'Branched-chain amino acids to support muscle growth and reduce fatigue.',
    price: 39.99,
    image: 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dw0c3cd058/hi-res/352145_1.jpg?sw=2000&sh=2000&sm=fit',
    category: 'Recovery',
    stock: 75,
    min_quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    weight: 300,
    bag_size: '300g',
    number_of_servings: 30,
    serving_size: '10g',
    ingredients: 'L-Leucine, L-Isoleucine, L-Valine, Citric Acid, Natural Flavors, Sucralose',
    nutritional_info: [
      { name: "Calories", perServing: "10", per100g: "100" },
      { name: "BCAAs", perServing: "5g", per100g: "50g" }
    ],
    amino_acid_profile: [
      { name: "Leucine", amount: "2g" },
      { name: "Isoleucine", amount: "1g" },
      { name: "Valine", amount: "1g" }
    ]
  },
  {
    id: '4',
    name: 'Pre-Workout Complex',
    description: 'Advanced pre-workout formula for energy, focus, and performance.',
    price: 49.99,
    image: 'https://cdn.shopify.com/s/files/1/0266/7112/0472/products/muscle-nation-legacy-pre-workout-40serves-blue-raspberry_800x.jpg?v=1672842698',
    category: 'Performance',
    stock: 60,
    min_quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    weight: 400,
    bag_size: '400g',
    number_of_servings: 40,
    serving_size: '10g',
    ingredients: 'Beta-Alanine, Citrulline Malate, Caffeine Anhydrous, L-Theanine, Natural Flavors, Sucralose',
    nutritional_info: [
      { name: "Calories", perServing: "15", per100g: "150" },
      { name: "Beta-Alanine", perServing: "3g", per100g: "30g" },
      { name: "Citrulline Malate", perServing: "6g", per100g: "60g" },
      { name: "Caffeine", perServing: "200mg", per100g: "2000mg" }
    ],
    amino_acid_profile: []
  },
  {
    id: '5',
    name: 'Vegan Protein Blend',
    description: 'Plant-based protein blend for vegans and vegetarians.',
    price: 69.99,
    image: 'https://cdn.shopify.com/s/files/1/0528/7827/7458/products/VeganProtein_540x.png?v=1615973769',
    category: 'Protein',
    stock: 40,
    min_quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    weight: 900,
    bag_size: '900g',
    number_of_servings: 30,
    serving_size: '30g',
    ingredients: 'Pea Protein, Brown Rice Protein, Chia Seed Protein, Natural Flavors, Stevia',
    nutritional_info: [
      { name: "Calories", perServing: "110", per100g: "366" },
      { name: "Protein", perServing: "22g", per100g: "73g" },
      { name: "Carbs", perServing: "4g", per100g: "13g" },
      { name: "Fat", perServing: "2g", per100g: "7g" }
    ],
    amino_acid_profile: [
      { name: "Leucine", amount: "2g" },
      { name: "Isoleucine", amount: "1g" },
      { name: "Valine", amount: "1g" }
    ]
  },
  {
    id: '6',
    name: 'Glutamine Powder',
    description: 'Pure L-Glutamine to support muscle recovery and immune function.',
    price: 24.99,
    image: 'https://www.nutritionwarehouse.com.au/media/catalog/product/cache/1/image/650x650/040ec09b1e358998e92faca65b79a892/a/p/applied-nutrition-l-glutamine-500g.jpg',
    category: 'Recovery',
    stock: 80,
    min_quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    weight: 400,
    bag_size: '400g',
    number_of_servings: 80,
    serving_size: '5g',
    ingredients: 'L-Glutamine',
    nutritional_info: [
      { name: "Calories", perServing: "0", per100g: "0" },
      { name: "Glutamine", perServing: "5g", per100g: "100g" }
    ],
    amino_acid_profile: []
  },
  {
    id: '7',
    name: 'Casein Protein',
    description: 'Slow-digesting protein for nighttime recovery.',
    price: 59.99,
    image: 'https://www.sportyshealth.com.au/images/W/OPTIMUM-NUTRITION-GOLD-STANDARD-100-CASEIN-PROTEIN-900g.jpg',
    category: 'Protein',
    stock: 35,
    min_quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    weight: 900,
    bag_size: '900g',
    number_of_servings: 30,
    serving_size: '30g',
    ingredients: 'Micellar Casein, Natural Flavors, Sucralose',
    nutritional_info: [
      { name: "Calories", perServing: "120", per100g: "400" },
      { name: "Protein", perServing: "24g", per100g: "80g" },
      { name: "Carbs", perServing: "4g", per100g: "13g" },
      { name: "Fat", perServing: "1g", per100g: "3g" }
    ],
    amino_acid_profile: [
      { name: "Leucine", amount: "2.3g" },
      { name: "Isoleucine", amount: "1.4g" },
      { name: "Valine", amount: "1.3g" }
    ]
  },
  {
    id: '8',
    name: 'Weight Gainer',
    description: 'High-calorie formula for gaining weight and muscle mass.',
    price: 89.99,
    image: 'https://www.sportyshealth.com.au/images/W/MASS-GAIN-PROTEIN-plus-CREATINE-GLUTAMINE.jpg',
    category: 'Performance',
    stock: 25,
    min_quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    weight: 2500,
    bag_size: '2.5kg',
    number_of_servings: 16,
    serving_size: '155g',
    ingredients: 'Maltodextrin, Whey Protein Concentrate, Natural Flavors, Sucralose',
    nutritional_info: [
      { name: "Calories", perServing: "600", per100g: "387" },
      { name: "Protein", perServing: "30g", per100g: "19g" },
      { name: "Carbs", perServing: "120g", per100g: "77g" },
      { name: "Fat", perServing: "5g", per100g: "3g" }
    ],
    amino_acid_profile: [
      { name: "Leucine", amount: "3g" },
      { name: "Isoleucine", amount: "2g" },
      { name: "Valine", amount: "2g" }
    ]
  },
  {
    id: '9',
    name: 'Collagen Peptides',
    description: 'Supports healthy skin, hair, and joints.',
    price: 44.99,
    image: 'https://static.thcdn.com/images/large/webp//productimg/1600/1600/12081399-1184837494929836.jpg',
    category: 'Supplements',
    stock: 55,
    min_quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    weight: 500,
    bag_size: '500g',
    number_of_servings: 50,
    serving_size: '10g',
    ingredients: 'Collagen Peptides',
    nutritional_info: [
      { name: "Calories", perServing: "35", per100g: "350" },
      { name: "Protein", perServing: "9g", per100g: "90g" },
      { name: "Carbs", perServing: "0g", per100g: "0g" },
      { name: "Fat", perServing: "0g", per100g: "0g" }
    ],
    amino_acid_profile: []
  },
  {
    id: '10',
    name: 'Omega-3 Fish Oil',
    description: 'Essential fatty acids for heart and brain health.',
    price: 34.99,
    image: 'https://static.thcdn.com/images/large/webp//productimg/1600/1600/12789868-1384894843364261.jpg',
    category: 'Supplements',
    stock: 70,
    min_quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    weight: 120,
    bag_size: '120 softgels',
    number_of_servings: 120,
    serving_size: '1 softgel',
    ingredients: 'Fish Oil, EPA, DHA',
    nutritional_info: [
      { name: "Calories", perServing: "10", per100g: "833" },
      { name: "EPA", perServing: "180mg", per100g: "15000mg" },
      { name: "DHA", perServing: "120mg", per100g: "10000mg" }
    ],
    amino_acid_profile: []
  }
];

// Mock function to fetch all products
export const getProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(productsList);
    }, 500);
  });
};

// Mock function to fetch a single product by ID
export const getProductById = async (id: string): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = productsList.find(product => product.id === id);
      resolve(product);
    }, 500);
  });
};

// Mock function to create a new product
export const createProduct = async (product: Product): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      productsList.push(product);
      resolve(product);
    }, 500);
  });
};

// Mock function to update a product
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      productsList = productsList.map(product => {
        if (product.id === id) {
          return { ...product, ...updates };
        }
        return product;
      });
      const updatedProduct = productsList.find(product => product.id === id);
      resolve(updatedProduct);
    }, 500);
  });
};

// Mock function to delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      productsList = productsList.filter(product => product.id !== id);
      resolve();
    }, 500);
  });
};

// Mock data for orders
let ordersList: Order[] = [
  {
    id: '101',
    userId: 'user1',
    userName: 'John Doe',
    email: 'john.doe@example.com',
    items: [
      { product: productsList[0], quantity: 2 },
      { product: productsList[1], quantity: 1 }
    ],
    total: 190.00,
    status: 'processing',
    createdAt: '2024-07-01T10:00:00.000Z',
    paymentMethod: 'credit-card',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '91234',
      country: 'USA',
      phone: '555-123-4567'
    },
    notes: 'Please deliver between 9am and 5pm.',
    invoiceUrl: 'https://example.com/invoice/101.pdf',
    updatedAt: '2024-07-01T10:00:00.000Z'
  },
  {
    id: '102',
    userId: 'user2',
    userName: 'Jane Smith',
    email: 'jane.smith@example.com',
    items: [
      { product: productsList[2], quantity: 3 },
      { product: productsList[3], quantity: 2 }
    ],
    total: 220.00,
    status: 'shipped',
    createdAt: '2024-07-05T14:30:00.000Z',
    paymentMethod: 'paypal',
    shippingAddress: {
      name: 'Jane Smith',
      street: '456 Elm St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      country: 'USA',
      phone: '555-987-6543'
    },
    notes: 'Leave package at the front door.',
    invoiceUrl: 'https://example.com/invoice/102.pdf',
    updatedAt: '2024-07-05T14:30:00.000Z'
  },
  {
    id: '103',
    userId: 'user1',
    userName: 'John Doe',
    email: 'john.doe@example.com',
    items: [
      { product: productsList[4], quantity: 1 },
      { product: productsList[5], quantity: 4 }
    ],
    total: 170.00,
    status: 'delivered',
    createdAt: '2024-07-10T09:15:00.000Z',
    paymentMethod: 'bank-transfer',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '91234',
      country: 'USA',
      phone: '555-123-4567'
    },
    notes: 'Call before delivery.',
    updatedAt: '2024-07-10T19:45:00.000Z'
  },
  {
    id: '104',
    userId: 'user3',
    userName: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    items: [
      { product: productsList[6], quantity: 2 },
      { product: productsList[7], quantity: 1 }
    ],
    total: 210.00,
    status: 'pending',
    createdAt: '2024-07-15T16:45:00.000Z',
    paymentMethod: 'credit-card',
    shippingAddress: {
      name: 'Alice Johnson',
      street: '789 Oak St',
      city: 'Sometown',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '555-456-7890'
    },
    notes: 'Deliver to the back entrance.',
    updatedAt: '2024-07-15T16:45:00.000Z'
  },
  {
    id: '105',
    userId: 'user2',
    userName: 'Jane Smith',
    email: 'jane.smith@example.com',
    items: [
      { product: productsList[8], quantity: 3 },
      { product: productsList[9], quantity: 2 }
    ],
    total: 200.00,
    status: 'cancelled',
    createdAt: '2024-07-20T11:00:00.000Z',
    paymentMethod: 'paypal',
    shippingAddress: {
      name: 'Jane Smith',
      street: '456 Elm St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      country: 'USA',
      phone: '555-987-6543'
    },
    notes: 'Cancelled by customer.',
    updatedAt: '2024-07-20T13:30:00.000Z'
  }
];

// Mock function to fetch all orders
export const getOrders = async (): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ordersList);
    }, 500);
  });
};

// Add a new function to fetch orders by user ID
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userOrders = ordersList.filter(order => order.userId === userId);
      resolve(userOrders);
    }, 500);
  });
};

// Mock function to fetch a single order by ID
export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = ordersList.find(order => order.id === orderId);
      resolve(order);
    }, 500);
  });
};

// Mock function to update order status
export const updateOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      ordersList = ordersList.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      resolve();
    }, 500);
  });
};

// Add this function to delete an order
export const deleteOrder = async (orderId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      ordersList = ordersList.filter(order => order.id !== orderId);
      resolve();
    }, 500);
  });
};
