// Generate Transaction id
const generateTransactionId = () => {
  //  TRANS-DATE-31
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const transactionId = `TRANS-${year}-${month}-${day}-${Math.floor(
    Math.random() * 1000
  )}`;
  return transactionId;
};

// Gwenrate Walking Id
const generateWalkingId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const walkingId = `WALKING-${year}-${month}-${day}-${Math.floor(
    Math.random() * 1000
  )}`;
  return walkingId;
};
module.exports = { generateTransactionId, generateWalkingId };
