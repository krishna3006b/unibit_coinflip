import React from 'react'
import { useDispatch } from 'react-redux'
import { alert, success } from '../../assets'
import { setAlertMessage } from '../../store/slice'

function Alert({ message, type }) {

    const dispatch = useDispatch()

    return (
        <div className={`w-[19rem] z-50 md:w-[40%] lg:w-[30%] flex fex-col items-center justify-center bg-[#151515] h-48 border-2 ${type === 'success' ? 'border-green-600' : 'border-red-600'} px-2 py-2 text-center rounded-lg fixed mx-auto top-[50vh] left-[50%] translate-x-[-50%] translate-y-[-50%] transition-all duration-300 ease-in`}>
            <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24">
                    {
                        type === 'success' ?
                            (<img src={success} className='w-ful h-full object-cover' alt="" />) : (<img src={alert} className='w-ful h-full object-cover' alt="" />)
                    }
                </div>
                <p className='text-lg'>{message}&nbsp;</p>
                <p className={`absolute right-[4%] top-[2px] md:top-2 text-2xl ${type === 'success' ? 'text-green-600' : 'text-red-600'} cursor-pointer`} onClick={() => dispatch(setAlertMessage({}))}>&times;</p>
            </div>
        </div>
    )
}

export default Alert
