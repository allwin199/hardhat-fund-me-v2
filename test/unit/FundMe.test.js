const { assert } = require("chai");
const { deployments, ether, getNamedAccounts } = require("hardhat");

describe("FundMe", () => {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
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
});
