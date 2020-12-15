//jshint esversion: 6

exports.getDate = function () {
  const today = new Date();

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };

  return today.toLocaleDateString("ar-EG", options);
};
