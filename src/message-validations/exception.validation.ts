class Exception {
  exists(field: string) {
    return `${field?.toLocaleUpperCase()} already exists`;
  }
  loginAgain() {
    return `Please log in again`;
  }
  bad() {
    return `Error, please try again`;
  }
  notfound(object: string) {
    return `${object?.toLocaleUpperCase()} not found`;
  }
  unAuthorization() {
    return `Incorrect email or password`;
  }
  invalid(object: string) {
    return `Invalid ${object}`;
  }
  invalidToken() {
    return `Token is invalid`;
  }
  expiredToken() {
    return `Token is expired`;
  }
  fail(object?: string) {
    return `${object} fail`;
  }
  depend() {
    return 'The item you want to delete depends on another item, please check again.';
  }
}

export default new Exception();
