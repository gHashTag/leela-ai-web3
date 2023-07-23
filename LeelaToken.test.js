const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('LeelaToken', function () {
  let leelaToken;
  let leelaTokenAddress;
  let leelaGame;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Deploy the LeelaToken contract
    const LeelaToken = await ethers.getContractFactory('LeelaToken');
    [owner, addr1, addr2] = await ethers.getSigners();
    leelaToken = await LeelaToken.deploy();
    await leelaToken.waitForDeployment();
    //console.log("leelaToken", leelaToken);
    leelaTokenAddress = leelaToken.target;
    console.log('leelaTokenAddress', leelaTokenAddress);
    // const LeelaGame = await ethers.getContractFactory('LeelaGame', [
    //   leelaTokenAddress,
    // ]);
    // leelaGame = await LeelaGame.deploy();
    // console.log('leelaGame', leelaGame);
    // await leelaGame.waitForDeployment();
  });

  it('Should roll the dice until game is wons', async function () {
    //Положить токены на счет addr1.address
    console.log('hi');
    //const amountToDeposit = 3;
    // const transfer = await leelaToken.transfer(
    //     addr1.address,
    //     amountToDeposit,
    // );
    // console.log("transfer", transfer);
    // Предоставить разрешение контракту LeelaGame на перевод токенов с адреса addr1.address
    // const approve = await leelaToken.approve(
    //     leelaGame.target,
    //     amountToDeposit,
    // );
    //console.log("approve", approve);
    // const rollDiceTx = await leelaGame.rollDice();
    // console.log("rollDiceTx", rollDiceTx);
    //const receipt = await rollDiceTx.wait();
    //console.log("receipt", receipt);
  });

  // it("Must have the correct name, symbol, and total number of tokens", async function () {
  //     console.log("test", leelaTokenAddress);
  //     expect(await leelaToken.name()).to.equal("Leela Token");
  //     expect(await leelaToken.symbol()).to.equal("LEELA");
  //     expect(await leelaToken.totalSupply()).to.equal(
  //         ethers.parseEther("72000"),
  //     );
  // });
});
