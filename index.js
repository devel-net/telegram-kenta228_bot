const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const yaml = require('js-yaml');

const token = '1649577220:AAHKfZv8DC1wQiNyiP-hlKJXbLG3341fBB8';

const bot = new TelegramBot(token, {
    polling: true
})
const items = yaml.load(fs.readFileSync(`items` + '.yaml', 'utf8'));
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
const inventory = [

]
const action = [
  [
    {
      text: '\ud83d\udcbc Инвентарь', // текст на кнопке
      callback_data: 'inventory' // данные для обработчика событий
    }
  ],
  [
    {
      text: '\ud83d\udcbb Выйти в рейд',
      callback_data: 'inraid'
    }
  ],
  [
    {
      text: '\ud83d\udcda Профиль',
      callback_data: 'profile'
    }
  ]
];
const keyboard = [
  [
    {
      text: '\ud83d\udcda Профиль', // текст на кнопке
      callback_data: 'profile' // данные для обработчика событий
    }
  ],
  [
    {
      text: '\ud83e\udd96 Персонаж',
      callback_data: 'character'
    }
  ]
];
bot.onText(/\/members/, (msg, match) => {
  let message = `Игроки в беседе\n`;
  var members = bot.getChatMembersCount(msg.chat.id).members;
  console.log(members);
  for(i=0; i<members;i++){
    console.log(msg.new_chat_members);
    //console.log(users);
  }
});

bot.onText(/начать/, (msg, match) => {
  const chatId = msg.chat.id;
  try{
    const setupProfile = {
      data: {
        name: `${msg.from.username}`,
        money: 100,
        vip: 0,
        characher: 0,
        characherName: `Strawberry`,
        characterSquad: `${getRandomInt(2) == 0 ? 'Bear' : 'Usec'}`
      }
    };
    
    fs.mkdir(`accounts/${msg.from.username}`, (err) => { 
      if (err) { 
          return console.error(err); 
      } 
      console.log('Directory created successfully!'); 

      fs.writeFile(`accounts/${msg.from.username}/`+`profile` +'.yaml', yaml.dump(setupProfile), 'utf8', err => {
        if (err) console.log(err);
      });
      fs.writeFile(`accounts/${msg.from.username}/`+`inventory` +'.yaml', yaml.dump(inventory), 'utf8', err => {
        if (err) console.log(err);
      });
    });
    
  }catch(e){
    console.log(e);
  }
  bot.sendMessage(chatId, "Профиль игры создан", {
    reply_markup: {
      inline_keyboard: keyboard
    }
  }); 
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    switch(query.data.toString())
    {
      case 'profile': {
        try {
          const profile = yaml.load(fs.readFileSync(`accounts/${query.from.username}/` + `profile` + '.yaml', 'utf8'));
          console.log(profile);
          let message = `Имя пользователя: ${profile.data.name}\nДеньги: ${profile.data.money} \ud83d\udcb5 \nV.I.P Статус: ${profile.data.vip == 0 ? 'Не имеет вип статуса' : 'Уровень: ' + profile.data.vip}\nСквад: ${profile.data.characterSquad}`
          bot.sendPhoto(chatId, `img/${profile.data.characterSquad}.png`, {
            caption: message,
            reply_markup: {
              inline_keyboard: action
            }
          });
          break;
        } catch (e) {
          console.log(e);
        }
      } 
      case 'inraid': {
        bot.sendMessage(chatId, "Рейды в разработке");
        addItems(query.from.username, 0);
        break;
      }
      case 'inventory': {
        let message = `<u>Ваш инвентарь</u>\n`;
        let smiles = getSmiels(query.from.username);
        const inventory = getInventoryData(query.from.username);
        for(i=0;i<inventory.length;i++){
          message+= `${i+1} ${smiles[i]}<strong> ${inventory[i].descrip}</strong>\n\t<i>Занимает места - ${inventory[i].size}</i>\n\t<i>Стоимость - <strong>${inventory[i].price} RUB</strong></i>\n`;
        }
        bot.sendPhoto(chatId, "img/inventory.png", {
          parse_mode: 'HTML',
          caption: message,
          reply_markup: {
            inline_keyboard: action
          }
        });
      } 
    }
});
function getSmiels(username){
  const temp = getInventoryData(username);
  const tempSmiles = [];
  for(i=0;i<temp.length;i++){
    switch(temp[i].type){
      case 'gun':{
        tempSmiles.push('\ud83d\udd2b');
        break;
      }
      case 'keycard':{
        tempSmiles.push("\ud83d\udcb3");
        break;
      }
      default: {
        tempSmiles.push("\ud83e\uddfb");
        break;
      }
    }
  }
  return tempSmiles;
}
function addItems(username, object){
  const inv = yaml.load(fs.readFileSync(`accounts/${username}/` + `inventory` + '.yaml', 'utf8'));
  inv.push(items[object]);
  const itemsInInventory = inv;
  fs.writeFileSync(`accounts/${username}/inventory.yaml`,yaml.dump(itemsInInventory), 'utf8', err => {
    if (err) console.log(err);
  });
}
function getInventoryData(username){
  return yaml.load(fs.readFileSync(`accounts/${username}/` + `inventory` + '.yaml', 'utf8'));
}