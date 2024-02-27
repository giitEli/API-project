const getToday = () => {
  const today = new Date();
  return [today.getFullYear(), today.getMonth() + 1, today.getDate()].join("-");
};
console.log(getToday());

const isDate = (date) => {
  if (typeof date !== "string") return "1";
  date = date.split("-");
  if (date.length !== 3) return "2";
  const [year, month, day] = date;
  for (const part of date) {
    if (typeof Number(part) !== "number") return part + typeof part;
  }
  return true;
};


