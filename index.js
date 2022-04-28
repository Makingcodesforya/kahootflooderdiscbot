require('dotenv').config();
const Eris = require('eris');
const Kahoot = require("kahoot.js-updated");
const client = new Kahoot();
const Chance = require('chance');
const chance = new Chance();

const bot = new Eris(process.env.TOKEN);

bot.on('ready', () => {
    console.log(`${bot.user.username}#${bot.user.discriminator} is online`)
});

bot.on('messageCreate', async (message) => {
    const mentionRegexPrefix = RegExp(`^<@!?${bot.user.id}>`);

    if (!message || !message.member || message.member.bot) return;

    const prefix = message.content.match(mentionRegexPrefix) ?
        message.content.match(mentionRegexPrefix)[0] : process.env.PREFIX;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
if (command === 'help') {
        message.channel.createMessage('Type +join To Flood A Kahoot!')
}
    if (command === 'join') {
        let pin = args[0];
        let botAmount = args[1] || 500;
        if (!args.length) return message.channel.createMessage('You need to provide me the kahoot\'s pin!');
        if (!args[0].match(/^[0-9]+$/)) return message.channel.createMessage('You can only provide numbers!')
        if (botAmount > 500) return message.channel.createMessage('You can only send maximum of 500 bots!')

        let msg = await message.channel.createMessage(`Trying to send ${botAmount} bots to \`${args[0]}\``);

        [...Array(parseInt(botAmount)).keys()].map(() => {
            const bots = new Kahoot();
            const name = chance.name();

            bots.join(pin, name).catch(err =>  { return; })

            bots.on("Joined", () => {
                console.log(`${pin}: ${name} Joined successfully`)
            })

            bots.on("Disconnect", reason => {
                console.log(`${pin}: ${name} Disconnected from the game for reason ${reason}`)
            })

            bots.on("QuestionStart", question => {
                question.answer(Math.floor(Math.random() * 4))
            });

            return bots;
        });

        client.join(pin, chance.name()).catch(err => {
            msg.edit('Sorry, an error has occured. Is the PIN correct?')
        }) // join as someone so it wont spam console logs and messages

        client.on("QuizStart", () => {
            console.log(`${pin}: Quiz is starting`)
            message.channel.createMessage(`${pin}: The quiz is about to start!`)
        });

        client.on("GameReset", () => {
            console.log(`${pin}: Game has been reset`)
            message.channel.createMessage(`${pin}: Game has been reset`)
        });

        client.on("QuestionStart", question => {
            message.channel.createMessage(`${pin}: A new question has started. Answering randomly`)
            console.log(`${pin}: New question has started`);
            question.answer(Math.floor(Math.random() * 4))
        });

        client.on("QuizEnd", () => {
            message.channel.createMessage(`${pin}: The quiz has ended..`)
            console.log(`${pin}: The quiz has ended.`);
        });
    }
});

bot.connect();
