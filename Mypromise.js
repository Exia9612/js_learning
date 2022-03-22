const PENDING = 'pending'
const FULLFILLED = 'fullfilled'
const REJECTED = 'rejected'

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }

  let called = false

  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then
      if (typeof then === 'function') {
        // promise大概率
        then.call(x, (y) => {
          if (called) return
          called = true
          resolvePromise(promise2, y, resolve, reject)
        }, (r) => {
          if (called) return
          called = true
          reject(r)
        })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

class Mypromise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onFulfilledCallbacks = []
    this.onRejectedCallbakcs = []

    // 每一个promise都应该有自己的resolve和rejected，不应该定义在原型上
    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULLFILLED
        this.value = value
        // 发布
        this.onFulfilledCallbacks.forEach(fn => fn())
      }
    }
    const reject = (value) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        this.onRejectedCallbakcs.forEach(fn => fn())
      }
    }

    try {
      // 传入的executor函数需要两个函数作为参数传入
      executor(resolve, reject)
    } catch(error) {
      reject(error)
    }
  }

  then(onFulfilled, onRejected) {
    // 成功条件
    // return js value(普通的javascript value)
    // return 新的promise成功态结果
    // 失败条件
    // then return 新的promise失败态原因
    // 抛出一个错误throw new Error
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
    let promise2 = new Mypromise((resolve, reject) => {
      // 尖头函数的this在定义时确定，此时与then的this相同，都是promise1
      if (this.status === FULLFILLED) {
        setTimeout(() => { 
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(e)
          }
        }, 0)
      }
      if (this.status === PENDING) {
        // 当executor中异步调用resolve或reject时，直接执行then方法时，promise实例的status状态是pending
        // then在微任务队列中执行，将onFulfilled和onRejected推入执行队列中，等待在宏任务中的resolve或reject执行
        // 订阅
        console.log('pending')
        this.onFulfilledCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
        this.onRejectedCallbakcs.push(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
    })
    return promise2
  }

  catch (errorCallback) {
    return this,then(null, errorCallback)
  }
}

module.exports = Mypromise