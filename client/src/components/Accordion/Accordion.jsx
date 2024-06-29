import React from 'react'
import { icon } from '../../assets'
import '../../App.css'

function Accordion({ques,ans,handleClick,id}) {
  return (
    <div className='accordion overflow-hidden transition-all duration-300 ease-in' id={id}>
      <div onClick={()=>handleClick(id)} className="flex items-center justify-between border-b border-b-[#c4c0c8] py-4 cursor-pointer">
        <p className='text-xl font-semibold' >{ques}</p>
        <img src={icon} className='w-3 h-3 rotate-0' alt="" />
      </div>
      <p className='py-4 text-[0.8rem] xl:text-sm'>{ans}</p>
    </div>
  )
}

export default Accordion