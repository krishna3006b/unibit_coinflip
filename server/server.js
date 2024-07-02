require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { Web3 } = require('web3');
const PoolContractABI = require('./PoolContractABI.json');
const gameContractABI = require('./GameContractABI.json');
const tls = require('tls');
tls.TLSSocket.prototype.setMaxListeners(20);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
const contractAddress = process.env.CONTRACT_ADDRESS;
const gameContractAddress = process.env.GAME_CONTRACT_ADDRESS;
const poolContract = new web3.eth.Contract(PoolContractABI, contractAddress);
const gameContract = new web3.eth.Contract(gameContractABI, gameContractAddress);

const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;
const ownerAddress = process.env.OWNER_ADDRESS;

const MAX_PLAYERS = 30;
const MIN_PLAYERS_TO_START = 5;
const START_GAME_DELAY = 10000;

const rooms = {
  'room1': { players: [], readyPlayers: [], playerChoices: {}, playerWallets: {}, betAmount: 1000, startGameTimer: null, result: Math.random() < 0.5 ? 'heads' : 'tails', roomId: 891871063280, roomRunning:false },
  'room2': { players: [], readyPlayers: [], playerChoices: {}, playerWallets: {}, betAmount: 10000, startGameTimer: null, result: Math.random() < 0.5 ? 'heads' : 'tails', roomId: 278171202432, roomRunning:false },
  'room3': { players: [], readyPlayers: [], playerChoices: {}, playerWallets: {}, betAmount: 100000, startGameTimer: null, result: Math.random() < 0.5 ? 'heads' : 'tails', roomId: 697236497826, roomRunning:false },
};

app.use(cors())
  .use(express.json())

const getRoom = (roomName) => rooms[roomName];

const startGame = (roomName) => {
  const room = getRoom(roomName);
  
  if (room.startGameTimer) {
    clearTimeout(room.startGameTimer);
    room.startGameTimer = null;
  }
  
  room.players.forEach(player => {
    if (!room.readyPlayers.includes(player.id)) {
      io.to(player.id).emit('removePlayer');
    }
  });
  
  if (room.readyPlayers.length >= MIN_PLAYERS_TO_START) {
    room.players.forEach(player => {
      const betChoice = Math.random() < 0.5 ? 'heads' : 'tails';
      room.playerChoices[player.id] = betChoice;
    });
    
    room.readyPlayers = room.players.filter(player => room.readyPlayers.includes(player.id));
    
    io.to(roomName).emit('playerList', room.players);
    room.readyPlayers.forEach(player => {
      io.to(player.id).emit('startCoinFlip');
    });
    
    room.playerChoices = {};
    room.playerWallets = {};
  } else {
    room.readyPlayers = [];
    room.playerChoices = {};
    room.playerWallets = {};
    room.roomRunning = false;
  }
};

