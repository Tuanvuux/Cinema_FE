// Định dạng ngày: yyyy-mm-dd → dd/mm/yyyy
export const formatDate = (dateStr) => {
  const dateObj = new Date(dateStr);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

// Định dạng thời gian: "13:00:00" → "13:00"
export const formatTime = (timeStr) => {
  const [hour, minute] = timeStr.split(":");
  return `${hour}:${minute}`;
};

export const ageLimit = (age) => {
  if (!age) {
    return " - NỘI DUNG PHIM PHÙ HỢP VỚI MỌI LỨA TUỔI";
  }
  return `- PHIM CẤM PHỔ BIẾN ĐỐI VỚI KHÁN GIẢ DƯỚI ${age} TUỔI`;
};
