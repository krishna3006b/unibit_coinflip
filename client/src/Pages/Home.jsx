import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PlayerCard } from '../components'
import { coinLogo } from '../assets'
import { Navigate, useNavigate } from 'react-router-dom'


function Home() {

  const [showModal, setShowModal] = useState({})
  const [id, setId] = useState(null)

  const navigate = useNavigate()

  useEffect(()=>{
    document.querySelector('.room-screen').addEventListener('click',(e)=>{
      if(!document.querySelector('.room-modal').contains(e.target)){
        setShowModal({});
      }
    })
  },[showModal])

  return (
    <div className='flex flex-col gap-8 pt-32 pb-16 h-screen overflow-y-auto'>
      <div className="flex flex-col gap-8 w-[95%] md:w-[80%] mx-auto">

        <div className="flex flex-col gap-4">
          <h1 className='text-3xl md:text-6xl text-center font-bold'>Wanna Bet & Earn?</h1>
          <h3 className='text-2xl md:text-4xl text-center font-bold'>Join the rooms below</h3>
        </div>

        <h6 className='text-lg font-bold' >Available Rooms</h6>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-2 place-items-center">
          <PlayerCard amount={1000} img={coinLogo} setShowModal={setShowModal} gameId={'game1'} roomId={'room1'} />
          <PlayerCard amount={10000} img={coinLogo} setShowModal={setShowModal} gameId={'game2'} roomId={'room2'} />
          <PlayerCard amount={100000} img={coinLogo} setShowModal={setShowModal} gameId={'game3'} roomId={'room3'} />
        </div>

        <div className={`room-screen bg-[#00000067] ${showModal.gameId ? 'flex' : 'hidden'} justify-center items-center z-[49] w-screen h-screen fixed top-0 left-0`}>
          <div className="room-modal relative border backdrop-blur-sm border-slate-400/25 w-[95%] sm:w-[30rem] h-26 py-4 rounded-lg flex flex-col items-center gap-2 justify-center">
           
            <p onClick={() => setShowModal({})} className="w-full text-right  cursor-pointer top-1 right-4 px-4 text-[#00ACE6] text-3xl font-bold">&times;</p>
            {
              <div className="flex gap-2 bet-btns">
                <button className={`btn btn1 `} onClick={() => navigate(`game/${showModal.gameId}`)}>Single Player</button>
                <button className={`btn btn1 `} onClick={() => navigate(`room/${showModal.roomId}`)}>Multi Players</button>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  )
}

export default Home
