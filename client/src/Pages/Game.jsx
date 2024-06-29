import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { logo } from '../assets';
import { Input } from '../components';
import { setAlertMessage, setUserBalance } from '../store/slice';
import axios from 'axios'
import Web3 from 'web3';
import uibtABI from '../utils/unibit.json'
import gameABI from '../utils/game.json'
import '../App.css'
import unibitVideo from '../assets/unibit.mp4';

const unibitTokenAddress = import.meta.env.VITE_UNIBIT_TOKEN_ADDRESS;

const unibitTokenABI = uibtABI;

const gameContractAddress = import.meta.env.VITE_GAME_CONTRACT_ADDRESS;

const gameContractAbi = gameABI;

function Game() {

    const { gameId } = useParams()
    const [choice, setChoice] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false)
    const [amountInWei, setAmountInWei] = useState()
    const [gameResult, setGameResult] = useState('');
    const [betTime, setBetTime] = useState(0)
    const [settingResult, setSettingResult] = useState(false)

    const userBalance = useSelector(state => state.userBalance);
    const loginState = useSelector(state => state.loginState);
    const walletAddress = useSelector(state => state.walletAddress);

    const dispatch = useDispatch();
    const navigate = useNavigate()

    const games = {
        'game1': 1000,
        'game2': 10000,
        'game3': 100000,
    }

    const betAmount = games[gameId]

    const handlePlay = () => {
        if (loginState) {
            if (userBalance > betAmount) {
                handleDeductAmt()
            }
            else {
                dispatch(setAlertMessage({ message: 'Insufficient balance to play the bet', type: 'alert' }))
                setTimeout(() => dispatch(setAlertMessage({})), 1000)
            }
        } else {
            dispatch(setAlertMessage({ message: 'Kindly Connect Wallet First', type: 'alert' }))
            setTimeout(() => dispatch(setAlertMessage({})), 1000)
        }
    }

    const handleDeductAmt = async () => {
        if (!window.ethereum) {
            dispatch(setAlertMessage({ message: 'Please install MetaMask!', type: 'alert' }))
            setTimeout(() => dispatch(setAlertMessage({})), 1000)
            return;
        }

        setIsDepositing(true)
        setChoice(null);
        setGameResult(null);
        setShowModal(false);
        try {
            const web3 = new Web3(window.ethereum);

            const gameContract = new web3.eth.Contract(gameContractAbi, gameContractAddress);
            const unibitToken = new web3.eth.Contract(unibitTokenABI, unibitTokenAddress);

            const amountInWei = web3.utils.toWei(betAmount.toString(), 'ether');
            setAmountInWei(amountInWei)

            const approveTx = await unibitToken.methods.approve(gameContractAddress, amountInWei).send({ from: walletAddress });

            const depositTx = await gameContract.methods.deposit(amountInWei).send({ from: walletAddress });

            const result = await axios.get(`${import.meta.env.VITE_SERVER_URL}/result`)

            sessionStorage.setItem('result', result.data)

            dispatch(setUserBalance(userBalance - betAmount))
            setBetTime(10)
            setShowModal(true)

        } catch (error) {
            dispatch(setAlertMessage({ message: 'Transaction Failed', type: 'alert' }))
            setTimeout(() => dispatch(setAlertMessage({})), 1200);

        } finally {
            setIsDepositing(false)
        }
    }

    const handleChoice = async (e) => {
        try {
            let newChoice = e.target.innerText.toLowerCase()
            setChoice(newChoice)
            e.target.classList.add('active')
            document.querySelector('.bet-btns').childNodes.forEach(btn => btn.disabled = true)

            let newResult = sessionStorage.getItem('result')
            setTimeout(() => handleGameResult(newResult), betTime * 1000)

            if (newResult === newChoice) {
                const distributeRes = await axios.post(`${import.meta.env.VITE_SERVER_URL}/distribute`, {
                    walletAddress,
                    amount: amountInWei
                })

                setTimeout(() => {
                    dispatch(setAlertMessage({ message: 'Amount Transferred to your account', type: 'success' }));
                    setTimeout(() => dispatch(setAlertMessage({})), 2000);

                    dispatch(setUserBalance(userBalance+betAmount*2));
                }, betTime * 1000)
            }
        }
        catch (err) {
            console.log(err)
        }
    };

    const handleGameResult = (choice) => {
        setGameResult(choice)
        document.querySelector('.bet-screen')?.addEventListener('click', (e) => {
            if (!document.querySelector('.bet-modal').contains(e.target)) {
                document.querySelector('.bet-btns')?.childNodes.forEach(btn => btn.disabled = false)
                document.querySelector('.bet-btn.active')?.classList.remove('active')
                setChoice(null)
                setGameResult(null)
                setShowModal(false)
            }
        })
    }

    useEffect(() => {
        let betTimeIntervalId;

        if (betTime > 0) {
            betTimeIntervalId = setInterval(() => {
                setBetTime(prevTime => {
                    if (prevTime > 1) {
                        return prevTime - 1;
                    } else {
                        clearInterval(betTimeIntervalId);
                        if (choice === null) {
                            handleGameResult('lost')
                        }
                        return 0;
                    }
                });
            }, 1000);
        }

        return () => {
            clearInterval(betTimeIntervalId);
        };
    }, [betTime]);

    return (
        <div>
            <div className='flex flex-col gap-8 pt-32 h-screen overflow-y-auto'>
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 w-[95%] md:w-[80%] mx-auto lg:h-[80vh] 2xl:h-[75vh] ">

                    <div className={`flex flex-col items-center gap-6 lg:py-12 `}>
                        <div className="w-64">
                            <img src={logo} className='w-full h-full object-contain' alt="Card Logo" />
                        </div>
                        <p className='text-xl font-medium'>Amount : {betAmount} $UIBT</p>
                        <div className={` w-full text-center flex justify-center items-center gap-3`}>
                            <button className='btn btn1' onClick={handlePlay} disabled={isDepositing}>BET</button>
                        </div>

                    </div>
                </div>

                <div className={`bet-screen bg-[#00000067] ${showModal ? 'flex' : 'hidden'} justify-center items-center z-[49] w-screen h-screen fixed top-0 left-0`}>
                    <div className="bet-modal relative border backdrop-blur-sm border-slate-400/25 w-[95%] sm:w-[30rem] h-96 rounded-lg flex flex-col items-center gap-4 justify-center">
                        <div className="flex items-center gap-2">
                            <h1 className='text-xl md:text-3xl font-semibold'>Choose Heads or Tails</h1>
                            <div className={`${betTime ? 'block' : 'hidden'} border-2 border-[#00ACE6] text-lg font-medium py-1 px-2 rounded-[50%] w-10 h-10 text-center`}>{betTime}</div>
                        </div>
                        <div>
                            <video width="300" autoPlay loop>
                                <source src={unibitVideo} type="video/mp4" /> </video>
                            <div className={`side heads-img ${gameResult === 'heads' ? 'show' : ''}`}></div>
                            <div className={`side tails-img ${gameResult === 'tails' ? 'show' : ''}`}></div>
                        </div>
                        {
                            !gameResult &&
                            <div className="flex gap-2 bet-btns">
                                <button className={`btn btn1 bet-btn `} onClick={handleChoice}>Heads</button>
                                <button className={`btn btn1 bet-btn `} onClick={handleChoice}>Tails</button>
                            </div>
                        }
                        {
                            gameResult && !settingResult &&
                            <div className="h-8">
                                {
                                    gameResult === choice &&
                                    <p className='text-xl md:text-2xl font-semibold'>{`Congrats! You won ${betAmount} $UIBT`}</p>
                                }
                                {
                                    gameResult !== choice &&
                                    <p className='text-xl md:text-2xl font-semibold'>Oops! You got rugged {betAmount} $UIBT</p>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Game
