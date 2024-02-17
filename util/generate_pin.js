const generatePin = () => {
  return Math.random().toString().substring(2, 8);
};
module.exports = generatePin;
