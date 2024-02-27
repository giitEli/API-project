const dateIsBeforeDate = (date1, date2) => {
  const date1Arr = date1.split("-");
  const date2Arr = date2.split("-");

  for (let i = 0; i < 3; i++) {
    if (Number(date1Arr[i]) < Number(date2Arr[i])) return true;
    if (Number(date1Arr[i]) > Number(date2Arr[i])) return false;
  }

  if (date1 === date2) return false;
};

const dateIsAfterDate = (date1, date2) => {
  const date1Arr = date1.split("-");
  const date2Arr = date2.split("-");
  for (let i = 0; i < 3; i++) {
    if (Number(date1Arr[i]) > Number(date2Arr[i])) return true;
    if (Number(date1Arr[i]) < Number(date2Arr[i])) return false;
  }
  if (date1 === date2) return false;
};

const getToday = () => {
  const today = new Date();
  return [today.getFullYear(), today.getMonth() + 1, today.getDate()].join("-");
};

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

const getAvgRating = (spot, reviews) => {
  if (!reviews.length) return null;
  let sum = 0;
  let totalReviews = 0;
  for (const review of reviews) {
    if (review.spotId === spot.id) {
      sum += review.stars;
      totalReviews++;
    }
  }
  const average = sum / totalReviews;
  return Math.round(average * 10) / 10;
};

const getReviewCount = (spot, reviews) => {
  let reviewCount = 0;
  for (const review of reviews) {
    if (review.spotId === spot.id) reviewCount++;
  }
  return reviewCount;
};

const getPreviewImage = (spot, spotImages) => {
  for (const image of spotImages) {
    if (image.spotId === spot.id && image.preview) return image.url;
  }
  return null;
};

module.exports = {
  dateIsBeforeDate,
  dateIsAfterDate,
  getAvgRating,
  getReviewCount,
  getPreviewImage,
  getToday,
  isDate,
};
