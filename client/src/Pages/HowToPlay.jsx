import React from 'react'
import { Accordion } from '../components'

function HowToPlay() {

    const handleClick = (id) => {

        if (document.querySelector(`#${id}`).classList.contains('active'))
            document.querySelector(`#${id}`).classList.remove('active')

        else {

            document.querySelectorAll('.accordion.active').forEach(acc => {
                acc.classList.remove('active')
            })

            document.querySelector(`#${id}`).classList.add('active')
        }
    }

    return (
        <div className='pt-32 h-screen overflow-y-auto'>

            <div className="flex flex-col gap-12 w-full px-[2rem] md:px-[5rem] xl:px-[11rem] ">

                <div className="w-full border-b border-b-[#c4c0c8] py-6">
                    <p className='uppercase text-[40px] font-semibold text-left py-3'>frequently asked questions</p>
                </div>

                <div className="flex flex-col gap-3 transition-all ease-in duration-300">
                    <Accordion handleClick={handleClick} id='ques1' ques="1. What is UIBT Coin Flip?" ans="UIBT Coin Flip is a smart contract that allows users to play single player or multi player game for Double or Nothing with their UIBT tokens with a 0% fee." />
                    <Accordion handleClick={handleClick} id='ques2' ques="2. How does the game work?" ans="Players can join a game room, place bets using UIBT tokens, and compete against other players. The game outcomes determine the distribution of winnings based on the bets placed." />
                    <Accordion handleClick={handleClick} id='ques3' ques="3. How do I join a game?" ans="To join a game, create an account, log in, and navigate to the game lobby. From there, you can join an existing room or create a new one." />
                    <Accordion handleClick={handleClick} id='ques4' ques="4. How do I place a bet?" ans="Once you join a room, you can place a bet by selecting your bet choice and entering the amount of UIBT tokens you want to wager. Confirm your bet to finalize it." />
                    <Accordion handleClick={handleClick} id='ques5' ques="5. Is my data secure?" ans="Yes, we use industry-standard security measures to protect your data and transactions. Your information is encrypted and stored securely on our servers." />
                </div>

            </div>
        </div>
    )
}

export default HowToPlay
