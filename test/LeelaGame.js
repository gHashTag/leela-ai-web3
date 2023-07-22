const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('LeelaGame Contract', function () {
  let LeelaGame
  let leelaGame
  let addr1

  beforeEach(async function () {
    LeelaGame = await ethers.getContractFactory('LeelaGame')
    ;[owner, addr1] = await ethers.getSigners()
    leelaGame = await LeelaGame.deploy()
  })

  // it('Should roll the dice until 6 is rolled', async function () {
  //   let latestRoll
  //   let attempts = 0
  //   const steps = 30

  //   do {
  //     await leelaGame.connect(addr1).rollDice()
  //     const rollHistory = await leelaGame.getRollHistory(addr1.address)
  //     console.log('rollHistory', rollHistory)

  //     if (rollHistory.length > 0) {
  //       latestRoll = parseInt(rollHistory[rollHistory.length - 1].toString())
  //       attempts++
  //     }

  //     if (attempts > steps) {
  //       throw new Error(`Test timed out after ${steps} attempts to roll a 6.`)
  //     }
  //   } while (latestRoll !== 6)

  //   console.log(`Rolled a 6 after ${attempts} attempts.`)
  //   expect(latestRoll).to.equal(6)
  // })
  it('Should roll the dice until game is won', async function () {
    let gameStatus
    let attempts = 0
    const maxAttempts = 1000

    do {
      await leelaGame.connect(addr1).rollDice()
      const rollHistory = await leelaGame.getRollHistory(addr1.address)
      const planHistory = await leelaGame.getPlanHistory(addr1.address)
      gameStatus = await leelaGame.checkGameStatus(addr1.address)

      console.log(
        `Attempt ${attempts}: Roll - ${rollHistory[rollHistory.length - 1]}, Current Plan - ${
          planHistory[planHistory.length - 1]
        }`
      )

      attempts++

      if (attempts > maxAttempts) {
        throw new Error(`Test timed out after ${maxAttempts} attempts to win the game.`)
      }
    } while (!gameStatus.isFinished)

    console.log(`Game won after ${attempts} attempts.`)
    expect(gameStatus.isFinished).to.equal(true)
  })
})
