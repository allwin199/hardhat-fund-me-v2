const { network } = require("hardhat");
const { DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (chainId === 31337) {
        log("Local network detected! Deploying Mocks....");

        const MockV3Aggregator = await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        });

        log("Mocks Deployed!");
        log("--------------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
