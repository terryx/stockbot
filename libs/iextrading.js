const talib = require('talib')
const request = require('request-promise')
const { from, bindNodeCallback, zip } = require('rxjs')
const { mergeMap, reduce, takeLast, filter, map } = require('rxjs/operators')

const constructor = (apiKey) => {
  const http = request.defaults({
    headers: {
      'Content-Type': 'application/json'
    },
    baseUrl: 'https://api.iextrading.com/1.0/',
    json: true
  })

  const build = (data) => {
    const structure = {
      open: [],
      close: [],
      high: [],
      low: [],
      volume: []
    }

    return from(data)
      .pipe(
        filter(res => res.numberOfTrades > 0),
        reduce((acc, cur) => {
          acc.open.push(cur.open)
          acc.close.push(cur.close)
          acc.high.push(cur.high)
          acc.low.push(cur.low)
          acc.volume.push(cur.volume)

          return acc
        }, structure),
        filter(data => data.close.length > 0)
      )
  }

  const api = {}

  const adx = (data) => {
    const source = bindNodeCallback(talib.execute)({
      name: 'ADX',
      startIdx: 0,
      endIdx: data.close.length - 1,
      optInTimePeriod: 14,
      close: data.close,
      high: data.high,
      low: data.low
    })
      .pipe(
        mergeMap(res => from(res.result.outReal)),
        takeLast(1)
      )

    return source
  }

  const rsi = (data) => {
    const source = bindNodeCallback(talib.execute)({
      name: 'RSI',
      startIdx: 0,
      endIdx: data.close.length - 1,
      optInTimePeriod: 14,
      inReal: data.close
    })
      .pipe(
        mergeMap(res => from(res.result.outReal)),
        takeLast(1)
      )

    return source
  }

  const ultosc = (data) => {
    const source = bindNodeCallback(talib.execute)({
      name: 'ULTOSC',
      startIdx: 0,
      endIdx: data.close.length - 1,
      optInTimePeriod1: 7,
      optInTimePeriod2: 14,
      optInTimePeriod3: 28,
      high: data.high,
      low: data.low,
      close: data.close
    })
      .pipe(
        mergeMap(res => from(res.result.outReal)),
        takeLast(1)
      )

    return source
  }

  api.stock = (symbols) => {
    const source = from(symbols)
      .pipe(mergeMap(symbol => from(http.get(`stock/${symbol}/chart/1d`))
        .pipe(
          filter(data => data.length >= 100),
          mergeMap(data => build(data))
        )
        .pipe(mergeMap(data => zip(
          adx(data),
          rsi(data),
          ultosc(data)
        )))
        .pipe(map(([ADX, RSI, ULTOSC]) => ({ symbol, ADX, RSI, ULTOSC })))
      ))

    return source
  }

  return api
}

module.exports = constructor
