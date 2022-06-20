const { expect } = require("chai");

describe("MultiSig contract", function () {
    // Mocha has four functions that let you hook into the test runner's
    // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.
  
    // They're very useful to setup the environment for tests, and to clean it
    // up after they run.
  
    // A common pattern is to declare some variables, and assign them in the
    // `before` and `beforeEach` callbacks.
  
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addrs;
  
    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    beforeEach(async function () {
      // Get the ContractFactory and Signers here.
      [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
      //Defining owners of multisig
      multisig_owners = [owner.address, addr1.address, addr2.address];
      //Defining minimum number of approvals for multisig (2/3)
      approvals = 2;

      // Deploy the CAR Token contract
      CAR_contract = await ethers.getContractFactory("CAR");  
      // To deploy our contract, we just have to call Token.deploy() and await
      // for it to be deployed(), which happens once its transaction has been
      // mined.
      car_token = await CAR_contract.deploy();
      //await car_token.deployed();
      //console.log(`Car Token Contract Address: ${car_token.address}\n`);
      //console.log(`Owner Address: ${owner.address}\n`);
      //console.log(`Car Token Contract Address: ${car_token.address.slice(2)}\n`);
      //console.log(`Address Type: ${typeof car_token.address}\n`);

      // Deploying the multisig contract
      MultiSig_contract = await ethers.getContractFactory("MultiSig");
      multisig_contract = await MultiSig_contract.deploy(multisig_owners, approvals, car_token.address);

      // Transfer some tokens to this contract
      tx = await car_token.transfer(multisig_contract.address, 100000)
    
      // Submit the transaction
      result = await multisig_contract.submit(addr3.address, 1000, 0)
      result = await multisig_contract.submit(addr3.address, 2000, 1)
      await multisig_contract.approve(0)
      //await multisig_contract.connect(addr1.address).approve(0)
    });


    describe("Test View Functions", function () {
        
        it("Can view all owners", async function(){
            const owners = [await multisig_contract.owners(0),
                            await multisig_contract.owners(1),
                            await multisig_contract.owners(2)];
            expect(JSON.stringify(owners)).to.equal(JSON.stringify(multisig_owners));
            //console.log(owners);
            //console.log(multisig_owners);
            //console.log(approvals);
        });

        it("Can view total number of transactions", async function(){
            const tx = await multisig_contract.num_transactions();
            //console.log(tx)
            expect(tx).to.equal(2);
            
        });

        it("Can view transactions", async function(){
            const tx = await multisig_contract.transactions(1);
            //console.log(tx.to, tx.value, tx.data, tx.executed);
        });

        it("Cannot view transaction if transaction does not exist", async function(){
        });

        it("Can view transaction approvals", async function(){
            const c = [await multisig_contract.approved(0,owner.address),
                await multisig_contract.approved(0,addr1.address),
                await multisig_contract.approved(0,addr2.address)]
            //console.log(c)
            
        });
        
    });

    describe("Transaction Submittion", function () {
        it("Owners Can submit transactions", async function(){
            result = await multisig_contract.connect(addr1).submit(addr3.address, 3000, 2)
        });

        it("Fail if msg sender is not owner", async function(){
            errorMsg = "not owner"

            await expect(
                multisig_contract.connect(addr3).submit(addr3.address, 3000, 2)
              ).to.be.revertedWith(errorMsg);
              
        });

    });

    describe("Approve", function () {
        it("Owners Can Approve", async function(){
            result = await multisig_contract.connect(addr1).approve(0)
            addr1_approval = await multisig_contract.approved(0,addr1.address)
            expect(addr1_approval).to.equal(true);
            
        });

        it("Fail if msg sender is not owner", async function(){
            errorMsg = "not owner"

            await expect(
                multisig_contract.connect(addr3).approve(0)
              ).to.be.revertedWith(errorMsg);
        });

        it("Cannot approve if transaction does not exist", async function(){
            errorMsg = "tx does not exist"

            await expect(
                multisig_contract.connect(addr2).approve(5)
              ).to.be.revertedWith(errorMsg);
        });
        
    });

    describe("Revoke", function () {
        it("Owners Revoke Approvals", async function(){
            result = await multisig_contract.revoke(0)
            owner_approval = await multisig_contract.approved(0,owner.address)
            expect(owner_approval).to.equal(false);
        });

        it("Fail if msg sender is not owner", async function(){
            errorMsg = "not owner"

            await expect(
                multisig_contract.connect(addr3).revoke(0)
              ).to.be.revertedWith(errorMsg);
        });

        it("Cannot revoke if transaction does not exist", async function(){
            errorMsg = "tx does not exist"

            await expect(
                multisig_contract.connect(addr2).revoke(5)
              ).to.be.revertedWith(errorMsg);
        });

        it("Cannot revoke if not approved", async function(){
            errorMsg = "tx not Approved"

            await expect(
                multisig_contract.revoke(1)
              ).to.be.revertedWith(errorMsg);
        });

        it("Cannot revoke if transaction already executed", async function(){
            // Approve from addr1
            approv = await multisig_contract.connect(addr1).approve(0)
            tx = await multisig_contract.execute(0)
            errorMsg = "tx already executed"

            await expect(
                multisig_contract.revoke(0)
              ).to.be.revertedWith(errorMsg);
        });

    });

    describe("Execute", function () {
        it("Only Owners Can execute transactions", async function(){
            // Approve from addr1
            old_balance = car_token.balanceOf(addr3.address)
            approv = await multisig_contract.connect(addr1).approve(0)
            tx = await multisig_contract.execute(0)
            new_balance = await car_token.balanceOf(addr3.address)
            console.log(old_balance, new_balance)
        });

        it("Proceeds if approvals greater than required", async function(){
            // Approve from addr1
            approv = await multisig_contract.connect(addr1).approve(0)
            errorMsg = "not owner"

            await expect(
                multisig_contract.connect(addr3).execute(0)
              ).to.be.revertedWith(errorMsg);

        });

        it("Fails if approvals are less than required", async function(){
            errorMsg = "Approvals less than required"

            await expect(
                multisig_contract.execute(0)
              ).to.be.revertedWith(errorMsg);
        });

        it("Fails if transaction is already executed", async function(){
            // Approve from addr1
            approv = await multisig_contract.connect(addr1).approve(0)
            tx = await multisig_contract.execute(0)

            errorMsg = "tx already executed"

            await expect(
                multisig_contract.execute(0)
              ).to.be.revertedWith(errorMsg);
            
        });


    });



});