const test = require('ava')
// const sinon = require('sinon')
const { map } = require('rxjs/operators')
const Iextrading = require('./iextrading')

test('signal for buy or sell', t => {
  // const sandbox = sinon.sandbox.create()
  const iextrading = Iextrading()

  return iextrading.stock(['FB', 'AAPL'])
    .pipe(map(res => {
      t.log(res)
      t.pass()
    }))
})
