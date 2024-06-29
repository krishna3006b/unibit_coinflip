import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { Game, Home, HowToPlay, Room } from './Pages'
import { Provider } from 'react-redux'
import { store } from './store/store.js'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" element={<Home />} />
      <Route path="/faq" element={<HowToPlay />} />
      <Route path="/room/:roomName" element={<Room />} />
      <Route path="/game/:gameId" element={<Game />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
)
