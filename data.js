// scam scenarios
// sys: true means system message (not from the scammer)
// terminal: true means the chat ends here

const scammers = [
  // tech support phishing
  {
    id: "support",
    name: "Служба поддержки",
    avatar: "🛡️",
    isSafe: false,
    startNode: "start",
    nodes: {
      start: {
        text: "Здравствуйте! Это служба безопасности. Ваш аккаунт пытались взломать. Срочно подтвердите данные.",
        actions: [
          { label: "Отвечаю: «Какие данные нужны?»", next: "ask_what", effect: {}, kind: "neutral" },
          { label: "Закрываю чат и проверяю аккаунт в официальном приложении", next: "check_official", effect: {}, kind: "good" },
          { label: "Отправляю номер карты для «проверки»", next: "gave_card", effect: {}, kind: "bad" },
          { label: "Скриню и жалуюсь на аккаунт", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      ask_what: {
        text: "Нам нужен номер карты и код из SMS. Это стандартная процедура подтверждения личности.",
        actions: [
          { label: "Отправляю номер карты", next: "gave_card", effect: {}, kind: "bad" },
          { label: "Говорю: «Поддержка не просит коды» — и блокирую", next: null, effect: { caught: 1 }, kind: "good" },
          { label: "Прошу прислать официальный номер", next: "official_number", effect: {}, kind: "neutral" }
        ]
      },
      official_number: {
        text: "Наш номер: 8-800-XXX-XX-XX. Звоните, но аккаунт удалят через 10 минут, если не подтвердите сейчас.",
        actions: [
          { label: "Верю и отправляю код из SMS", next: "gave_code", effect: { money: -3000 }, kind: "bad" },
          { label: "Ищу этот номер в интернете — он не существует", next: "checked_number", effect: {}, kind: "good" },
          { label: "Звоню в официальную поддержку сам", next: "checked_number", effect: {}, kind: "good" }
        ]
      },
      checked_number: {
        sys: true,
        text: "Ты проверил номер — он не существует. Это мошенники.",
        actions: [
          { label: "Блокирую", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      gave_card: {
        text: "Спасибо! Теперь пришлите код из SMS — и мы завершим проверку. Без кода списание не пройдёт.",
        actions: [
          { label: "Отправляю код из SMS", next: "gave_code", effect: { money: -3000 }, kind: "bad" },
          { label: "Понимаю, что это мошенники — блокирую", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      gave_code: {
        text: "С вашей карты списано 3000 ₽. Спасибо за сотрудничество.",
        actions: [],
        terminal: true
      },
      check_official: {
        sys: true,
        text: "Ты проверил аккаунт в приложении — всё в порядке. «Поддержка» в личке оказалась мошенниками.",
        actions: [
          { label: "Блокирую и жалуюсь", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      }
    }
  },

  // mom
  {
    id: "mom",
    name: "Мама",
    avatar: "👩",
    isSafe: false,
    startNode: "start",
    nodes: {
      start: {
        text: "Сынок, привет! Это мама. У меня сломался телефон, пишу с чужого номера. Срочно переведи 5000, потом верну.",
        actions: [
          { label: "Перевожу 5000", next: "sent_money", effect: { money: -5000 }, kind: "bad" },
          { label: "Звоню маме по её обычному номеру", next: "called_mom", effect: {}, kind: "good" },
          { label: "Отвечаю: «Пришли голосовое»", next: "ask_voice", effect: {}, kind: "neutral" },
          { label: "Спрашиваю девичью фамилию мамы", next: "ask_secret", effect: {}, kind: "good" }
        ]
      },
      ask_voice: {
        text: "Не могу, я на совещании. Просто переведи, пожалуйста, очень срочно!",
        actions: [
          { label: "Перевожу — это же мама", next: "sent_money", effect: { money: -5000 }, kind: "bad" },
          { label: "Говорю: «Мама так не пишет» — и блокирую", next: null, effect: { caught: 1 }, kind: "good" },
          { label: "Пишу папе и уточняю", next: "dad_check", effect: {}, kind: "good" }
        ]
      },
      ask_secret: {
        text: "Какая фамилия? Ты что, не веришь мне? Я же твоя мать!",
        actions: [
          { label: "Стыдно, перевожу", next: "sent_money", effect: { money: -5000 }, kind: "bad" },
          { label: "Отвечаю: «Мама знает, что я спрошу» — и блокирую", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      called_mom: {
        sys: true,
        text: "Ты позвонил маме — она дома, телефон цел. Номер чужой, это мошенники.",
        actions: [
          { label: "Блокирую номер", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      dad_check: {
        sys: true,
        text: "Ты написал папе. Он ответил: «Мама дома, ничего не просила. Это мошенники».",
        actions: [
          { label: "Блокирую номер", next: null, effect: { caught: 1 }, kind: "good" },
          { label: "Всё равно перевожу 3000", next: "sent_more", effect: { money: -3000 }, kind: "bad" }
        ]
      },
      sent_money: {
        text: "Спасибо! Кстати, я попала в больницу, нужно ещё 3000 на лекарства. Переведи, пожалуйста.",
        actions: [
          { label: "Перевожу ещё 3000", next: "sent_more", effect: { money: -3000 }, kind: "bad" },
          { label: "Говорю: «Сначала позвоню — проверю, что это ты»", next: "call_check", effect: {}, kind: "good" },
          { label: "Прошу фото из больницы", next: "ask_photo", effect: {}, kind: "neutral" },
          { label: "Пишу папе: «Мама в больнице, ты знаешь?»", next: "dad_check", effect: {}, kind: "good" },
          { label: "Понимаю, что это развод — блокирую", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      call_check: {
        text: "Не звони! Я не могу говорить, врач рядом. Просто переведи, потом объясню.",
        actions: [
          { label: "Всё равно звоню маме", next: "call_result", effect: {}, kind: "good" },
          { label: "Верю и перевожу 3000", next: "sent_more", effect: { money: -3000 }, kind: "bad" }
        ]
      },
      call_result: {
        sys: true,
        text: "Ты позвонил маме — она дома, здорова. Номер чужой, это мошенники.",
        actions: [
          { label: "Блокирую и рассказываю родителям", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      ask_photo: {
        text: "Фото? У меня камера разбита. Ты что, не веришь матери? Срочно нужно!",
        actions: [
          { label: "Перевожу 3000", next: "sent_more", effect: { money: -3000 }, kind: "bad" },
          { label: "Говорю: «Настоящая мама не давит на жалость» — блокирую", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      sent_more: {
        sys: true,
        text: "Деньги ушли мошенникам. Мама настоящая ничего не получала.",
        actions: [],
        terminal: true
      }
    }
  },

  // friend Kirill
  {
    id: "investor",
    name: "Друг Кирилл",
    avatar: "😎",
    isSafe: false,
    startNode: "start",
    nodes: {
      start: {
        text: "Бро, у меня тема! Вложи 3000 — верну 6000 через месяц. Схема рабочая, сам уже поднял.",
        actions: [
          { label: "Вкладываю 3000", next: "invested", effect: { money: -3000 }, kind: "bad" },
          { label: "Отказываюсь: «Гарантированная доходность — это пирамида»", next: "refused", effect: {}, kind: "good" },
          { label: "Спрашиваю: «А что за схема?»", next: "ask_scheme", effect: {}, kind: "neutral" },
          { label: "Прошу показать документы и лицензию", next: "ask_docs", effect: {}, kind: "good" }
        ]
      },
      ask_scheme: {
        text: "Да всё просто! Нужно привести ещё пару человек. Приведи друга — получишь бонус.",
        actions: [
          { label: "Привожу друга", next: "brought_friend", effect: {}, kind: "bad" },
          { label: "Говорю: «Это пирамида, я пас» — и блокирую", next: null, effect: { caught: 1 }, kind: "good" },
          { label: "Рассказываю родителям", next: "told_parents", effect: {}, kind: "good" }
        ]
      },
      ask_docs: {
        text: "Какие документы? Тут всё на доверии, я же друг! Ты мне не веришь?",
        actions: [
          { label: "Верю и вкладываю", next: "invested", effect: { money: -3000 }, kind: "bad" },
          { label: "Отказываюсь без документов", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      invested: {
        text: "Красава! Через месяц верну 6000. Пока схема работает — можешь ещё докинуть.",
        actions: [
          { label: "Докидываю ещё 2000", next: "invested_more", effect: { money: -2000 }, kind: "bad" },
          { label: "Жду месяц", next: "scheme_collapsed", effect: {}, kind: "neutral" }
        ]
      },
      invested_more: {
        text: "Схема закрылась. Деньги не верну, извини. Я сам попал.",
        actions: [],
        terminal: true
      },
      scheme_collapsed: {
        sys: true,
        text: "Прошёл месяц. Кирилл не отвечает неделю, потом блокирует тебя. Деньги не вернулись. Это была пирамида.",
        actions: [
          { label: "Сообщаю родителям и в школу", next: null, effect: { caught: 1 }, kind: "good" },
          { label: "Просто делаю выводы", next: "demand", effect: {}, kind: "neutral" }
        ]
      },
      demand: {
        sys: true,
        text: "Деньги не вернуть — Кирилл пропал. Но ты понял, что это была пирамида, и больше не поведёшься.",
        actions: [],
        terminal: true
      },
      refused: {
        sys: true,
        text: "Кирилл обиделся, но ты сохранил деньги. Гарантированная доходность — признак пирамиды.",
        actions: [
          { label: "Предупредить друзей", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      brought_friend: {
        sys: true,
        text: "Друг вложил деньги и потерял их. Теперь он обижен на тебя.",
        actions: [],
        terminal: true
      },
      told_parents: {
        sys: true,
        text: "Родители объяснили: это пирамида. Ты предупредил друзей и сохранил деньги.",
        actions: [
          { label: "Готово", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      }
    }
  },

  // fake shop
  {
    id: "shop",
    name: "Магазин техники",
    avatar: "📱",
    isSafe: false,
    startNode: "start",
    nodes: {
      start: {
        text: "Поздравляем! Вы выиграли iPhone 15 в нашей акции! Для получения приза оплатите доставку 1500 ₽.",
        actions: [
          { label: "Оплачиваю доставку 1500 ₽", next: "paid_delivery", effect: { money: -1500 }, kind: "bad" },
          { label: "Спрашиваю: «А где вы видели мой номер?»", next: "ask_source", effect: {}, kind: "neutral" },
          { label: "Ищу магазин в интернете — его не существует", next: "checked", effect: {}, kind: "good" },
          { label: "Блокирую и жалуюсь", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      ask_source: {
        text: "Ваш номер был в базе участников акции. Оплатите доставку — и приз ваш! Осталось 2 места.",
        actions: [
          { label: "Оплачиваю 1500 ₽", next: "paid_delivery", effect: { money: -1500 }, kind: "bad" },
          { label: "Говорю: «Я не участвовал в акции» — и блокирую", next: null, effect: { caught: 1 }, kind: "good" },
          { label: "Прошу прислать официальный договор", next: "ask_contract", effect: {}, kind: "good" }
        ]
      },
      ask_contract: {
        text: "Договор пришлём после оплаты. Не тяните — акция заканчивается через час!",
        actions: [
          { label: "Оплачиваю", next: "paid_delivery", effect: { money: -1500 }, kind: "bad" },
          { label: "Понимаю, что это развод — блокирую", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      paid_delivery: {
        text: "Спасибо! Для таможенного оформления нужно оплатить ещё 2500 ₽. Иначе посылку вернут.",
        actions: [
          { label: "Оплачиваю ещё 2500 ₽", next: "paid_more", effect: { money: -2500 }, kind: "bad" },
          { label: "Понимаю, что это мошенники — блокирую", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      paid_more: {
        text: "Посылка «застряла» на складе. Оплатите ещё 3000 ₽ за хранение. Иначе не получите.",
        actions: [
          { label: "Оплачиваю ещё 3000 ₽", next: "paid_final", effect: { money: -3000 }, kind: "bad" },
          { label: "Понимаю, что это мошенники — блокирую", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      paid_final: {
        sys: true,
        text: "Деньги ушли мошенникам. Никакого iPhone не существует.",
        actions: [],
        terminal: true
      },
      checked: {
        sys: true,
        text: "Ты не нашёл магазин в интернете — это фиктивная акция. Мошенники хотели денег за «доставку».",
        actions: [
          { label: "Блокирую и жалуюсь", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      }
    }
  },

  // curator
  {
    id: "curator",
    name: "Куратор",
    avatar: "📚",
    isSafe: false,
    startNode: "start",
    nodes: {
      start: {
        text: "Привет! Это твой куратор. Срочно нужно сдать 1000 ₽ на материалы к зачёту. Переведи на этот номер, потом отчитаюсь.",
        actions: [
          { label: "Перевожу 1000 ₽", next: "paid", effect: { money: -1000 }, kind: "bad" },
          { label: "Звоню куратору по официальному номеру", next: "called", effect: {}, kind: "good" },
          { label: "Спрашиваю: «Почему с незнакомого номера?»", next: "ask_number", effect: {}, kind: "neutral" },
          { label: "Пишу в общий чат группы и уточняю", next: "asked_group", effect: {}, kind: "good" }
        ]
      },
      ask_number: {
        text: "Я с чужого телефона, свой разрядился. Не тяни, материалы нужны сегодня!",
        actions: [
          { label: "Перевожу", next: "paid", effect: { money: -1000 }, kind: "bad" },
          { label: "Говорю: «Куратор так не пишет» — и блокирую", next: null, effect: { caught: 1 }, kind: "good" },
          { label: "Звоню куратору", next: "called", effect: {}, kind: "good" }
        ]
      },
      asked_group: {
        sys: true,
        text: "В чате группы пишут: «Никакого сбора не было, это мошенники». Настоящий куратор подтверждает.",
        actions: [
          { label: "Блокирую номер", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      called: {
        sys: true,
        text: "Ты позвонил куратору — он ничего не просил. Номер чужой, это мошенники.",
        actions: [
          { label: "Блокирую и предупреждаю группу", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      paid: {
        text: "Спасибо! Кстати, нужно ещё 1500 ₽ на печать диплома и допуск к зачёту. Переведи, потом всё верну.",
        actions: [
          { label: "Перевожу ещё 1500 ₽", next: "paid_more", effect: { money: -1500 }, kind: "bad" },
          { label: "Понимаю, что это развод — блокирую", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      paid_more: {
        sys: true,
        text: "Деньги ушли мошенникам. Настоящий куратор ничего не получал.",
        actions: [],
        terminal: true
      }
    }
  },

  // game chat
  {
    id: "gamer",
    name: "Игровой чат",
    avatar: "🎮",
    isSafe: false,
    startNode: "start",
    nodes: {
      start: {
        text: "Купишь мой аккаунт? Топовый, 50 уровень, скины. Всего 2000 ₽. Скину ссылку на оплату.",
        actions: [
          { label: "Перехожу по ссылке и оплачиваю", next: "paid_link", effect: { money: -2000 }, kind: "bad" },
          { label: "Предлагаю сделку через официальную площадку", next: "official", effect: {}, kind: "good" },
          { label: "Спрашиваю: «Почему не через площадку?»", next: "ask_why", effect: {}, kind: "neutral" },
          { label: "Отказываюсь — аккаунты продавать нельзя", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      ask_why: {
        text: "На площадке комиссия 10%. Давай напрямую, я скину ссылку на оплату. Там всё безопасно.",
        actions: [
          { label: "Перехожу по ссылке", next: "paid_link", effect: { money: -2000 }, kind: "bad" },
          { label: "Говорю: «Только через площадку»", next: "official", effect: {}, kind: "good" },
          { label: "Блокирую — это фишинг", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      official: {
        sys: true,
        text: "Продавец отказывается от официальной площадки и пропадает. Значит, аккаунта у него нет — это развод.",
        actions: [
          { label: "Блокирую и жалуюсь", next: null, effect: { caught: 1 }, kind: "good" }
        ]
      },
      paid_link: {
        sys: true,
        text: "Ссылка оказалась фишинговой. С карты списали 2000 ₽, а аккаунт не пришёл.",
        actions: [
          { label: "Сообщаю в поддержку и блокирую карту", next: "after_paid", effect: {}, kind: "good" },
          { label: "Просто забиваю", next: "after_paid", effect: {}, kind: "neutral" }
        ]
      },
      after_paid: {
        sys: true,
        text: "Мошенник удалил чат. Деньги не вернуть. В следующий раз — только через официальную площадку.",
        actions: [],
        terminal: true
      }
    }
  },

  // normal friend
  {
    id: "friend",
    name: "Друг Артём",
    avatar: "🧑",
    isSafe: true,
    startNode: "start",
    nodes: {
      start: {
        text: "Привет! Ты же шаришь в финансах? Подскажи, как копить на наушники — никак не получается отложить.",
        actions: [
          { label: "Советую правило 50/30/20", next: "advice_503020", effect: {}, kind: "good" },
          { label: "Говорю: «Просто не трать»", next: "advice_simple", effect: {}, kind: "neutral" },
          { label: "Предлагаю копить вместе", next: "together", effect: {}, kind: "good" }
        ]
      },
      advice_503020: {
        text: "О, круто! 50% на нужное, 30% на желания, 20% в копилку. Попробую так.",
        actions: [
          { label: "Советую вести таблицу расходов", next: "table", effect: {}, kind: "good" },
          { label: "Просто рад, что помог", next: null, effect: {}, kind: "good" }
        ]
      },
      advice_simple: {
        text: "Легко сказать «не трать». А как именно?",
        actions: [
          { label: "Объясняю про 50/30/20", next: "advice_503020", effect: {}, kind: "good" },
          { label: "Говорю: «Ну, удачи»", next: null, effect: {}, kind: "neutral" }
        ]
      },
      together: {
        text: "Давай! Тогда у нас будет общая цель. А как именно копить?",
        actions: [
          { label: "По 500 в неделю", next: "table", effect: {}, kind: "good" },
          { label: "Вести общую таблицу расходов", next: "table", effect: {}, kind: "good" },
          { label: "Просто складывать в копилку", next: "table", effect: {}, kind: "neutral" }
        ]
      },
      table: {
        text: "Отличная идея! Через месяц у нас уже была бы приличная сумма. Спасибо, ты настоящий друг.",
        actions: [
          { label: "Договорились!", next: null, effect: {}, kind: "good" }
        ]
      }
    }
  }
];

// final profiles by dominant axis
const profiles = [
  {
    id: "sherlock",
    rank: "Финансовый Шерлок",
    advice: "Ты раскусил всех мошенников! Запомни главное: настоящая поддержка не просит коды, мама не пишет с чужого номера, а гарантированная доходность — признак пирамиды."
  },
  {
    id: "partial",
    rank: "Начинающий детектив",
    advice: "Ты раскусил не всех. Мошенники давят на панику и срочность — всегда проверяй через другой канал связи и не переводи деньги по просьбе из чата."
  },
  {
    id: "caught",
    rank: "Лёгкая добыча",
    advice: "Мошенники обчистили счёт. Запомни: не переводи деньги незнакомцам, не отправляй коды из SMS и не верь в «верну в два раза»."
  }
];