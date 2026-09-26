import { useEffect, useState } from "react";
import Web3 from "web3";
import Lottery from "./contracts/Lottery.json";
import { CONTRACT_ADDRESS } from "./contractConfig";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [playersCount, setPlayersCount] = useState(0);
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState("");
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask is not installed.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      setStatus("Wallet connected.");
    } catch (error) {
      console.error(error);
      setStatus("Failed to connect wallet.");
    }
  };

  const getContract = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    const web3 = new Web3(window.ethereum);

    const contract = new web3.eth.Contract(
      Lottery.abi,
      CONTRACT_ADDRESS
    );

    return { web3, contract };
  };

  const loadBalance = async () => {
    try {
      const { web3, contract } = await getContract();

      const result = await contract.methods
        .getBalance()
        .call();

      const ethBalance = web3.utils.fromWei(
        result.toString(),
        "ether"
      );

      setBalance(ethBalance);
      setStatus("Lottery balance loaded.");
    } catch (error) {
      console.error(error);
      setStatus("Failed to get lottery balance.");
    }
  };

  const loadPlayers = async () => {
    try {
      const { contract } = await getContract();

      const count = await contract.methods
        .getPlayersCount()
        .call();

      const result = await contract.methods
        .getPlayers()
        .call();

      const addresses = result[0];
      const nicknames = result[1];

      const playerList = addresses.map((address, index) => ({
        address,
        nickname: nicknames[index],
      }));

      setPlayers(playerList);
      setPlayersCount(Number(count));
    } catch (error) {
      console.error(error);
    }
  };

  const joinLottery = async () => {
    try {
      if (!account) {
        await connectWallet();
        return;
      }

      if (!nickname.trim()) {
        setStatus("Please enter a nickname.");
        return;
      }

      const { web3, contract } = await getContract();

      setStatus("Joining lottery...");

      await contract.methods
        .joinLottery(nickname.trim())
        .send({
          from: account,
          value: web3.utils.toWei("0.01", "ether"),
        });

      setStatus("You joined the lottery.");

      setNickname("");

      await loadBalance();
      await loadPlayers();
    } catch (error) {
      console.error(error);
      setStatus(
        error?.message || "Failed to join the lottery."
      );
    }
  };

  const pickWinner = async () => {
    try {
      if (!account) {
        await connectWallet();
        return;
      }

      const { contract } = await getContract();

      setStatus("Picking winner...");

      const result = await contract.methods
        .pickWinner()
        .send({
          from: account,
        });

      const winnerEvent = result.events?.WinnerPicked;

      if (winnerEvent) {
        setWinner(
          winnerEvent.returnValues.nickname ||
          winnerEvent.returnValues[1]
        );
      }

      setStatus("Winner has been selected.");

      await loadBalance();
      await loadPlayers();
    } catch (error) {
      console.error(error);
      setStatus(
        error?.message || "Failed to pick the winner."
      );
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      loadBalance();
      loadPlayers();
    }
  }, []);

  return (
    <div className="app">
      <div className="lottery-card">
        <h1>Lottery</h1>

        <p className="subtitle">
          Ethereum Lottery
        </p>

        <button
          className="connect-button"
          onClick={connectWallet}
        >
          {account ? "Wallet Connected" : "Connect MetaMask"}
        </button>

        {account && (
          <p className="account">
            Account:
            <br />
            {account}
          </p>
        )}

        <div className="info">
          <div className="info-box">
            <span>Lottery Balance</span>
            <strong>{balance} ETH</strong>
          </div>

          <div className="info-box">
            <span>Players</span>
            <strong>{playersCount}</strong>
          </div>
        </div>

        <div className="nickname-section">
          <label htmlFor="nickname">
            Your nickname
          </label>

          <input
            id="nickname"
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(event) =>
              setNickname(event.target.value)
            }
          />
        </div>

        <div className="buttons">
          <button onClick={joinLottery}>
            Join Lottery
          </button>

          <button onClick={loadBalance}>
            Lottery Balance
          </button>

          <button
            className="winner-button"
            onClick={pickWinner}
          >
            Pick Winner
          </button>
        </div>

        {players.length > 0 && (
          <div className="players-list">
            <h2>Participants</h2>

            {players.map((player, index) => (
              <div
                className="player"
                key={`${player.address}-${index}`}
              >
                <span>
                  {index + 1}. {player.nickname}
                </span>
              </div>
            ))}
          </div>
        )}

        {winner && (
          <div className="winner">
            <h2>Winner</h2>
            <p>{winner}</p>
          </div>
        )}

        {status && (
          <div className="status">
            {status}
          </div>
        )}

        <p className="fee">
          Entry fee: 0.01 ETH
        </p>
      </div>
    </div>
  );
}

export default App;