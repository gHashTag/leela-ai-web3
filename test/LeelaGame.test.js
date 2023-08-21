const { expect } = require('chai');
const { ethers } = require('hardhat');
const {
  loadFixture,
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');

describe('LeelaGame', function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const leelaGame = await ethers.deployContract('LeelaGame');

    await leelaGame.waitForDeployment();

    return { leelaGame, owner, addr1, addr2 };
  }

  it('Player can only start the game after rolling a 6', async function () {
    const { leelaGame, owner } = await loadFixture(deployTokenFixture);

    let rollResult = 0;
    while (rollResult !== 6) {
      const rollDiceTx = await leelaGame.rollDice();
      const receipt = await rollDiceTx.wait();

      if (receipt.logs.length > 0) {
        const diceRolledEvent = receipt.logs[0];

        const currentRollResult = Number(diceRolledEvent.args.rolled);
        console.log('currentRollResult', currentRollResult);
        console.log('currentPlan', diceRolledEvent.args.currentPlan);
        const plan = await leelaGame.getPlanHistory(owner.address);
        console.log('plan', plan);
        const [isStart] = await leelaGame.checkGameStatus(owner.address);
        console.log('isStart', isStart);
        rollResult = currentRollResult;
      }
    }

    const [isStart] = await leelaGame.checkGameStatus(owner.address);

    // expect(initialPlan).to.equal(68);

    // expect(rollResult).to.equal(6);
    expect(isStart).to.equal(true);
  });

  // it('Should roll the dice until game is won', async function () {
  //   const { leelaGame, owner } = await loadFixture(deployTokenFixture);
  //   // console.log('leelaGame', leelaGame);
  //   let gameStatus;
  //   let attempts = 0;
  //   const maxAttempts = 50;
  //   let diceRollResult = 0;

  //   do {
  //     const rollDiceTx = await leelaGame.rollDice();
  //     const receipt = await rollDiceTx.wait();
  //     if (receipt.logs.length > 0) {
  //       const diceRolledEvent = receipt.logs[0];
  //       const currentRollResult = Number(diceRolledEvent.args.rolled);
  //       console.log('diceRollResult', currentRollResult);
  //       diceRollResult = currentRollResult;
  //     }
  //     try {
  //       gameStatus = await leelaGame.checkGameStatus(owner.address);
  //       // console.log('gameStatus', gameStatus);
  //       // // console.log("leelaGame", leelaGame);
  //       // const getRollHistory = await leelaGame.getRollHistory(owner.address);
  //       // console.log('getRollHistory', getRollHistory);
  //     } catch (error) {
  //       console.error('error', error);
  //     }
  //     // console.log('attempts', attempts);
  //     const planHistory = await leelaGame.getPlanHistory(owner.address);

  //     console.log('planHistory', planHistory);
  //     // console.log(
  //     //   `Attempt ${attempts}: Roll - ${latestRoll}, Current Plan - ${currentPlan}`,
  //     // );

  //     attempts++;
  //   } while (!gameStatus.isFinished && attempts < maxAttempts);

  //   console.log(`Game won after ${attempts} attempts.`);
  //   expect(gameStatus.isFinished).to.equal(true);
  // });
});
// it('Must roll the die until a 6 is rolled', async function () {
//   const { leelaGame, addr1 } = await loadFixture(deployTokenFixture);

//   let attempts = 0;
//   const steps = 100;
//   let diceRollResult = 0;

//   do {
//     const rollDiceTx = await leelaGame.rollDice();
//     const receipt = await rollDiceTx.wait();

//     if (receipt.logs.length > 0) {
//       const diceRolledEvent = receipt.logs[0];
//       const currentRollResult = Number(diceRolledEvent.args.rolled);
//       console.log('diceRollResult', currentRollResult);
//       diceRollResult = currentRollResult;
//     }

//     attempts++;

//     if (attempts > steps) {
//       throw new Error(
//         `Test completed after ${steps} attempts to roll the die and roll 6.`,
//       );
//     }
//   } while (diceRollResult !== 6);

//   console.log(`Dropped 6 after ${attempts} tries.`);
//   expect(diceRollResult).to.equal(6);
// });
