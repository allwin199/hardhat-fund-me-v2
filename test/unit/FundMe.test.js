const { assert, expect } = require("chai");
const { deployments, ether, getNamedAccounts } = require("hardhat");

describe("FundMe", () => {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    const sendValue = "1000000000000000000"; //1 ETH
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
            assert.equal(response, mockV3Aggregator.target);
        });

        it("Sets the owner address correctly", async () => {
            const currentOwner = await fundMe.getOwner();
            assert.equal(currentOwner, deployer);
        });
    });

    describe("fund", async () => {
        it("Fails if you don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWithCustomError(
                fundMe,
                "FundMe__NOT_ENOUGH_ETH",
            );
        });

        it("Updates the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue });
            const addressToAmountFunded = await fundMe.getAddressToAmountFunded(
                deployer,
            );
            assert.equal(addressToAmountFunded, sendValue);
        });

        it("updates the funder array", async () => {
            await fundMe.fund({ value: sendValue });
            const recentFunder = await fundMe.getFunder(0);
            assert.equal(recentFunder, deployer);
        });
    });
});
