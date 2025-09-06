# Flower E-commerce Frontend

A modern, responsive React frontend for a flower-selling e-commerce platform with separate admin and client interfaces.

## 🚀 Features

### Client Interface
- **Product Browsing**: Beautiful product grid with filtering and search
- **Product Details**: Detailed product pages with image galleries
- **Shopping Cart**: Add, update, and manage cart items
- **Checkout Process**: Secure checkout with form validation
- **User Authentication**: Login/register with JWT tokens
- **Order History**: View past orders and their status
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Toggle between light and dark themes

### Admin Interface
- **Dashboard**: Overview of sales, orders, and analytics
- **Product Management**: CRUD operations for products and categories
- **Order Management**: View and update order statuses
- **Customer Management**: View and manage user accounts
- **Analytics**: Sales reports and performance metrics
- **Responsive Sidebar**: Collapsible navigation for mobile

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom design system
- **React Router** for client-side routing
- **Zustand** for state management
- **React Hook Form** with Zod validation
- **Axios** for API communication
- **Lucide React** for icons
- **React Hot Toast** for notifications

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Card, Modal, etc.)
│   │   ├── layout/         # Layout components (Header, Footer, Sidebar)
│   │   ├── products/       # Product-related components
│   │   └── checkout/       # Checkout-related components
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   └── ...             # Client pages
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   ├── lib/                # Utility functions and API client
│   ├── types/              # TypeScript type definitions
│   ├── schemas/            # Zod validation schemas
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles and Tailwind imports
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on port 3000

### Installation

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3001`

### Building for Production

```bash
npm run build
npm run preview
```

## 🎨 Design System

### Colors
- **Primary**: Blue tones (#0ea5e9 to #0c4a6e)
- **Secondary**: Purple tones (#d946ef to #701a75)
- **Accent**: Yellow tones (#fefce8 to #713f12)
- **Neutral**: Gray scale with dark mode support

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost, destructive)
- **Cards**: Consistent shadow and border styling
- **Forms**: Validated inputs with error states
- **Modals**: Accessible overlay dialogs
- **Data Tables**: Sortable and paginated tables

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=FlowerShop
```

### API Integration
The app connects to the backend API through:
- **Base URL**: `/api` (proxied to `http://localhost:3000`)
- **Authentication**: JWT tokens stored in localStorage
- **Error Handling**: Automatic token refresh and logout on 401

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
- **Touch Friendly**: Large tap targets and gestures
- **Performance**: Optimized images and lazy loading

## 🌙 Dark Mode

- **System Preference**: Automatically detects user preference
- **Manual Toggle**: Theme switcher in header
- **Persistent**: Theme choice saved in localStorage
- **Consistent**: All components support both themes

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Key Components

### ProductCard
```tsx
<ProductCard
  product={product}
  onAddToCart={handleAddToCart}
  onAddToWishlist={handleAddToWishlist}
/>
```

### CheckoutForm
```tsx
<CheckoutForm
  onSubmit={handleCheckout}
  loading={isProcessing}
/>
```

### DataTable
```tsx
<DataTable
  data={products}
  columns={columns}
  pagination={paginationInfo}
  onPageChange={handlePageChange}
  onSort={handleSort}
/>
```

## 🔐 Authentication Flow

1. **Login**: User enters credentials
2. **Token Storage**: JWT stored in localStorage
3. **API Requests**: Token included in Authorization header
4. **Token Refresh**: Automatic refresh before expiration
5. **Logout**: Clear tokens and redirect to login

## 🛒 Shopping Cart

- **State Management**: Zustand store with persistence
- **Real-time Updates**: Cart count in header
- **Local Storage**: Cart persists across sessions
- **API Sync**: Syncs with backend on login

## 📊 Admin Features

- **Dashboard**: Key metrics and recent activity
- **Product Management**: Full CRUD with image upload
- **Order Processing**: Status updates and tracking
- **User Management**: Account activation and role changes
- **Analytics**: Sales reports and trends

## 🚀 Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Responsive images with lazy loading
- **Bundle Analysis**: Optimized bundle size
- **Caching**: API response caching
- **PWA Ready**: Service worker support

## 🔧 Development

### Code Style
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Code formatting
- **TypeScript**: Strict mode enabled
- **Import Sorting**: Organized imports

### Git Hooks
```bash
# Pre-commit hooks (when implemented)
npm run lint
npm run type-check
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, email support@flowershop.com or create an issue in the repository.
