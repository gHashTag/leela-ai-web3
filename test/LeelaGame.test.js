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

  it('Players can create reports after starting the game', async function () {
    const { leelaGame, owner } = await loadFixture(deployTokenFixture);

    // Start the game by rolling a 6
    let rollResult = 0;
    while (rollResult !== 6) {
      const rollDiceTx = await leelaGame.rollDice();
      const receipt = await rollDiceTx.wait();

      if (receipt.logs.length > 0) {
        const diceRolledEvent = receipt.logs[0];
        rollResult = Number(diceRolledEvent.args.rolled);
      }
    }

    // Create a report after starting the game
    const createReportTx = await leelaGame.createReport('Turn report');
    await createReportTx.wait();

    // Get all reports and check if the created report exists
    const allReports = await leelaGame.getAllReports();
    const lastReport = allReports[allReports.length - 1];

    expect(lastReport.reporter).to.equal(owner.address);
    expect(lastReport.content).to.equal('Turn report');

    // Update the report's content
    const updateReportTx = await leelaGame.updateReportContent(
      lastReport.reportId,
      'Updated report content',
    );
    await updateReportTx.wait();

    // Get the updated report and check if the content is updated
    const updatedReport = await leelaGame.reports(lastReport.reportId);
    expect(updatedReport.content).to.equal('Updated report content');

    // Delete the report
    const deleteReportTx = await leelaGame.deleteReport(lastReport.reportId);
    await deleteReportTx.wait();

    // Get the deleted report and check if the content is updated
    const deletedReport = await leelaGame.reports(lastReport.reportId);
    expect(deletedReport.content).to.equal('This report has been deleted.');
  });

  it('Player can only start the game after rolling a 6', async function () {
    const { leelaGame, owner } = await loadFixture(deployTokenFixture);

    let rollResult = 0;
    while (rollResult !== 6) {
      const rollDiceTx = await leelaGame.rollDice();
      const receipt = await rollDiceTx.wait();

      if (receipt.logs.length > 0) {
        const diceRolledEvent = receipt.logs[0];
        const currentRollResult = Number(diceRolledEvent.args.rolled);
        const plan = await leelaGame.getPlanHistory(owner.address);
        const [isStart] = await leelaGame.checkGameStatus(owner.address);
        rollResult = currentRollResult;
      }
    }

    const [isStart] = await leelaGame.checkGameStatus(owner.address);
    expect(isStart).to.equal(true);
  });

  it('Should roll the dice until game is won', async function () {
    const { leelaGame, owner } = await loadFixture(deployTokenFixture);
    let gameStatus;
    let attempts = 0;
    const maxAttempts = 999;
    let diceRollResult = 0;

    // Начинаем игру
    const rollStartTx = await leelaGame.rollDice();
    await rollStartTx.wait();

    do {
      const rollDiceTx = await leelaGame.rollDice();
      const receipt = await rollDiceTx.wait();

      gameStatus = await leelaGame.checkGameStatus(owner.address);

      if (receipt.logs.length > 0) {
        const diceRolledEvent = receipt.logs[0];
        const currentRollResult = Number(diceRolledEvent.args.rolled);
        // console.log('diceRollResult', currentRollResult);
        diceRollResult = currentRollResult;
        if (gameStatus.isStart) {
          const createReportTx = await leelaGame.createReport('Turn report');
          await createReportTx.wait();
        }
      }

      // const planHistory = await leelaGame.getPlanHistory(owner.address);
      // console.log('planHistory', planHistory);
      attempts++;
    } while (!gameStatus.isFinished && attempts < maxAttempts);

    console.log(`Game won after ${attempts} attempts.`);
    expect(gameStatus.isFinished).to.equal(true);
  });

  it('Players can add and update comments', async function () {
    const { leelaGame, owner } = await loadFixture(deployTokenFixture);

    // Start the game by rolling a 6
    let rollResult = 0;
    while (rollResult !== 6) {
      const rollDiceTx = await leelaGame.rollDice();
      const receipt = await rollDiceTx.wait();

      if (receipt.logs.length > 0) {
        const diceRolledEvent = receipt.logs[0];
        rollResult = Number(diceRolledEvent.args.rolled);
      }
    }

    // Create a report after starting the game
    const createReportTx = await leelaGame.createReport('Turn report');
    await createReportTx.wait();

    // Get all reports and get the last one
    const allReports = await leelaGame.getAllReports();
    const lastReport = allReports[allReports.length - 1];

    // Add a comment to the report
    const addCommentTx = await leelaGame.addComment(
      lastReport.reportId,
      'Test Comment',
    );
    await addCommentTx.wait();

    // Get the report's comments and check if the comment exists
    const reportComments = await leelaGame.getAllCommentsForReport(
      lastReport.reportId,
    );
    const lastComment = reportComments[reportComments.length - 1];
    expect(lastComment.commenter).to.equal(owner.address);
    expect(lastComment.content).to.equal('Test Comment');

    // Update the comment's content
    const updateCommentTx = await leelaGame.updateCommentContent(
      lastComment.commentId,
      'Updated comment content',
    );
    await updateCommentTx.wait();

    // Get the updated comment and check if the content is updated
    const allCommentsForReport = await leelaGame.getAllCommentsForReport(
      lastComment.reportId,
    );

    const updatedComment =
      allCommentsForReport[allCommentsForReport.length - 1];
    expect(updatedComment.content).to.equal('Updated comment content');
  });
});
