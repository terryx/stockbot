const { reduce, mergeMap } = require('rxjs/operators')
const { from } = require('rxjs/observable/from')
const AlphaVantageAPI = require('../libs/alphavantage')
const Telegram = require('../libs/telegram')
const config = require(`../config.${process.env.STAGE}`)()

const index = (event, context, callback) => {
  const telegram = Telegram(config.telegram.token)
  const alphavantage = AlphaVantageAPI(config.alphavantage.apiKey)

  const source = alphavantage
    .rsi(config.alphavantage.symbols, config.alphavantage.rsi)
    .pipe(mergeMap(res => from(res)))
    .pipe(reduce((acc, cur) => {
      acc.push(`${cur.symbol} ${cur.rsi}`)

      return acc
    }, []))
    .pipe(mergeMap(res => {
      const chatId = config.telegram.channel
      const content = res.join('\n')
      const opts = { parse_mode: 'HTML' }

      return telegram.sendMessage(chatId, content, opts)
    }))

  return source.subscribe(console.log, console.log)
}

module.exports = { index }
