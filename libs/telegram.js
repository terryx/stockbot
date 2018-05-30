const Telegram = require('telegraf/telegram')
const { from } = require('rxjs')

const constructor = (token) => {
  const api = {}
  const bot = new Telegram(token)

  api.sendMessage = (chatId, message, opts = {}) => {
    return from(bot.sendMessage(chatId, message, opts))
  }

  return api
}

module.exports = constructor
