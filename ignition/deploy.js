const { ethers, run, network } = require("hardhat");

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying SimpleStorage...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  console.log("waiting for deployment...");

  console.log("SimpleStorage deployed to:", simpleStorage.target);
  console.log(network.config);
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract...");
    await simpleStorage.deploymentTransaction().wait(6);
    await verify(simpleStorage.target, []);
  }
  const currentValue = await simpleStorage.retrieve();
  console.log("Current value of SimpleStorage:", currentValue.toString());
  //update current value
  const newValue = 42;
  const transactionRespomse = await simpleStorage.store(newValue);
  await transactionRespomse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log("Updated value of SimpleStorage:", updatedValue.toString());
}
async function verify(contractAddress, args) {
  console.log("verrifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.includes("Contract source code already verified")) {
      console.log("Contract already verified");
    } else {
      console.error(e);
    }
  }
}
main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
