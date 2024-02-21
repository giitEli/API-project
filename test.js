
const dateIsBeforeDate = (date1, date2) => {
    if(date1 === date2) return false
    const date1Arr = date1.split("-")
    const date2Arr = date2.split("-")
    for(let i = 0; i < 3; i++) {
      if(Number(date1Arr[i]) > Number(date2Arr[i])) return false
    }
    return true
}
const date = new Date()
const [month, day, year] = [
    date.getMonth() + 1,
    date.getDate(),
    date.getFullYear(),
  ];
console.log(month)
