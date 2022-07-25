console.log("Starting...");

let leaderboardFile = require('./leaderboard.json');
let counterFile = require('./counter.json');

const Discord = require("discord.js");
const fs = require("fs");
const slash = require('slash_commands.js');
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ]
})

let reactionCount = 0;
let failMessage;
let failEmbedMessage;

const getFooterName = 'Made by zBlubba#9820 ❤';
const getFooterImage = 'https://cdn.discordapp.com/avatars/406763173677498369/bb80a290f8abbbd1530992bbce17826a.png?size=4096';

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}

client.once('ready', async () => {
  console.log("Bot is online on " + client.guilds.cache.size + " Servers!")
  client.user.setActivity('Schäfchen zählen', { type: 'PLAYING' });
})


//Slash Commands

let userOption = new slash.slashOption()
  .setName("user")
  .setDescription("OPTIONAL - Die stats von welchem Spieler angezeigt werden sollen")
  .setRequired(false)
  .setType("user")

new slash.guildSlashCommand(client)
  .setName("leaderboard")
  .setGuildID("490160461854277652")
  .setDescription("Zeigt dir die besten Spieler an. Du kannst aber auch deine Stats sehen.")
  .addOptions([userOption])
try {

  client.on('interactionCreate', async (interaction) => {
    console.log("1000")
    if (interaction.isCommand) {
      if (interaction.commandName == "leaderboard") {
        console.log("10")
        let user;
        if(interaction.options.getUser("user") != null) {
          console.log("20")
          user = interaction.options.getUser("user")
        } else user = "null"
        console.log("30")
        client.commands.get("leaderboardCommand").execute(interaction, Discord, user, leaderboardFile, fs);
      }
    }
  })

  client.on('messageCreate', async (message) => {
    if (message.member.bot) return;
    let counter = counterFile.counter

    if (message.channel.id == counterFile.counterChannelID) {
      if (isNumeric(message.content)) {
        //if (message.member.id == counterFile.lastUser) {
        //  failMessage = message;
        //  let failUserEmbed = new Discord.MessageEmbed().setColor("RED").setFooter({ text: getFooterName, iconURL: getFooterImage })
        //    .setDescription(`<@${message.member.id}> hat 2x hintereinander geschrieben. Damit wurde der Counter bei **${counterFile.counterBeforeFail}** ruiniert!\nWenn ihr der Meinung seid, dass es ein Troll ist, müssen \`${counterFile.reactionsToDelete}\` Spieler mit :x: reagieren, um den Counter um 1 zurückzusetzen!\n\nDie nächste Zahl ist **1**\nWenn jemand jedoch bei 1 wieder anfängt, kann es nicht mehr zurückgesetzt werden.`)
        //  failEmbedMessage = await message.channel.send({ embeds: [failUserEmbed] })
        //  
        //  counterFile.counterBeforeFail = counter;
//
        //  message.react("❌")
        //  counter = 0;
        //  counterFile.counter = counter;
        //  counterFile.failMessageId = message.id
        //  fs.writeFile("./counter.json", JSON.stringify(counterFile), function (err) {
        //    if (err) console.log(err)
        //  })
        //  return;
        //}
        if (message.content == counter + 1) {

          message.react("✅")
          counter++;
          counterFile.counter = counter;
          counterFile.lastUser = message.member.id
          fs.writeFile("./counter.json", JSON.stringify(counterFile), function (err) {
            if (err) console.log(err)
          })
          if(leaderboardFile[message.member.id] == null) {
            leaderboardFile[message.member.id] = {
              count: 0
            }
            fs.writeFile("./leaderboard.json", JSON.stringify(leaderboardFile), function (err) {
              if (err) console.log(err)
            })
          }

          let memberCount = leaderboardFile[message.member.id].count
          leaderboardFile[message.member.id].count = memberCount + 1
          fs.writeFile("./leaderboard.json", JSON.stringify(leaderboardFile), function (err) {
            if (err) console.log(err)
          })

        } else {
          failMessage = message;

          let failEmbed = new Discord.MessageEmbed().setColor("RED").setFooter({ text: getFooterName, iconURL: getFooterImage })
            .setDescription(`<@${message.member.id}> hat bei der Zahl **${counterFile.counterBeforeFail}** den Counter ruiniert!\nWenn ihr der Meinung seid, dass es ein Troll ist, müssen \`${counterFile.reactionsToDelete}\` Spieler mit :x: reagieren, um den Counter um 1 zurückzusetzen!\n\nDie nächste Zahl ist **1**\nWenn jemand jedoch bei 1 wieder anfängt, kann es nicht mehr zurückgesetzt werden.`)
          failEmbedMessage = await message.channel.send({ embeds: [failEmbed] })

          counterFile.counterBeforeFail = counter;

          message.react("❌")
          counter = 0;
          counterFile.counter = counter;
          counterFile.failMessageId = message.id
          fs.writeFile("./counter.json", JSON.stringify(counterFile), function (err) {
            if (err) console.log(err)
          })

        }
      } else console.log("no number")
    } else console.log("wrong channel")
  })

  client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.channel.id == counterFile.counterChannelID) {
      if (reaction.message.id == counterFile.failMessageId) {
        reactionCount++;

        console.log(reactionCount)
        console.log(failMessage.id)

        if (reactionCount >= counterFile.reactionsToDelete) {
          
          failMessage.delete()
          failEmbedMessage.delete()

          let counterBeforeFail = counterFile.counterBeforeFail;
          console.log(counterBeforeFail)
          counterFile.counter = counterBeforeFail;

          fs.writeFile("./counter.json", JSON.stringify(counterFile), function (err) {
            if (err) console.log(err)
          })

          let newCounter = counterFile.counter;
          let newCounterEmbed = new Discord.MessageEmbed().setColor("RED").setFooter({ text: getFooterName, iconURL: getFooterImage})
          .setDescription(`Der Counter wurde auf **${newCounter}** zurückgesetzt!\nDie nächste Zahl ist: \`${newCounter + 1}\``)
          reaction.message.channel.send({embeds: [newCounterEmbed]})
        }
      }
    }
  })

  client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;

    if (reaction.channel.id == counterFile.counterChannelID) {
      if (reaction.message.id == counterFile.failMessageId) {
        reactionCount--;
      }
    }
  })

  function isNumeric(value) {
    return /^\d+$/.test(value);
  }
} catch (e) {
  console.log(e)
}

client.login("")