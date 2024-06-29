import React from 'react'

function Input({ name, label,value, placeholder, handleChange, type = 'text' }) {
    return (
        <div className='flex flex-col gap-2'>
            {/* <label htmlFor={label} className='capitalize'>{label}</label> */}
            <input id={label} value={value} type={type} className='bg-transparent py-1 px-3 outline-1 outline outline-white rounded-md focus:outline-[#00ACE6]' onChange={handleChange} placeholder={placeholder} name={name} />
        </div>
    )
}

export default Input
