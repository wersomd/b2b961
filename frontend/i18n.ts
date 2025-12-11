export type Language = 'ru' | 'kk';

export const translations = {
  ru: {
    loginTitle: 'Вход в систему',
    loginSubtitle: 'Введите ваши данные для доступа',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Пароль',
    loginButton: 'Войти',
    loginError: 'Неверный email или пароль',
    loading: 'Загрузка...',
    
    // Sidebar
    menuMyOrders: 'Мои заявки',
    menuCreateOrder: 'Создать заявку',
    menuAllOrders: 'Все заявки',
    menuProducts: 'Товары',
    menuDeliveries: 'Доставки',
    menuUsers: 'Пользователи',
    logout: 'Выйти',

    // Statuses
    statusNew: 'Новая',
    statusUnderCheck: 'На проверке',
    statusApproved: 'Подтверждена',
    statusAssembling: 'Сборка',
    statusToDriver: 'Передано водителю',
    statusOnDelivery: 'В пути',
    statusDelivered: 'Доставлено',
    statusCancelled: 'Отменено',
    
    // Roles
    roleAdmin: 'Администратор',
    roleClient: 'Клиент',
    roleSeller: 'Менеджер',
    roleDriver: 'Водитель',

    // Admin
    adminTitle: 'Управление пользователями',
    addUser: 'Добавить пользователя',
    name: 'Имя',
    role: 'Роль',
    actions: 'Действия',
    save: 'Сохранить',
    cancel: 'Отмена',
    
    // General
    back: 'Назад',
    create: 'Создать',
    import: 'Импорт Excel',
    search: 'Поиск...',
  },
  kk: {
    loginTitle: 'Жүйеге кіру',
    loginSubtitle: 'Кіру үшін деректерді енгізіңіз',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Құпия сөз',
    loginButton: 'Кіру',
    loginError: 'Email немесе құпия сөз қате',
    loading: 'Жүктелуде...',

    // Sidebar
    menuMyOrders: 'Менің өтінімдерім',
    menuCreateOrder: 'Өтінім құру',
    menuAllOrders: 'Барлық өтінімдер',
    menuProducts: 'Тауарлар',
    menuDeliveries: 'Жеткізу',
    menuUsers: 'Пайдаланушылар',
    logout: 'Шығу',

    // Statuses
    statusNew: 'Жаңа',
    statusUnderCheck: 'Тексерілуде',
    statusApproved: 'Расталды',
    statusAssembling: 'Жиналуда',
    statusToDriver: 'Жүргізушіге берілді',
    statusOnDelivery: 'Жолда',
    statusDelivered: 'Жеткізілді',
    statusCancelled: 'Болдырылмады',

    // Roles
    roleAdmin: 'Әкімші',
    roleClient: 'Клиент',
    roleSeller: 'Менеджер',
    roleDriver: 'Жүргізуші',

    // Admin
    adminTitle: 'Пайдаланушыларды басқару',
    addUser: 'Пайдаланушы қосу',
    name: 'Аты',
    role: 'Рөлі',
    actions: 'Әрекеттер',
    save: 'Сақтау',
    cancel: 'Болдырмау',

    // General
    back: 'Артқа',
    create: 'Құру',
    import: 'Excel импорттау',
    search: 'Іздеу...',
  }
};