const decideWon = async (roomId, walletAddress, betAmount) => {
  try {
    const createRoomData = poolContract.methods.decideWon(roomId, walletAddress).encodeABI();

    const gasEstimate = await web3.eth.estimateGas({ from: ownerAddress, to: contractAddress, data: createRoomData });

    const gasPrice = await web3.eth.getGasPrice();

    const tx = {
      from: ownerAddress,
      to: contractAddress,
      gas: gasEstimate,
      gasPrice: gasPrice,
      data: createRoomData,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, ownerPrivateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return receipt;
  } catch (error) {
    refund(roomId, walletAddress, betAmount)
    console.log('Error in deciding Winner')
    return 'Error in deciding Winner'
  }
};

const distributePool = async (roomId, walletAddress, betAmount) => {
  try {
    const createRoomData = poolContract.methods.distributePool(roomId).encodeABI();

    const gasEstimate = await web3.eth.estimateGas({ from: ownerAddress, to: contractAddress, data: createRoomData });

    const gasPrice = await web3.eth.getGasPrice();

    const tx = {
      from: ownerAddress,
      to: contractAddress,
      gas: gasEstimate,
      gasPrice: gasPrice,
      data: createRoomData,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, ownerPrivateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return receipt;
  } catch (error) {
    refund(roomId, walletAddress, betAmount)
    console.log('Error in deciding Winner')
    return 'Error in distributing Pool'
  }
};

const refund = async (roomId, walletAddress, betAmount) => {
  try {
    const createRoomData = poolContract.methods.refund(roomId, walletAddress, betAmount).encodeABI();
    const gasEstimate = await web3.eth.estimateGas({ from: ownerAddress, to: contractAddress, data: createRoomData });
    const gasPrice = await web3.eth.getGasPrice();

    const tx = {
      from: ownerAddress,
      to: contractAddress,
      gas: gasEstimate,
      gasPrice: gasPrice,
      data: createRoomData,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, ownerPrivateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return receipt;

  } catch (error) {
    return 'Error in refunding pool';
  }
};

const transferPool = async (walletAddress, amount) => {
  try {
    const createRoomData = gameContract.methods.transferPool(walletAddress, amount).encodeABI();
    const gasEstimate = await web3.eth.estimateGas({ from: ownerAddress, to: gameContractAddress, data: createRoomData });
    const gasPrice = await web3.eth.getGasPrice();

    const tx = {
      from: ownerAddress,
      to: gameContractAddress,
      gas: gasEstimate,
      gasPrice: gasPrice,
      data: createRoomData,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, ownerPrivateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    const formattedReceipt = JSON.parse(JSON.stringify(receipt, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return 'Pool resolved';
  } catch (error) {
    return 'Error in resolving pool';
  }
};

app.get('/result', async (req, res) => {
  try {
    res.status(200).send( Math.random() > 0.5 ? 'heads' : 'tails' );
  } catch (err) {
    res.status(500).json({ success: false, response: 'Error in deciding result', err: err.message });
  }
});

app.post('/distribute', async (req, res) => {
  try {
    const { walletAddress, amount } = req.body;

    const newAmount = (BigInt(amount*2)).toString();
    const response = await transferPool(walletAddress, newAmount);
    
    res.status(200).json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, response: 'Error in refunding', err: err.message });
  }
});

io.on('connection', (socket) => {

  io.to(socket.id).emit('joinedRoom', true);

  socket.on('enterRoom', ({ roomName }) => {
    const room = getRoom(roomName);
    io.to(roomName).emit('playerList', room.players);
    io.to(roomName).emit('readyPlayers', room.readyPlayers);
  });

  socket.on('joinRoom', async ({ roomName, username }) => {

    const room = getRoom(roomName);
    if (room.players.length >= MAX_PLAYERS) {
      socket.emit('roomFull');
      return;
    }

    room.players.push({ id: socket.id, name: username });
    socket.join(roomName);
    console.log(room.roomRunning);
    io.to(socket.id).emit('roomRunning',room.roomRunning);
    io.to(roomName).emit('playerList', room.players);
    io.to(roomName).emit('readyPlayers', room.readyPlayers);
    io.to(socket.id).emit('joinedRoom', true);

    io.to(roomName).emit('roomIdGenerated', { roomId: room.roomId, result: room.result });

    socket.on('setReady', () => {
      const room = getRoom(roomName);
      if (!room.readyPlayers.includes(socket.id)) {
        room.readyPlayers.push(socket.id);
      } else {
        room.readyPlayers = room.readyPlayers.filter(id => id !== socket.id);
      }

      io.to(roomName).emit('readyPlayers', room.readyPlayers);

      if (room.readyPlayers.length === MAX_PLAYERS) {
        clearTimeout(room.startGameTimer);
        room.roomRunning = true;
        startGame(roomName);
      }

      if (room.readyPlayers.length >= MIN_PLAYERS_TO_START && !room.startGameTimer) {
        io.to(roomName).emit('startGameTimer', START_GAME_DELAY / 1000);
        room.roomRunning = true;
        room.startGameTimer = setTimeout(() => {
          startGame(roomName);
        }, START_GAME_DELAY);
      }

      if (room.readyPlayers.length < MIN_PLAYERS_TO_START && room.startGameTimer) {
        io.to(roomName).emit('startGameTimer', 0);
        clearTimeout(room.startGameTimer);
        room.startGameTimer = null;
        room.roomRunning = false;
      }
    });

    socket.on('chooseSide', async ({ choice, walletAddress }) => {
      const room = getRoom(roomName);
      room.playerWallets[socket.id] = walletAddress;
      room.playerChoices[socket.id] = choice;

      if (Object.keys(room.playerChoices).length === room.readyPlayers.length) {
        const winners = [];
        const losers = [];

        for (let playerId in room.playerChoices) {
          if (room.playerChoices[playerId] === room.result) {
            winners.push(room.playerWallets[playerId]);
          } else {
            losers.push(room.playerWallets[playerId]);
          }
        }

        const winnings = winners.length > 0 ? (room.betAmount * room.readyPlayers.length / winners.length) - room.betAmount : 0;
        const losses = room.betAmount;

        io.to(roomName).emit('playerList', room.players.map(player => ({
          id: player.id,
          name: player.name,
          betChoice: room.playerChoices[player.id] || null
        })));

        io.to(roomName).emit('gameResult', { result: room.result, winners, losers, winnings, losses });

        if (winners.length === 0) {
          const decideResponse = await decideWon(room.roomId, ownerAddress, room.betAmount);
        }
        else {
          for (let winner in winners) {
            const decideResponse = await decideWon(room.roomId, winners[winner], room.betAmount);
          }
        }

        const distributeResponse = await distributePool(room.roomId, walletAddress, room.betAmount);

        room.readyPlayers = [];
        room.playerChoices = {};
        room.playerWallets = {};
        room.roomRunning = false;
      }
    });

    socket.on('resetGame', ({ roomName }) => {
      const room = getRoom(roomName)
      room.result = Math.random() < 0.5 ? 'heads' : 'tails';
    })

    socket.on('disconnect', () => {
      const room = getRoom(roomName);
      room.players = room.players.filter(player => player.id !== socket.id);
      room.readyPlayers = room.readyPlayers.filter(id => id !== socket.id);
      delete room.playerChoices[socket.id];

      if (room.players.length === 0) {
        room.readyPlayers = [];
        room.playerChoices = {};
        room.playerWallets = {};
        room.roomRunning = false;
      }

      io.to(roomName).emit('playerList', room.players);
      io.to(roomName).emit('readyPlayers', room.readyPlayers);
    });

    socket.on('leaveRoom', async ({ roomName, roomId, walletAddress, betAmount, depositedAmount }) => {
      const room = getRoom(roomName);
      room.players = room.players.filter(player => player.id !== socket.id);
      room.readyPlayers = room.readyPlayers.filter(id => id !== socket.id);
      delete room.playerChoices[socket.id];
      delete room.playerWallets[socket.id];

      if (depositedAmount) {
        refund(roomId, walletAddress, betAmount)
      }

      if (room.players.length === 0) {
        room.readyPlayers = [];
        room.playerChoices = {};
        room.playerWallets = {};
        room.roomRunning = false;
      }

      io.to(roomName).emit('playerList', room.players);
      io.to(roomName).emit('readyPlayers', room.readyPlayers);
      io.to(roomName).emit('startGameTimer', 0);
      if (room.readyPlayers.length < MIN_PLAYERS_TO_START && room.startGameTimer) {
        clearTimeout(room.startGameTimer);
        room.startGameTimer = null;
      }
    });
  });
});

const PORT = process.env.PORT

server.listen(PORT, () => {
  console.log('Server is running on port 3000');
});
