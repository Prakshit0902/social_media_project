import('react-devtools-core').then(mod =>
  mod.connectToDevTools({ host: '192.168.252.186', port: 8097 })
)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { store } from "./store/store";
import { Provider } from "react-redux";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
) 
