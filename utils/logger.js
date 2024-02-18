const infor = (...params) => {
    console.log(...params)
}

const error = (...mess) => {
    console.log(...mess)
}

module.exports = {infor, error}