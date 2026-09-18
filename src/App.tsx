import React from 'react';
import { AuthProvider } from './lib/auth';
import { CartProvider } from './lib/cart';
import { RouterProvider, useRouter } from './lib/router';
import { Background } from './components/layout/Background';

// General Pages
import { LandingPage } from './pages/LandingPage';
import { ChooseUserPage } from './pages/ChooseUserPage';

// Farmer Pages
import { FarmerLoginPage } from './pages/farmer/FarmerLoginPage';
import { FarmerRegisterPage } from './pages/farmer/FarmerRegisterPage';
import { FarmerDashboardPage } from './pages/farmer/FarmerDashboardPage';
import { FarmCropSetupPage } from './pages/farmer/FarmCropSetupPage';
import { CropHealthPage } from './pages/farmer/CropHealthPage';
import { CropHealthResultPage } from './pages/farmer/CropHealthResultPage';
import { WeatherAdvisoryPage } from './pages/farmer/WeatherAdvisoryPage';
import { TodaysInstructionsPage } from './pages/farmer/TodaysInstructionsPage';
import { TimetablePage } from './pages/farmer/TimetablePage';
import { MarketPricePage } from './pages/farmer/MarketPricePage';
import { ListCropPage } from './pages/farmer/ListCropPage';

// Customer Pages
import { CustomerLoginPage } from './pages/customer/CustomerLoginPage';
import { CustomerRegisterPage } from './pages/customer/CustomerRegisterPage';
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { BrowseCropsPage } from './pages/customer/BrowseCropsPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { FeedbackPage } from './pages/customer/FeedbackPage';

const AppRouter: React.FC = () => {
  const { path } = useRouter();

  // Root & Choose User
  if (path === '/' || path === '') {
    return <LandingPage />;
  }
  if (path === '/choose-user') {
    return <ChooseUserPage />;
  }

  // Farmer Authentication
  if (path === '/farmer/login') {
    return <FarmerLoginPage />;
  }
  if (path === '/farmer/register') {
    return <FarmerRegisterPage />;
  }

  // Farmer Protected Routes
  if (path === '/farmer/dashboard') {
    return <FarmerDashboardPage />;
  }
  if (path === '/farmer/farm-crop-setup') {
    return <FarmCropSetupPage />;
  }
  if (path === '/farmer/crop-health') {
    return <CropHealthPage />;
  }
  if (path === '/farmer/crop-health/result') {
    return <CropHealthResultPage />;
  }
  if (path === '/farmer/weather-advisory') {
    return <WeatherAdvisoryPage />;
  }
  if (path === '/farmer/todays-instructions') {
    return <TodaysInstructionsPage />;
  }
  if (path === '/farmer/timetable') {
    return <TimetablePage />;
  }
  if (path === '/farmer/market-price') {
    return <MarketPricePage />;
  }
  if (path === '/farmer/list-crop') {
    return <ListCropPage />;
  }

  // Customer Authentication
  if (path === '/customer/login') {
    return <CustomerLoginPage />;
  }
  if (path === '/customer/register') {
    return <CustomerRegisterPage />;
  }

  // Customer Protected Routes
  if (path === '/customer/dashboard') {
    return <CustomerDashboardPage />;
  }
  if (path === '/customer/browse-crops') {
    return <BrowseCropsPage />;
  }
  if (path.startsWith('/customer/product/')) {
    return <ProductDetailPage />;
  }
  if (path === '/customer/cart') {
    return <CartPage />;
  }
  if (path === '/customer/checkout') {
    return <CheckoutPage />;
  }
  if (path === '/customer/order-tracking') {
    return <OrderTrackingPage />;
  }
  if (path === '/customer/feedback') {
    return <FeedbackPage />;
  }

  // Fallback
  return <LandingPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider>
          <Background>
            <AppRouter />
          </Background>
        </RouterProvider>
      </CartProvider>
    </AuthProvider>
  );
}
