const { expect } = require('chai');
const { ethers } = require('hardhat');
const {
  loadFixture,
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');

describe('LeelaGame', function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatToken = await ethers.deployContract('LeelaToken');
    await hardhatToken.waitForDeployment();

    const leelaTokenAddress = hardhatToken.target;
    // console.log('leelaTokenAddress', leelaTokenAddress);
    const leelaGame = await ethers.deployContract('LeelaGame', [
      leelaTokenAddress,
    ]);
    // console.log('leelaGame', leelaGame);
    await leelaGame.waitForDeployment();

    return { hardhatToken, leelaGame, owner, addr1, addr2 };
  }

  it('Should have LeelaToken contract address set', async function () {
    const { leelaGame, hardhatToken } = await loadFixture(deployTokenFixture);

    // Получить адрес LeelaToken из контракта LeelaGame
    const leelaGameLeelaTokenAddress = await leelaGame.leelaToken();
    console.log('leelaGameLeelaTokenAddress', leelaGameLeelaTokenAddress);
    // Проверить, что адрес контракта LeelaToken в контракте LeelaGame соответствует ожидаемому значению
    expect(leelaGameLeelaTokenAddress).to.equal(hardhatToken.target);
  });

  it('Should assign the total supply of tokens to the owner', async function () {
    const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });

  it('Should transfer tokens between accounts', async function () {
    const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture,
    );

    // Transfer 50 tokens from owner to addr1
    await expect(
      hardhatToken.transfer(addr1.address, 50),
    ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

    // Transfer 50 tokens from addr1 to addr2
    // We use .connect(signer) to send a transaction from another account
    await expect(
      hardhatToken.connect(addr1).transfer(addr2.address, 50),
    ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
  });

  // it('Must roll the die until a 6 is rolled', async function () {
  //   const { hardhatToken, leelaGame, owner, addr1, addr2 } = await loadFixture(
  //     deployTokenFixture,
  //   );
  //   console.log('owner.address', owner.address);
  //   console.log('addr1.address', addr1.address);
  //   //Положить 100 токенов на счет addr1.address
  //   const amountToDeposit = 100;
  //   const amount = await hardhatToken.transfer(addr1.address, amountToDeposit);
  //   console.log('amount', amount);
  //   let latestRoll;
  //   let attempts = 0;
  //   const steps = 30;

  //   do {
  //     const rollDice = await leelaGame.rollDice();
  //     console.log('rollDice', rollDice);
  //     const rollHistory = await leelaGame.getRollHistory(addr1.address);
  //     console.log('rollHistory', rollHistory);
  //     if (rollHistory.length > 0) {
  //       latestRoll = parseInt(rollHistory[rollHistory.length - 1].toString());
  //       attempts++;
  //     }

  //     if (attempts > steps) {
  //       throw new Error(
  //         `Тест завершен после ${steps} попыток бросить кубик и выпасть 6.`,
  //       );
  //     }
  //   } while (latestRoll !== 6);

  //   console.log(`Выпало 6 после ${attempts} попыток.`);
  //   expect(latestRoll).to.equal(6);
  // });
});

// it('Should roll the dice until game is won', async function () {
//   let gameStatus
//   let attempts = 0
//   const maxAttempts = 1000

//   do {
//     await leelaGame.connect(addr1).rollDice()
//     const rollHistory = await leelaGame.getRollHistory(addr1.address)
//     const planHistory = await leelaGame.getPlanHistory(addr1.address)
//     gameStatus = await leelaGame.checkGameStatus(addr1.address)

//     console.log(
//       `Attempt ${attempts}: Roll - ${rollHistory[rollHistory.length - 1]}, Current Plan - ${
//         planHistory[planHistory.length - 1]
//       }`
//     )

//     attempts++

//     if (attempts > maxAttempts) {
//       throw new Error(`Test timed out after ${maxAttempts} attempts to win the game.`)
//     }
//   } while (!gameStatus.isFinished)

//   console.log(`Game won after ${attempts} attempts.`)
//   expect(gameStatus.isFinished).to.equal(true)
// })
