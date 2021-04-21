const {
  EE_BANS_HOST,
  EE_BANS_USER,
  EE_BANS_PW,
  EE_BANS_DB,
} = require("../config")

const { is_admin } = require("../functions")

module.exports = {
  name: "ban",
  description: "ban command.",
  args: [
    { name: "`<name>`", value: "*player's name*", inline: false },
    { name: "`<steamid>`", value: "*player's steamid*", inline: false },
    {
      name: "`<time>`",
      value: "*ban time in minutes (0 = permanent)*",
      inline: false,
    },
    { name: "`<reason>`", value: "*ban reason*", inline: false },
  ],
  usage: "e!ban <name> <steamid> <time> <reason>",
  cooldown: 5,
  footer: "PLEASE THINK TWICE BEFORE USING THIS COMMAND",
  disabled: true,
  execute(message, args, client) {
    if (message.channel.type != "dm" && !is_admin(message)) {
      return message.reply(
        "hmmm you have no permission to use this command  👨‍🦲"
      )
    }

    if (message.channel.id != "825754706390286386") {
      return message.reply(
        "❌  **wrong usage**, this command is only available on **`#bans`** chat  😾"
      )
    }

    if (args.length < 3) {
      return message.reply(
        "❌  **wrong usage**, please check **`e!help ban`**  😾"
      )
    }

    var mysql = require("mysql")
    var connection = mysql.createConnection({
      host: EE_BANS_HOST,
      user: EE_BANS_USER,
      password: EE_BANS_PW,
      database: EE_BANS_DB,
    })

    const name = args.shift()
    const steamid = args.shift()
    const time = args.shift()
    const reason = args.join(" ")

    if (isNaN(time)) {
      return message.reply(
        "❌  **error! `<time>`** argument needs to be number, please check **``e!help ban``**  ❌"
      )
    } else if (!isNaN(name)) {
      return message.reply(
        "❌  **error! `<name>`** argument invalid, please check **``e!help ban``**  ❌"
      )
    } else if (!isNaN(steamid)) {
      return message.reply(
        "❌  **error! `<steamid>`** argument invalid, please check **``e!help ban``**  ❌"
      )
    } else if (!isNaN(reason)) {
      return message.reply(
        "❌  **error! `<reason>`** argument invalid, please check **``e!help ban``**  ❌"
      )
    }

    let query_check =
      "SELECT steam_id, ban_length FROM eraevil_bans WHERE steam_id = '" +
      steamid +
      "'"

    connection.connect()
    connection.query(query_check, function (error, results, fields) {
      if (error) console.log(error)
      if (results.length) {
        return message.reply(
          "🚷  user **`" + steamid + "`** is already banned  🚷"
        )
      } else {
        // todo: fix this ban query (get admin name that banned)
        let query_ban =
          "REPLACE INTO eraevil_bans (player_name, steam_id, ban_length, ban_reason, banned_by, timestamp) VALUES ( '" +
          name +
          "', '" +
          steamid +
          "', '" +
          time +
          "', '" +
          reason +
          "', 'discord admin', CURRENT_TIMESTAMP())"
        connection.query(query_ban, function (error, results, fields) {
          if (error) {
            console.log(query_ban)
            console.log(error)
          } else {
            let bantime = time == 0 ? "permanently" : time + " minutes"
            message.reply(
              "❌  you have banned **`" + steamid + "`** (" + bantime + ")  ❌"
            )
          }
        })
      }
      connection.end()
    })
  },
}
