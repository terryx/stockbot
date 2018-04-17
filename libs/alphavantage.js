const request = require('request-promise')
const numeral = require('numeral')
const { from } = require('rxjs/observable/from')
const { fromPromise } = require('rxjs/observable/fromPromise')
const { mergeMap, filter, take, map, toArray } = require('rxjs/operators')

const constructor = (apiKey) => {
  const http = request.defaults({
    headers: {
      'Content-Type': 'application/json'
    },
    baseUrl: 'https://www.alphavantage.co',
    json: true
  })

  const api = {}

  // please refer to https://www.alphavantage.co/documentation for full query params
  const query = (symbols, opts = {}) => {
    const source = from(symbols)
      .pipe(mergeMap(symbol => {
        const qs = Object.assign({ apikey: apiKey, symbol }, opts)

        return fromPromise(http.get('/query', { qs }))
      }))

    return source
  }

  api.rsi = (symbols = [], opts = {}) => {
    const source = query(symbols, opts.query)
      .pipe(mergeMap(data =>
        from(Object.keys(data['Technical Analysis: RSI']))
          .pipe(map(datetime => data['Technical Analysis: RSI'][datetime].RSI))
          .pipe(take(1))
          .pipe(filter(rsi => (numeral(rsi).value() >= opts.alert.high) || (numeral(rsi).value() <= opts.alert.low)))
          .pipe(map(rsi => ({ symbol: data['Meta Data']['1: Symbol'], rsi })))
      ))
      .pipe(toArray())

    return source
  }

  return api
}

module.exports = constructor
