const { getNamedAccounts, ether, deployments } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);

    console.log("Widthdrawing.........");
    const txResponse = await fundMe.withdraw();
    await txResponse.wait(1);

    console.log("Widthdraw Successful!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// yarn hardhat run scripts/withdraw.js --network localhost
