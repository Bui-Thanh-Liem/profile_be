class Validation {
  empty(field: string) {
    return `${field.toLocaleUpperCase()} is not empty`;
  }
  minLength(field: string, min: number) {
    return `${field.toLocaleUpperCase()} minimum ${min} characters`;
  }
  maxLength(field: string, max: number) {
    return `${field.toLocaleUpperCase()} maximum ${max} characters`;
  }
}

export default new Validation();
