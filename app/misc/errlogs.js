var errLog = {
    dbErr: "DB not found",

    getDbErr() {
        return this.dbErr;
    },

    setDbErr(errMsg) {
        console.log(errMsg)
        this.dbErr = errMsg;
    }
}

exports.errLog = errLog