const { ethers, getNamedAccounts, deployments, network } = require("hardhat");
const { assert } = require("chai");

const chainId = network.config.chainId;
chainId === 31337
    ? describe.skip
    : describe("FundMe", () => {
          let fundMe;
          let deployer;
          const sendValue = ethers.parseEther("0.01");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;

              // since it is staging, we assume it is deployed here
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.target,
              );
              assert.equal(endingBalance.toString(), "0");
          });
      });
