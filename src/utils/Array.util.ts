export class UtilArray {
  static findItemNotOtherItem({ lessArr, thanArr }: { lessArr: string[]; thanArr: string[] }): string[] {
    if (lessArr.length === thanArr.length) return [];
    return thanArr.filter((item) => !lessArr.includes(item));
  }

  /**
   * Chia một mảng chuỗi thành các mảng con nhỏ với kích thước cố định.
   *
   * @param arr - Mảng các chuỗi cần chia nhỏ.
   * @param size - Kích thước của mỗi mảng con.
   * @returns Mảng hai chiều, mỗi phần tử là một mảng con với độ dài tối đa bằng `size`.
   *
   * @example
   * chunkArray(['a', 'b', 'c', 'd'], 2);
   * // Trả về: [['a', 'b'], ['c', 'd']]
   */
  static chunkArray<T>(arr: T[], size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(size * i, size * i + size));
  }
}
