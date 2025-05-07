pm.test("Status code is 200", function () {
    pm.response.to.have.status;
    const {access, refresh} = pm.response.json().data;
    pm.environment.set("access-token", access);
    pm.environment.set("refresh-token", refresh);
});