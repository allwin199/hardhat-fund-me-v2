const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");

const chainId = network.config.chainId;
chainId !== 31337
    ? describe.skip
    : describe("FundMe", () => {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.parseEther("1"); //"1000000000000000000"; //1 ETH
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);

              // deployments.fixture will go through deploy folder and deploy all the files which contain tags as all
              // since harhdat has deployed all our contracts, we can get back all the recently deployed contracts using ethers
              fundMe = await ethers.getContract("FundMe", deployer);
              // whenver we interact with fundMe it will be from deployer account.
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer,
              );
          });

          describe("Constructor", () => {
              it("Sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeedAddress();
                  console.log(response);
                  assert.equal(response, mockV3Aggregator.target);
              });

              it("Sets the owner address correctly", async () => {
                  const currentOwner = await fundMe.getOwner();
                  assert.equal(currentOwner, deployer);
              });
          });

          describe("Minimum USD", () => {
              it("Sets Minimum USD", async () => {
                  const response = await fundMe.getMinimumUsd();
                  assert.equal(5e18, response);
              });
          });

          describe("fund", () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWithCustomError(
                      fundMe,
                      "FundMe__NOT_ENOUGH_ETH",
                  );
              });

              it("Updates the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer,
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });

              it("updates the funder array", async () => {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("Withdraw", () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });

              // before owner can withdraw, there should be atleast some money
              it("Reverts if withdraw is not called by owner", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker,
                  );
                  await expect(
                      attackerConnectedContract.withdraw(),
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NOT_OWNER");
              });

              it("Withdraw ETH from a single funder", async () => {
                  // Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);
                  // Act
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);

                  // console.log(txReceipt);
                  const gasCost = txReceipt.gasUsed * txReceipt.gasPrice;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // Assert
                  assert.equal(endingFundMeBalance.toString(), (0).toString());
                  assert.equal(
                      endingDeployerBalance,
                      startingFundMeBalance + startingDeployerBalance - gasCost,
                  );
                  // deployer spent some gas while doing the transactions
              });

              it("Withdraw ETH from multiple funders", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);
                  // Act
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);

                  // console.log(txReceipt);
                  const gasCost = txReceipt.gasUsed * txReceipt.gasPrice;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // Assert
                  assert.equal(endingFundMeBalance.toString(), (0).toString());
                  assert.equal(
                      endingDeployerBalance,
                      startingFundMeBalance + startingDeployerBalance - gasCost,
                  );
                  // deployer spent some gas while doing the transactions

                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      );
                  }
              });
          });
      });
