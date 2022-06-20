// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
    // This is just a convenience check
    if (network.name === "hardhat") {
      console.warn(
        "You are trying to deploy a contract to the Hardhat Network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }
  
    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log(
      "Deploying the contracts with the account:",
      await deployer.getAddress()
    );
  
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Deploying sdt_token Contract
    const SDT_contract = await ethers.getContractFactory("SafeDriveToken");
    const sdt_token = await SDT_contract.deploy();
    await sdt_token.deployed();
    console.log("SDT address:", sdt_token.address);

    // Deploying RRNFT Contract
    const RRNFT_contract = await ethers.getContractFactory("RRNFT");
    const rrnft_contract = await RRNFT_contract.deploy("ipfs://QmYcoNrCDPaFm9LaeNFH8JqeofUhx6t2bAYNBSt8XV1WH7/");
    await rrnft_contract.deployed();
  
    console.log("RRNFT address:", rrnft_contract.address);
  
    // Deploying car_token Contract
    const CAR_contract = await ethers.getContractFactory("CAR");
    const car_token = await CAR_contract.deploy();
    await car_token.deployed();
    console.log("CAR address:", car_token.address);

    // Deploying multisig_contract Contract
    //const accounts = ["0xc769f69A2fd7EF64955E46A974d5892C14FC0e67","0x6D931307fB3A5124Bf25a09A1e9819396297eF8b"];
    const accounts = ["0xdEcbD561a4D39Ba087e39257cf13D6b83C0B4Ba5","0x3330E9857B73A4914F4B85878CFAF0A339A8cfff","0xc769f69A2fd7EF64955E46A974d5892C14FC0e67"];
    const multisig_contract_contract = await ethers.getContractFactory("MultiSig");
    const multisig_contract = await multisig_contract_contract.deploy(accounts, 2, car_token.address);
  
    await multisig_contract.deployed();
  
    console.log("multisig_contract deployed to:", multisig_contract.address);
    // Transfer treasury car_tokens to this contract
    console.log("\n Transfering 1000000 CAR to MultisigContract.....\n");
    tx = await car_token.transfer(multisig_contract.address, 1000000)
    console.log("\n TransferSuccessful\nSaving Contract Addresses and Contract ABIs");
/*  
    //Deploying Escrow Contract
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
  
    await escrow.deployed();
  
    console.log("Escrow deployed to:", escrow.address);
*/  
  
    //Block Number to start searches from
    const height = await ethers.provider.getBlockNumber();
  
    // We also save the contract's artifacts and address in the frontend directory
    saveFrontendFiles(sdt_token, rrnft_contract, car_token, multisig_contract, height);
  }
  
  function saveFrontendFiles(sdt_token, rrnft_contract, car_token, multisig_contract, height) {
    const fs = require("fs");
    const contractsDir = __dirname + "/../frontend/src/contracts";
  
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    const addresses = {
          SafeDriveToken: sdt_token.address,
          RRNFT: rrnft_contract.address,
          CAR: car_token.address.address,
          MultiSig: multisig_contract.address,
          // Escrow: escrow.address.slice(2),
          Height: height
    }
  
    fs.writeFileSync(
      contractsDir + "/contract-address.json",
      JSON.stringify(addresses, undefined, 2)
    );
  
    const sdt_tokenArtifact = artifacts.readArtifactSync("SafeDriveToken");
    const rrnft_contractArtifact = artifacts.readArtifactSync("RRNFT");
    const car_tokenArtifact = artifacts.readArtifactSync("CAR");
    const multisig_contractArtifact = artifacts.readArtifactSync("MultiSig");
    // const EscrowArtifact = artifacts.readArtifactSync("Escrow");
  
    fs.writeFileSync(
      contractsDir + "/SafeDriveToken.json",
      JSON.stringify(sdt_tokenArtifact, null, 2)
    );
    fs.writeFileSync(
      contractsDir + "/RRNFT.json",
      JSON.stringify(rrnft_contractArtifact, null, 2)
    );
    fs.writeFileSync(
      contractsDir + "/CAR.json",
      JSON.stringify(car_tokenArtifact, null, 2)
    );
    fs.writeFileSync(
      contractsDir + "/MultiSig.json",
      JSON.stringify(multisig_contractArtifact, null, 2)
    );
    // fs.writeFileSync(
    //   contractsDir + "/Escrow.json",
    //   JSON.stringify(EscrowArtifact, null, 2)
    // );
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });