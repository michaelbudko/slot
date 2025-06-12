const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DATA_FILE = './balance.json';
const fruits = ['🍒', '🍋', '🍇'];

function loadBalances() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveBalances(balances) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(balances, null, 2));
}

app.get('/slot', (req, res) => {
  const { user, bet } = req.query;
  if (!user || !bet) return res.send('Usage: /slot?user=username&bet=amount');
  const betAmount = parseInt(bet);
  if (isNaN(betAmount) || betAmount <= 0) return res.send('Invalid bet.');

  const balances = loadBalances();
  if (!balances[user]) balances[user] = 100;
  if (betAmount > balances[user]) return res.send(`${user}, insufficient balance.`);

  const spin = [fruits[Math.floor(Math.random() * 3)], fruits[Math.floor(Math.random() * 3)], fruits[Math.floor(Math.random() * 3)]];
  let result = spin.join(' ');
  let win = false;

  if (spin[0] === spin[1] && spin[1] === spin[2]) {
    const winnings = betAmount * 9;
    balances[user] += winnings;
    result += ` 🎉 You win ${winnings}!`;
  } else {
    balances[user] -= betAmount;
    result += ` 😢 You lost ${betAmount}.`;
  }

  saveBalances(balances);
  res.send(`${user}: ${result} | Balance: ${balances[user]}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});