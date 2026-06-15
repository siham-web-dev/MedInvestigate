import { RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { router } from './routes';
import AppInitializer from './AppInitializer';

export default function App() {
  return (
    <Provider store={store}>
      <AppInitializer>
        <RouterProvider router={router} />
      </AppInitializer>
    </Provider>
  );
}
