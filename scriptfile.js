/**
 * Charge the wallet balance of a trader
 * @param {org.example.mynetwork.Charge} charge - the charge to be processed
 * @transaction
 */
async function chargeTrader(charge) {
    charge.charger.walletBalance += charge.amount;
    let participantRegistry = await getParticipantRegistry('org.example.mynetwork.Trader');
    await participantRegistry.update(charge.charger);
}

/**
 * Send
 * @param {org.example.mynetwork.Send} send - the send to be processed
 * @transaction
 */
async function sendPackage(send) {
    send.package.sender = send.sender;
    send.package.recipient = send.recipient;
    send.package.category = send.category;
    send.package.description = send.description;
    send.package.weight = send.weight;
    send.package.sendTime = send.sendTime;
    send.package.sendLongitude = send.sendLongitude;
    send.package.sendLatitude = send.sendLatitude;
    send.package.receiveLongitude = send.receiveLongitude;
    send.package.receiveLatitude = send.receiveLatitude;
    send.package.status = "On Shipping"
    if (send.sender.walletBalance <= 0)
    {
      throw new Error('Please recharge balance A.S.A.P.')
    }
    let assetRegistry = await getAssetRegistry('org.example.mynetwork.Package');
    await assetRegistry.update(send.package);
}

/**
 * Receive
 * @param {org.example.mynetwork.Receive} receive - the send to be processed
 * @transaction
 */
async function receivePackage(receive) {
    receive.package.receiveTime = receive.receiveTime;
    receive.package.receiveWeight = receive.receiveWeight;
    if (receive.package.sender  == receive.sender 
        && receive.package.receiver  == receive.receiver 
        && receive.package.weight == receive.receiveWeight)
    {
      receive.package.status = "Already Signed"
      let D = ((receive.package.receiveLongitude - receive.package.sendLongitude)**2 
        + (receive.package.receiveLatitude - receive.package.sendLatitude)**2)**(0.5);
      let T = receive.receiveTime-receive.package.sendTime;
      receive.package.fee = D*(receive.package.weight)/T;
    }
    else { 
        throw new Error('Wrong Package!')
    }
    receive.sender.walletBalance -= receive.package.fee;
    let assetRegistry = await getAssetRegistry('org.example.mynetwork.Package');
    await assetRegistry.update(receive.package);
    let participantRegistry = await getParticipantRegistry('org.example.mynetwork.Trader');
    await participantRegistry.update(receive.sender);
}

