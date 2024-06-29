import React, { useEffect, useState } from 'react'
import './App.css'
import { Navbar } from './components'
import { Outlet } from 'react-router-dom'
import Alert from './components/Alert/Alert'
import { useSelector } from 'react-redux'

function App() {

  const alertMessage = useSelector(state => state.alertMessage);

  return (
    <>
      <div className="overflow-hidden">
        <Navbar />
        {
          alertMessage?.message &&
          <Alert message={alertMessage?.message} type={alertMessage?.type} />
        }
        <div className="screen hidden z-30 w-screen h-screen fixed top-0 left-0">
        </div>
        <Outlet />
      </div>
    </>
  )
}

export default App
