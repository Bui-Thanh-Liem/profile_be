class Exception {
  exists(field: string) {
    return `${field?.toLocaleUpperCase()} already exists`;
  }
  loginAgain() {
    return `Please login again`;
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
  block() {
    return `Your account has been locked, please contact administrator.`;
  }
  invalid(object: string) {
    return `Invalid ${object}`;
  }
  invalidToken() {
    return `Token is invalid, login again`;
  }
  expiredToken() {
    return `Token is expired, login again`;
  }
  fail(object?: string) {
    return `${object} fail`;
  }
  depend() {
    return 'The item you want to delete depends on another items, please check again.';
  }
  doNotAdmin() {
    return `You cannot delete users who are administrators.`;
  }
}

export default new Exception();
