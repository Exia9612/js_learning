const Mypromise = require('./Mypromise')

let promise1 = new Mypromise((resolve, reject) => {
  resolve('promise1')
  // reject('rejected')
  // throw new Error('falied')
})

console.log(promise1)

let promise2 = promise1.then((value) => {
  return new Mypromise((resolve, reject) => {
    setTimeout(() => {
      resolve('new promise')
    }, 2000)
  })
}, (reason) => {
  return reason
})

// promise2.then().then((value) => {
//   console.log(value)
// }, (reason) => {
//   console.log(reason)
// })