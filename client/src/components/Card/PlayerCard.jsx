import React from 'react'
import { Link } from 'react-router-dom'

function PlayerCard({ amount, img, setShowModal, roomId, gameId }) {

  return (
    <div onClick={() => setShowModal({ roomId, gameId })} className='cursor-pointer w-full h-full flex flex-col gap-3 items-center justify-center bg-[#5f5f5f18] p-4 rounded-xl'>
      <div className="w-[8rem] h-[8rem]">
        <img src={img} className='w-full h-full object-contain' alt="Card Image" />
      </div>
      <p className=''>Play bet for {amount} $UIBT</p>
    </div>
  )
}

export default PlayerCard
