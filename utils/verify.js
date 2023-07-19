const { run } = require("hardhat");

async function verify(_contractAddress, _args) {
    console.log("Verifying Contract............");

    try {
        await run("verify:verify", {
            address: _contractAddress,
            constructorArguments: _args,
        });
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified");
        } else {
            console.log(error);
        }
    }
}

module.exports = {
    verify,
};
