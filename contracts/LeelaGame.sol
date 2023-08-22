// SPDX-License-Identifier: MIT
/* solhint-disable */
pragma solidity ^0.8.0;

contract LeelaGame {
  uint8 constant MAX_ROLL = 6;
  uint8 constant WIN_PLAN = 68;
  uint8 constant TOTAL_PLANS = 72;

  struct Player {
    uint256 plan;
    uint256 previousPlan;
    bool isStart;
    bool isFinished;
    uint8 consecutiveSixes;
  }

  struct Report {
    uint256 reportId;
    address reporter;
    string content;
    uint256 plan;
    uint256 timestamp;
  }

  uint256 private reportIdCounter;
  mapping(uint256 => Report) public reports;

  constructor() {
    Player memory newPlayer;
    newPlayer.plan = 68;
    newPlayer.previousPlan = 68;
    players[msg.sender] = newPlayer;
  }

  mapping(address => Player) public players;
  mapping(address => uint8[]) public playerRolls;
  mapping(address => uint256[]) public playerPlans;
  mapping(address => bool) public playerReportCreated;

  event DiceRolled(
    address indexed roller,
    uint8 indexed rolled,
    uint256 indexed currentPlan
  );

  function rollDice() external {
    uint8 rollResult = generateRandomNumber();
    playerRolls[msg.sender].push(rollResult);

    Player storage player = players[msg.sender];

    if (player.isStart) {
      require(
        reports[reportIdCounter].reporter == msg.sender,
        'You must create a report before rolling the dice.'
      );
    }

    if (!player.isStart && rollResult == 6) {
      player.plan = 6;
      player.isStart = true;
      player.consecutiveSixes = 1;
      playerPlans[msg.sender].push(6);
      emit DiceRolled(msg.sender, rollResult, 6);
    } else if (player.isStart) {
      handleRollResult(rollResult, msg.sender);
    }
  }

  function generateRandomNumber() private view returns (uint8) {
    uint256 randomNum = uint256(
      keccak256(
        abi.encodePacked(
          block.timestamp,
          blockhash(block.number - 1),
          msg.sender
        )
      )
    );
    uint8 roll = uint8((randomNum % MAX_ROLL) + 1);
    return roll;
  }

  function handleRollResult(uint8 roll, address playerAddress) private {
    Player storage player = players[playerAddress];

    if (roll == MAX_ROLL) {
      player.consecutiveSixes += 1;
      if (player.consecutiveSixes == 3) {
        player.plan = player.previousPlan;
        player.consecutiveSixes = 0;
        return;
      }
    } else {
      player.consecutiveSixes = 0;
    }

    movePlayer(roll, playerAddress);
  }

  function movePlayer(uint8 roll, address playerAddress) private {
    Player storage player = players[playerAddress];
    player.previousPlan = player.plan;
    uint256 newPlan = player.plan + roll;

    // Snakes that lead the player downwards
    if (newPlan > TOTAL_PLANS) {
      newPlan = player.plan;
    }
    if (newPlan == 12) {
      newPlan = 8;
    } else if (newPlan == 16) {
      newPlan = 4;
    } else if (newPlan == 24) {
      newPlan = 7;
    } else if (newPlan == 29) {
      newPlan = 6;
    } else if (newPlan == 44) {
      newPlan = 9;
    } else if (newPlan == 52) {
      newPlan = 35;
    } else if (newPlan == 55) {
      newPlan = 3;
    } else if (newPlan == 61) {
      newPlan = 13;
    } else if (newPlan == 63) {
      newPlan = 2;
    } else if (newPlan == 72) {
      newPlan = 51;
    }
    // Arrows that lead the player upwards
    else if (newPlan == 10) {
      newPlan = 23;
    } else if (newPlan == 17) {
      newPlan = 69;
    } else if (newPlan == 20) {
      newPlan = 32;
    } else if (newPlan == 22) {
      newPlan = 60;
    } else if (newPlan == 27) {
      newPlan = 41;
    } else if (newPlan == 28) {
      newPlan = 50;
    } else if (newPlan == 37) {
      newPlan = 66;
    } else if (newPlan == 45) {
      newPlan = 67;
    } else if (newPlan == 46) {
      newPlan = 62;
    } else if (newPlan == 54) {
      newPlan = 68;
    } else if (newPlan > TOTAL_PLANS) {
      // Player overshoots the goal, stays in place
      newPlan = player.plan;
    }

    player.plan = newPlan;
    playerPlans[playerAddress].push(newPlan);

    // Check for finish
    if (newPlan == WIN_PLAN) {
      player.isFinished = true;
      player.previousPlan = newPlan;
      player.isStart = false;
    }
    emit DiceRolled(playerAddress, roll, newPlan);
  }

  function getRollHistory(address player) public view returns (uint8[] memory) {
    return playerRolls[player];
  }

  function checkGameStatus(
    address playerAddress
  ) public view returns (bool isStart, bool isFinished) {
    Player storage player = players[playerAddress];
    return (player.isStart, player.isFinished);
  }

  function getPlanHistory(
    address player
  ) public view returns (uint256[] memory) {
    return playerPlans[player];
  }

  function createReport(string memory content) external {
    uint256 currentPlan = players[msg.sender].plan;
    require(
      players[msg.sender].isStart,
      'You must start the game before creating a report.'
    );

    reportIdCounter++; // Увеличиваем счетчик

    reports[reportIdCounter] = Report({
      reportId: reportIdCounter, // Сохраняем reportId
      reporter: msg.sender,
      content: content,
      plan: currentPlan,
      timestamp: block.timestamp
    });
    playerReportCreated[msg.sender] = true;
  }

  function updateReportContent(
    uint256 reportId,
    string memory newContent
  ) external {
    Report storage report = reports[reportId];
    require(
      report.reporter == msg.sender,
      'Only the reporter can update the report.'
    );
    report.content = newContent;
  }

  function deleteReport(uint256 reportId) external {
    require(reportId <= reportIdCounter && reportId > 0, 'Invalid report ID.');
    Report storage report = reports[reportId];
    require(
      report.reporter == msg.sender,
      'Only the reporter can delete the report.'
    );
    report.content = 'This report has been deleted.';
  }

  function getAllReports() external view returns (Report[] memory) {
    Report[] memory allReports = new Report[](reportIdCounter);
    for (uint256 i = 1; i <= reportIdCounter; i++) {
      allReports[i - 1] = reports[i];
    }
    return allReports;
  }

  function getReport(uint256 reportId) external view returns (Report memory) {
    require(reportId <= reportIdCounter && reportId > 0, 'Invalid report ID.');
    return reports[reportId];
  }
}
