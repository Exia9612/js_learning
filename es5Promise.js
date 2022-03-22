// function Promise(fn) {
//   var value
//   var state = 'pending'
//   var callback = null

//   function resolve(newValue) {
//     value = newValue
//     state = 'resolved'
//   }

//   function handle(handler) {
//     var returnValue = handler.onResolved(value)

//     handler.resolve(returnValue)
//   }

//   this.then = function (onResolved) {
//     return new Promise(function (resolve) {
//       handle({
//         onResolved: onResolved,
//         resolve: resolve
//       })
//     })
//   }

//   fn(resolve)
// }

// function doSomething() {
//   return new Promise(function(resolve) {
//     resolve(66)
//   })
// }

// const p1 = doSomething()
// console.dir(p1)

// doSomething()
//   .then(function (data) {
//     console.log('Got a value:' + data)
//     return 88
//   })
//   .then(function (data) {
//     console.log('Got second value:' + data)
//   })

class Promise {
  callbacks = [];
  state = 'pending';//增加状态
  value = null;//保存结果
  constructor(fn) {
      fn(this._resolve.bind(this));
  }
  then(onFulfilled) {
      return new Promise(resolve => {
        // 箭头函数在then执行时被定义，所以this是调用then的this
        // _handle是确定了状态的_handle
        // onFulfilled是then中的回调函数
        // 是第二个未确定状态的promise在constructor中执行环境绑定了自身后的resolve
          this._handle({
              onFulfilled: onFulfilled || null,
              resolve: resolve
          });
      });
  }
  _handle(callback) {
    // handle的this是上一个promise
      if (this.state === 'pending') {
          this.callbacks.push(callback);
          return;
      }
      //如果then中没有传递任何东西
      if (!callback.onFulfilled) {
          callback.resolve(this.value);
          return;
      }
      // 执行then中的回调函数，拿到结果，然后将结果作为新的promise的value
      // 通过将上一个promise的值在than的回调函数中处理，得到回调的结果，然后作为下一个promise的value。
      // 将两个promise串联起来
      var ret = callback.onFulfilled(this.value);
      callback.resolve(ret);
  }
  _resolve(value) {
    if (value && (typeof value === 'object' || typeof value === 'function')) {
      var then = value.then;
      if (typeof then === 'function') {
        // 如果返回值是一个promise或一个thenable方法，根据A+规范，该promise的value应该是返回的promise的value
        // 拿到返回的promise的then方法，调用它，该then方法的onfullfilled是接受promise返回的promise的resolve
        // 当返回的promise的解决后(更新了value)后，再通过原先promise的resolve把解决的值传参进去，使原先promise的解决值相同
        then.call(value, this._resolve.bind(this));
        return;
      }
    }

    this.state = 'fulfilled';//改变状态
    this.value = value;//保存结果
    this.callbacks.forEach(callback => this._handle(callback));
  }
}

let p = new Promise(resolve => {
  setTimeout(() => {
      console.log('done');
      resolve('5秒');
  }, 5000);
}).then(tip => {
  console.log('then1', tip);
  return new Promise(resolve => {
    resolve(88)
  })
})


const pUserId = new Promise(resolve => {
  mockAjax('getUserId', 1, function (result) {
    resolve(result);
  })
})
const pUserName = new Promise(resolve => {
  mockAjax('getUserName', 2, function (result) {
    resolve(result);
  })
})

pUserId.then(id => {
  console.log(id)
  return pUserName
}).then(name => {
  console.log(name)
})
