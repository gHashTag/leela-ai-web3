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
    const leelaGame = await ethers.deployContract('LeelaGame', [
      leelaTokenAddress,
    ]);

    await leelaGame.waitForDeployment();

    return { hardhatToken, leelaGame, owner, addr1, addr2 };
  }

  //   it('Must roll the die until a 6 is rolled', async function () {
  //     const { hardhatToken, leelaGame, addr1 } = await loadFixture(
  //       deployTokenFixture,
  //     );

  //     //Положить токены на счет addr1.address
  //     const amountToDeposit = 3;
  //     await hardhatToken.transfer(addr1.address, amountToDeposit);

  //     // Предоставить разрешение контракту LeelaGame на перевод токенов с адреса addr1.address
  //     await hardhatToken.approve(leelaGame.target, amountToDeposit);

  //     let attempts = 0;
  //     const steps = 100;
  //     let diceRollResult = 0;

  //     do {
  //       const rollDiceTx = await leelaGame.rollDice();
  //       const receipt = await rollDiceTx.wait();

  //       if (receipt.logs.length > 0) {
  //         const diceRolledEvent = receipt.logs[0];
  //         const currentRollResult = Number(diceRolledEvent.args.rolled);
  //         console.log('diceRollResult', currentRollResult);
  //         diceRollResult = currentRollResult;
  //       }

  //       attempts++;

  //       if (attempts > steps) {
  //         throw new Error(
  //           `Test completed after ${steps} attempts to roll the die and roll 6.`,
  //         );
  //       }
  //     } while (diceRollResult !== 6);

  //     console.log(`Dropped 6 after ${attempts} tries.`);
  //     expect(diceRollResult).to.equal(6);
  //   });

  it('Should roll the dice until game is won', async function () {
    const { hardhatToken, leelaGame, addr1 } = await loadFixture(
      deployTokenFixture,
    );
    //Положить токены на счет addr1.address
    const amountToDeposit = 3;
    await hardhatToken.transfer(addr1.address, amountToDeposit);

    // Предоставить разрешение контракту LeelaGame на перевод токенов с адреса addr1.address
    await hardhatToken.approve(leelaGame.target, amountToDeposit);
    // console.log('leelaGame', leelaGame);

    // // Получаем все элементы FunctionFragment из интерфейса контракта
    // const functionFragments = leelaGame.interface.fragments.filter(
    //   (fragment) => fragment.type === 'function',
    // );

    // // Извлекаем названия функций
    // const functionNames = functionFragments.map((fragment) => fragment.name);

    // console.log(functionNames);

    let gameStatus;
    let attempts = 0;
    const maxAttempts = 5;
    let diceRollResult = 0;

    do {
      const rollDiceTx = await leelaGame.rollDice();
      const receipt = await rollDiceTx.wait();
      if (receipt.logs.length > 0) {
        const diceRolledEvent = receipt.logs[0];
        const currentRollResult = Number(diceRolledEvent.args.rolled);
        console.log('diceRollResult', currentRollResult);
        diceRollResult = currentRollResult;
      }
      try {
        gameStatus = await leelaGame.checkGameStatus(addr1.address);
        console.log('gameStatus', gameStatus);
        // console.log("leelaGame", leelaGame);
        const getRollHistory = await leelaGame.getRollHistory(addr1.address);
        console.log('getRollHistory', getRollHistory);
      } catch (error) {
        console.error('error', error);
      }
      console.log('attempts', attempts);
      // const planHistory = await leelaGame.getPlanHistory(addr1.address);
      // gameStatus = await leelaGame.checkGameStatus(addr1.address);

      // console.log(
      //   `Attempt ${attempts}: Roll - ${latestRoll}, Current Plan - ${currentPlan}`,
      // );

      //gameStatus = { isFinished: false };

      attempts++;

      // if (attempts > maxAttempts) {
      //   throw new Error(
      //     `Test timed out after ${maxAttempts} attempts to win the game.`,
      //   );
      // }
      //} while (!gameStatus.isFinished);
    } while (attempts !== 10);

    console.log(`Game won after ${attempts} attempts.`);
    expect(gameStatus.isFinished).to.equal(true);
  });

  //   it('Should return true after successful approval', async function () {
  //     const { hardhatToken, addr1 } = await loadFixture(deployTokenFixture);
  //     const amountToApprove = 100;
  //     const tx = await hardhatToken.approve(addr1.address, amountToApprove);
  //     console.log('tx', tx);
  //     const receipt = await tx.wait();
  //     expect(receipt.status).to.equal(1);
  //   });
});

// it('Should have LeelaToken contract address set', async function () {
//   const { leelaGame, hardhatToken } = await loadFixture(deployTokenFixture);

//   // Получить адрес LeelaToken из контракта LeelaGame
//   const leelaGameLeelaTokenAddress = await leelaGame.leelaToken();
//   console.log('leelaGameLeelaTokenAddress', leelaGameLeelaTokenAddress);
//   // Проверить, что адрес контракта LeelaToken в контракте LeelaGame соответствует ожидаемому значению
//   expect(leelaGameLeelaTokenAddress).to.equal(hardhatToken.target);
// });

// it('Should assign the total supply of tokens to the owner', async function () {
//   const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
//   const ownerBalance = await hardhatToken.balanceOf(owner.address);
//   expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
// });

// it('Should transfer tokens between accounts', async function () {
//   const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
//     deployTokenFixture,
//   );

//   // Transfer 50 tokens from owner to addr1
//   await expect(
//     hardhatToken.transfer(addr1.address, 50),
//   ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

//   // Transfer 50 tokens from addr1 to addr2
//   // We use .connect(signer) to send a transaction from another account
//   await expect(
//     hardhatToken.connect(addr1).transfer(addr2.address, 50),
//   ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
// });