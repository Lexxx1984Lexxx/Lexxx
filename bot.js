const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();

// Токен бота (получи у @BotFather)
const BOT_TOKEN = process.env.BOT_TOKEN || 'ВСТАВЬ_ТВОЙ_ТОКЕН';

// Создаем бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// База данных (в памяти для начала)
const db = new sqlite3.Database(':memory:');

// Инициализация БД
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ База данных инициализирована');
});

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const text = `
Привет, ${msg.from.first_name}! 👋

Я бот для сохранения сообщений для NFT на TON!

Команды:
/save [текст] - сохранить сообщение
/list - показать все сообщения  
/mint - создать NFT (скоро!)

Просто напиши /save и своё сообщение!
  `;
  bot.sendMessage(chatId, text);
});

// Команда /save
bot.onText(/\/save (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const userId = msg.from.id;

  db.run(
    'INSERT INTO messages (user_id, text) VALUES (?, ?)',
    [userId, text],
    function(err) {
      if (err) {
        console.error('Ошибка сохранения:', err);
        bot.sendMessage(chatId, '❌ Ошибка сохранения');
      } else {
        console.log(`Сообщение сохранено для пользователя ${userId}`);
        bot.sendMessage(chatId, '✅ Сообщение сохранено для будущего NFT!');
      }
    }
  );
});

// Команда /list
bot.onText(/\/list/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  db.all(
    'SELECT text FROM messages WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Ошибка загрузки:', err);
        bot.sendMessage(chatId, '❌ Ошибка загрузки сообщений');
        return;
      }

      if (rows.length === 0) {
        bot.sendMessage(chatId, '📭 Нет сохраненных сообщений');
        return;
      }

      let response = '📋 Твои сообщения для NFT:\n\n';
      rows.forEach((row, index) => {
        response += `${index + 1}. ${row.text}\n`;
      });

      response += '\n🎨 Скоро можно будет превратить их в NFT!';
      bot.sendMessage(chatId, response);
    }
  );
});

// Команда /mint
bot.onText(/\/mint/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🚀 Функция NFT минтинга на TON в разработке! Оставайся на связи!');
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});

console.log('🤖 Бот запущен и работает...');
