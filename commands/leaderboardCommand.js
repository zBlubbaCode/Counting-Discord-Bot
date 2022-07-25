module.exports = {
    name: 'leaderboardCommand',
    execute(interaction, Discord, user, leaderboardFile, fs) {
        const getFooterName = 'Made by zBlubba#9820 ❤';
        const getFooterImage = 'https://cdn.discordapp.com/avatars/406763173677498369/bb80a290f8abbbd1530992bbce17826a.png?size=4096';

        console.log("1")

        if (user == "null") {
            console.log("2")

            let leaderMessage = "";
            for (let i = 0; i < 10; i++) {
                let memberId = Object.keys(leaderboardFile)[i]
                if (typeof leaderboardFile[memberId] == undefined) {
                    leaderMessage = leaderMessage + "**" + i + 1 + ".** undefiniert  - 0" + ">\n"
                    console.log("null")
                } else {
                    if (memberId) {
                        let place = parseInt(i + 1)
                        let counter = leaderboardFile[memberId].count
                        leaderMessage = leaderMessage + "**" + place + ".** <@" + memberId + `> - ${counter}` + "\n"
                    }
                }


            }

            let embed = new Discord.MessageEmbed().setColor("GREEN").setFooter({text: getFooterName, iconURL: getFooterImage})
                .setDescription("**Leaderboard des Countings**\n\n" + leaderMessage)

            interaction.reply({ embeds: [embed] })

        } else {

            let userId = user.id

            if(leaderboardFile[userId] == null) {
                leaderboardFile[userId] = {
                    count: 0
                }
                fs.writeFile("./leaderboard.json", JSON.stringify(leaderboardFile), function (err) {
                    if (err) console.log(err)
                })
            }

            let place;
            for(let i = 0; i < Object.keys(leaderboardFile).length; i++) {
                if(Object.keys(leaderboardFile)[i] == userId) {
                    place = i + 1
                }
            }

            let count = leaderboardFile[userId].count
            let embed = new Discord.MessageEmbed().setColor("GREEN").setFooter({text: getFooterName, iconURL: getFooterImage})
            .setDescription(`**Leaderboard des Countings**\n\n**${place}** <@${userId}> - ${count}`)
            interaction.reply({embeds: [embed]})
        }

    }
}