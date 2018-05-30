const { mergeMap, filter, map, tap } = require('rxjs/operators')
const Iextrading = require('../libs/iextrading')
const Telegram = require('../libs/telegram')
const config = require(`../config.${process.env.STAGE}`)()

const index = (event, context, callback) => {
  const telegram = Telegram(config.telegram.token)
  const iextrading = Iextrading()

  const source = iextrading
    .stock(config.iextrading.symbols)
    .pipe(
      tap(res => console.log(res)),
      filter(res => parseFloat(res.ADX) >= 25),
      filter(res => parseFloat(res.ULTOSC) >= 70 || parseFloat(res.ULTOSC) <= 30),
      filter(res => parseFloat(res.RSI) >= 70 || parseFloat(res.RSI) <= 30)
    )
    .pipe(map(res => {
      const content = []
      content.push(`<b>${res.symbol.toUpperCase()}</b>`)
      content.push(`ADX: ${res.ADX}`)
      content.push(`RSI: ${res.RSI}`)
      content.push(`ULTOSC: ${res.ULTOSC}`)

      if (res.ULTOSC >= 70) {
        content.push('<b>STRONG BUY</b>')
      }

      if (res.ULTOSC <= 30) {
        content.push('<b>STRONG SELL</b>')
      }

      return content.join('\n')
    }))
    .pipe(mergeMap(content => {
      const chatId = config.telegram.channel
      const opts = { parse_mode: 'HTML' }

      return telegram.sendMessage(chatId, content, opts)
    }))

  return source.subscribe(
    (res) => console.log(res),
    (err) => console.log(err),
    () => callback(null)
  )
}

module.exports = { index }
