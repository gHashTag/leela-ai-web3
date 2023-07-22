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

  it('Should roll the dice until 6 is rolled', async function () {
    let latestRoll
    let attempts = 0
    const steps = 30

    do {
      await leelaGame.connect(addr1).rollDice()
      const rollHistory = await leelaGame.getRollHistory(addr1.address)
      console.log('rollHistory', rollHistory)

      if (rollHistory.length > 0) {
        latestRoll = parseInt(rollHistory[rollHistory.length - 1].toString())
        attempts++
      }

      if (attempts > steps) {
        throw new Error(`Test timed out after ${steps} attempts to roll a 6.`)
      }
    } while (latestRoll !== 6)

    console.log(`Rolled a 6 after ${attempts} attempts.`)
    expect(latestRoll).to.equal(6)
  })
})
