import { useState } from 'react';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import VentasExpress from './views/VentasExpress';
import SemaforoRotacion from './views/SemaforoRotacion';
import SugerenciaPedidos from './views/SugerenciaPedidos';

function App() {
  const [currentView, setCurrentView] = useState<'ventas' | 'semáforo' | 'pedidos'>('ventas');

  const renderView = () => {
    switch (currentView) {
      case 'ventas':
        return <VentasExpress />;
      case 'semáforo':
        return <SemaforoRotacion />;
      case 'pedidos':
        return <SugerenciaPedidos />;
      default:
        return <VentasExpress />;
    }
  };

  return (
    <Layout>
      {renderView()}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
    </Layout>
  );
}

export default App;
