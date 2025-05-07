export class UtilArray {
  static findItemNotOtherItem({ lessArr, thanArr }: { lessArr: string[]; thanArr: string[] }): string[] {
    if (lessArr.length === thanArr.length) return [];
    return thanArr.filter((item) => !lessArr.includes(item));
  }
}
