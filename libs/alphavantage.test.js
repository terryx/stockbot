const test = require('ava')
const sinon = require('sinon')
const request = require('request-promise')
const { map } = require('rxjs/operators')
const AlphaVantageAPI = require('./alphavantage')
const config = require('../config.dev')()

test('alphaVantage should return above threshold limit', t => {
  const data = {
    'Meta Data': {
      '1: Symbol': 'NFLX',
      '2: Indicator': 'Relative Strength Index (RSI)',
      '3: Last Refreshed': '2018-04-11 16:00:00',
      '4: Interval': '5min',
      '5: Time Period': 14,
      '6: Series Type': 'close',
      '7: Time Zone': 'US/Eastern Time'
    },
    'Technical Analysis: RSI': {
      '2018-04-11 16:00': {
        'RSI': '75.6565'
      },
      '2018-04-11 15:55': {
        'RSI': '40.1691'
      },
      '2018-03-28 10:40': {
        'RSI': '37.2748'
      }
    }
  }

  // sinon.stub(request, 'get').returns(Promise.resolve(data))
  const alphaVantage = AlphaVantageAPI(config.alphavantage.apiKey)
  const source = alphaVantage
    .rsi(config.alphavantage.symbols, config.alphavantage.rsi)
    .pipe(map(res => {
      t.pass()
    }))

  return source
})
