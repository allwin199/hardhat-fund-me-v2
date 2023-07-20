const { getNamedAccounts, ether, deployments } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);

    console.log("Funding Contract.........");
    const txResponse = await fundMe.fund({ value: ethers.parseEther("0.1") });
    await txResponse.wait(1);
    console.log("Funded!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// yarn hardhat run scripts/fund.js --network localhost
