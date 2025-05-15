export class UtilConvert {
  static convertStringToArray(str: string | string[]): string[] {
    return typeof str === 'string' ? [str] : str || [];
  }

  static convertStringToArrayBySplit(str: string, operator: ',' | '-'): string[] {
    const checkExistOperator = str?.includes(operator);
    console.log('str:::', str);
    console.log('checkExistOperator:::', checkExistOperator);

    return checkExistOperator ? str?.split(operator) : [str];
  }

  static formatToInternational(phone: string): string {
    // Xóa khoảng trắng và ký tự không phải số
    const cleaned = phone.replace(/\D/g, '');

    // Nếu bắt đầu bằng "0", thay bằng "+84"
    if (cleaned.startsWith('0')) {
      return '+84' + cleaned.slice(1);
    }

    // Nếu đã là định dạng quốc tế, trả về nguyên
    if (cleaned.startsWith('84')) {
      return '+'.concat(cleaned);
    }

    throw new Error('Invalid Vietnamese phone number format');
  }
}
