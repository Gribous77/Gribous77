const Discord = require('discord.js')
const client = new Discord.Client()
const prefix = "^"
const fs = require("fs")
const ffmpeg = require('ffmpeg-static')
const ytdl = require('ytdl-core')
const youtube = require('simple-youtube-api')
const api = new youtube("AIzaSyBjohheIL3ZfHmso2ShJeXcUkeBkEggu3k")

const list = []
const list2 = []
const loop = ["1"]

client.on('ready', () => {
  console.log(`online`)
})

client.on('message', async msg => {
  if (msg.content.startsWith("?play")) {
    const args = msg.content.split("?play ")
    if (msg.member.voice.channel) {
      if (args === undefined) {
        const embed = new Discord.MessageEmbed()
        .setColor("FF3333")
        .setDescription("Veuillez entrer une recherche !")
        msg.channel.send(embed)
      }
      else {
        api.searchVideos(args).then(results => {
          if (list2.lenght > 0) {
            list.push(results[0].title)
          }
          else {
            list2.push(results[0].title)
          }
          if (list.lenght > 0) {
            list.push("https://www.youtube.com/watch?v=" + results[0].id)
            const embed = new Discord.MessageEmbed()
            msg.channel.send("**Added to Queue")
          }
          else {
            list.push("https://www.youtube.com/watch?v=" + results[0].id)
            msg.channel.send("**Added to Queue**")
          }
          msg.channel.send(":mag_right: **Searching** `" + args + "`")
          msg.channel.send("**Find** `https://www.youtube.com/watch?v=" + results[0].id + "`")
          const embed = new Discord.MessageEmbed()
          .setAuthor("Youtube")
          .setTitle(results[0].title)
          .setURL("https://www.youtube.com/watch?v=" + results[0].id)
          .setColor("FF0000")
          .setImage("https://i.ytimg.com/vi/"+ results[0].id + "/mqdefault.jpg")
          msg.channel.send(embed)
          if (list.length < 2) {
            Play(msg)
          }    
        })
      }
    }
    else {
      const embed = new Discord.MessageEmbed()
      .setColor("FF3333")
      .setDescription("Vous devez être connecté à un salon vocal !")
      msg.channel.send(embed)
    }
  }
  if (msg.content === "?disconnect") {
    msg.channel.send(":wave: **Disconnected from** `" + msg.member.voice.channel.name + "`")
    setTimeout(function() {
      msg.member.voice.channel.leave()
    }, 100)
  }
  if (msg.content === "?list") {
    msg.channel.send("**List: **")
    for (var i = 0;i < list2.length;i++) {
      msg.channel.send(i + " - "  + list2[i])
    }
  }
  if (msg.content === "?listurl") {
    msg.channel.send("**List URL: **")
    for (var i = 0;i < list.length;i++) {
      msg.channel.send(i + " - `"  + list[i] + "`")
    }
  }
  if (msg.content === "?skip") {
    msg.channel.send(":fast_forward: Skipped !")
    list.shift()
    list2.shift()
    Play(msg)
  }
  if (msg.content === "?pause") {
    Pause(msg)
  }
  if (msg.content === "?resume") {
    Resume(msg)
  }
  if (msg.content.startsWith("?loop")) {
    const args = msg.content.split(" ")
    if (args[1] === "on") {
      loop.shift()
      msg.channel.send(":arrows_counterclockwise: **Enable**")
    }
    if (args[1] === "off") {
      loop.push("1")
      msg.channel.send(":arrows_counterclockwise: **Disable**")
    }
    else if (!args[1]) {
      const embed = new Discord.MessageEmbed()
      .setColor("FF8000")
      .setTitle("Veuillez préciser: ")
      .setDescription("[ on ] / [ off ]")
      msg.channel.send(embed)
    }
  }
})

client.login(process.env.token)

async function Play(msg) {
  msg.member.voice.channel.join().then(connection => {
    connection.on("disconnect", () => {
      list = []
      list2 = []
      loop = ["1"]
    })
    const dispatcher = connection.play(ytdl(list[0], { quality: "highest" }))
    dispatcher.on('start', () => {
      msg.channel.send(":notes: **Playing **`" + list2[0] + "`")
    })
    dispatcher.on('finish', () => {
      dispatcher.destroy()
      if (list.length > 0) {
        if (loop.includes("1")) {
          list.shift()
          list2.shift()
        }
        Play(msg)
      }
      else {
        msg.member.voice.channel.leave()
      }
    })
  })
}
function Pause(msg) {
  msg.channel.send(":pause_button: **Paused**")
  msg.member.voice.channel.join().then(connection => {
    const dispatcher = connection.play(ytdl(list[0], { quality: "highest" }))
    dispatcher.pause()
  })
}
function Resume(msg) {
  msg.channel.send(":arrow_forward: **Resumed**")
  msg.member.voice.channel.join().then(connection => {
    const dispatcher = connection.play(ytdl(list[0], { quality: "highest" }))
    dispatcher.resume()
  })
}
