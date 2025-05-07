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
}
