/**
 * Định dạng giá tiền theo chuẩn: 100.000 VNĐ
 * @param {number} value - Giá trị số cần định dạng
 * @returns {string} - Chuỗi đã định dạng, ví dụ: "350.000 VNĐ"
 */
export const formatPrice = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0 VNĐ';
  return Number(value).toLocaleString('vi-VN') + ' VNĐ';
};
