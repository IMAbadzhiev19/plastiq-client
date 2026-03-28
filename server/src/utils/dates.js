function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function isoNow() {
  return new Date().toISOString();
}

function isPreviousDay(previousDate, currentDate) {
  if (!previousDate || !currentDate) {
    return false;
  }

  const previous = new Date(`${previousDate}T00:00:00.000Z`);
  const current = new Date(`${currentDate}T00:00:00.000Z`);
  const difference = current.getTime() - previous.getTime();

  return difference === 24 * 60 * 60 * 1000;
}

module.exports = {
  todayKey,
  isoNow,
  isPreviousDay,
};
