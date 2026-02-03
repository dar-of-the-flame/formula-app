// Основной объект приложения
const App = {
    // Текущее состояние приложения
    state: {
        currentMode: 'learn',
        currentLevel: '1',
        currentCardIndex: 0,
        learnedWords: {1: new Set(), 2: new Set(), 3: new Set(), 4: new Set()},
        reviewWords: [],
        testInProgress: false,
        testResults: null,
        cardOrder: [],
        filteredWords: [],
        language: 'ru',
        theme: 'pink',
        autoFlip: true,
        db: null // Добавляем ссылку на базу данных
    },

    // Переводы интерфейса
    translations: {
        ru: {
            appTitle: 'HSK 1-4 | Помощник изучения китайского',
            appSubtitle: 'Эффективное изучение китайской лексики',
            settings: 'Настройки',
            selectLevel: 'Выберите уровень:',
            allLevels: 'Все',
            progressDefault: 'Прогресс: 0/0 (0%)',
            close: 'Закрыть',
            save: 'Сохранить',
            
            learnMode: 'Изучение',
            reviewMode: 'Повторение',
            testMode: 'Тест',
            allWords: 'Все слова',
            
            learnTitle: 'Изучение новых слов',
            learnInstructions: 'Кликните на карточку, чтобы увидеть перевод и примеры. Используйте пробел для переворота карточки.',
            cardHint: 'Кликните на карточку для переворота',
            prev: 'Назад',
            flip: 'Перевернуть',
            learned: 'Выучено',
            next: 'Вперед',
            shuffle: 'Перемешать карточки',
            
            reviewTitle: 'Повторение изученных слов',
            reviewInstructions: 'Просмотрите слова, которые вы уже изучили.',
            filterByLevel: 'Фильтр по уровню:',
            all: 'Все',
            noReviewWords: 'Нет слов для повторения',
            reviewInstructions2: 'Изучите слова в режиме обучения, чтобы они появились здесь.',
            
            testTitle: 'Проверка знаний',
            testInstructions: 'Пройдите тест, чтобы проверить, насколько хорошо вы запомнили слова.',
            selectLevelTest: 'Выберите уровень:',
            questionsCount: 'Количество вопросов:',
            startTest: 'Начать тест',
            testProgress: 'Вопрос 0 из 0',
            nextQuestion: 'Следующий вопрос',
            finishTest: 'Завершить тест',
            correctAnswers: 'Правильных ответов',
            totalQuestions: 'Всего вопросов',
            percentage: 'Процент',
            testResultDefault: 'Результат теста',
            tryAgain: 'Пройти еще раз',
            
            allWordsTitle: 'Все слова HSK 1-4',
            allWordsInstructions: 'Просмотр всех слов с возможностью поиска и фильтрации.',
            searchPlaceholder: 'Поиск по иероглифу, пиньиню или переводу...',
            sortDefault: 'По умолчанию',
            sortCharacter: 'По иероглифу',
            sortPinyin: 'По пиньиню',
            sortLevel: 'По уровню',
            
            interfaceLanguage: 'Язык интерфейса:',
            colorTheme: 'Цветовая тема:',
            themePink: 'Розовая',
            themeBlue: 'Голубая',
            themeGreen: 'Зеленая',
            themePurple: 'Фиолетовая',
            themeDark: 'Темная',
            studySettings: 'Настройки изучения:',
            autoFlip: 'Автопереворот карточки (3 сек)'
        },
        
        zh: {
            appTitle: 'HSK 1-4 | 汉语学习助手',
            appSubtitle: '高效学习汉语词汇',
            settings: '设置',
            selectLevel: '选择级别:',
            allLevels: '全部',
            progressDefault: '进度: 0/0 (0%)',
            close: '关闭',
            save: '保存',
            
            learnMode: '学习',
            reviewMode: '复习',
            testMode: '测试',
            allWords: '所有词汇',
            
            learnTitle: '学习新词汇',
            learnInstructions: '点击卡片查看翻译和例句。使用空格键翻转卡片。',
            cardHint: '点击卡片翻转',
            prev: '上一张',
            flip: '翻转',
            learned: '已学会',
            next: '下一张',
            shuffle: '打乱卡片',
            
            reviewTitle: '复习已学词汇',
            reviewInstructions: '查看您已经学会的词汇。',
            filterByLevel: '按级别筛选:',
            all: '全部',
            noReviewWords: '没有可复习的词汇',
            reviewInstructions2: '在学习模式中学习词汇，它们将出现在这里。',
            
            testTitle: '知识测试',
            testInstructions: '参加测试以检查您对词汇的掌握程度。',
            selectLevelTest: '选择级别:',
            questionsCount: '问题数量:',
            startTest: '开始测试',
            testProgress: '问题 0 的 0',
            nextQuestion: '下一个问题',
            finishTest: '完成测试',
            correctAnswers: '正确答案',
            totalQuestions: '总问题',
            percentage: '百分比',
            testResultDefault: '测试结果',
            tryAgain: '再试一次',
            
            allWordsTitle: '所有 HSK 1-4 词汇',
            allWordsInstructions: '查看所有词汇，支持搜索和筛选。',
            searchPlaceholder: '搜索汉字、拼音或翻译...',
            sortDefault: '默认',
            sortCharacter: '按汉字',
            sortPinyin: '按拼音',
            sortLevel: '按级别',
            
            interfaceLanguage: '界面语言:',
            colorTheme: '颜色主题:',
            themePink: '粉色',
            themeBlue: '蓝色',
            themeGreen: '绿色',
            themePurple: '紫色',
            themeDark: '深色',
            studySettings: '学习设置:',
            autoFlip: '自动翻转卡片 (3秒)'
        }
    },

    // Инициализация IndexedDB
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('hsk-assistant-db', 2);
            
            request.onerror = (event) => {
                console.error('Ошибка открытия IndexedDB:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.state.db = event.target.result;
                console.log('IndexedDB успешно открыта');
                resolve(this.state.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Создаем хранилище для прогресса
                if (!db.objectStoreNames.contains('progress')) {
                    const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
                    console.log('Создано хранилище прогресса');
                }
                
                // Создаем хранилище для настроек
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
                    console.log('Создано хранилище настроек');
                }
                
                // Создаем хранилище для тестов
                if (!db.objectStoreNames.contains('tests')) {
                    const testsStore = db.createObjectStore('tests', { keyPath: 'id' });
                    console.log('Создано хранилище тестов');
                }
            };
        });
    },

    // Сохранение прогресса в IndexedDB
    async saveProgressToIndexedDB() {
        if (!this.state.db) {
            console.warn('IndexedDB не инициализирована, сохраняем в localStorage');
            this.saveProgressToLocalStorage();
            return;
        }
        
        const data = {
            id: 'user-progress',
            learnedWords: {
                1: Array.from(this.state.learnedWords[1]),
                2: Array.from(this.state.learnedWords[2]),
                3: Array.from(this.state.learnedWords[3]),
                4: Array.from(this.state.learnedWords[4])
            },
            cardOrder: this.state.cardOrder,
            currentCardIndex: this.state.currentCardIndex,
            lastSaved: new Date().toISOString()
        };
        
        return new Promise((resolve, reject) => {
            const transaction = this.state.db.transaction(['progress'], 'readwrite');
            const store = transaction.objectStore('progress');
            const request = store.put(data);
            
            request.onsuccess = () => {
                console.log('Прогресс сохранен в IndexedDB');
                // Также сохраняем в localStorage как резервную копию
                this.saveProgressToLocalStorage();
                resolve();
            };
            
            request.onerror = (event) => {
                console.error('Ошибка сохранения в IndexedDB:', event.target.error);
                // При ошибке сохраняем только в localStorage
                this.saveProgressToLocalStorage();
                reject(event.target.error);
            };
        });
    },

    // Загрузка прогресса из IndexedDB
    async loadProgressFromIndexedDB() {
        if (!this.state.db) {
            console.warn('IndexedDB не инициализирована, загружаем из localStorage');
            return this.loadProgressFromLocalStorage();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.state.db.transaction(['progress'], 'readonly');
            const store = transaction.objectStore('progress');
            const request = store.get('user-progress');
            
            request.onsuccess = (event) => {
                const data = event.target.result;
                if (data) {
                    console.log('Прогресс загружен из IndexedDB');
                    
                    if (data.learnedWords) {
                        for (let level in data.learnedWords) {
                            this.state.learnedWords[level] = new Set(data.learnedWords[level]);
                        }
                    }
                    
                    if (data.cardOrder && data.currentCardIndex !== undefined) {
                        this.state.cardOrder = data.cardOrder;
                        this.state.currentCardIndex = data.currentCardIndex;
                    } else {
                        this.state.cardOrder = this.getNewWords();
                    }
                    
                    resolve(true);
                } else {
                    console.log('Нет данных в IndexedDB, пробуем localStorage');
                    this.loadProgressFromLocalStorage();
                    resolve(false);
                }
            };
            
            request.onerror = (event) => {
                console.error('Ошибка загрузки из IndexedDB:', event.target.error);
                // При ошибке загружаем из localStorage
                this.loadProgressFromLocalStorage();
                reject(event.target.error);
            };
        });
    },

    // Сохранение прогресса в localStorage (резервная копия)
    saveProgressToLocalStorage() {
        const data = {
            learnedWords: {
                1: Array.from(this.state.learnedWords[1]),
                2: Array.from(this.state.learnedWords[2]),
                3: Array.from(this.state.learnedWords[3]),
                4: Array.from(this.state.learnedWords[4])
            },
            cardOrder: this.state.cardOrder,
            currentCardIndex: this.state.currentCardIndex,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('hsk-progress', JSON.stringify(data));
        console.log('Прогресс сохранен в localStorage');
    },

    // Загрузка прогресса из localStorage (резервная копия)
    loadProgressFromLocalStorage() {
        const saved = localStorage.getItem('hsk-progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.learnedWords) {
                    for (let level in data.learnedWords) {
                        this.state.learnedWords[level] = new Set(data.learnedWords[level]);
                    }
                }
                
                if (data.cardOrder && data.currentCardIndex !== undefined) {
                    this.state.cardOrder = data.cardOrder;
                    this.state.currentCardIndex = data.currentCardIndex;
                } else {
                    this.state.cardOrder = this.getNewWords();
                }
                
                console.log('Прогресс загружен из localStorage');
                return true;
            } catch (e) {
                console.error('Ошибка загрузки из localStorage:', e);
            }
        }
        
        this.state.cardOrder = this.getNewWords();
        return false;
    },

    // Инициализация приложения
    async init() {
        console.log('Инициализация приложения...');
        
        try {
            // Инициализируем IndexedDB
            await this.initIndexedDB();
            
            this.loadSettings();
            await this.loadProgressFromIndexedDB();
            this.setupEventListeners();
            this.applyTheme();
            this.applyLanguage();
            this.render();
            this.updateProgressBar();
            
            // Начальная загрузка всех слов
            this.loadAllWords();
            
            console.log('Приложение успешно инициализировано');
        } catch (error) {
            console.error('Ошибка инициализации приложения:', error);
            // Пробуем продолжить без IndexedDB
            this.loadSettings();
            this.loadProgressFromLocalStorage();
            this.setupEventListeners();
            this.applyTheme();
            this.applyLanguage();
            this.render();
            this.updateProgressBar();
            this.loadAllWords();
        }
    },

    // Загрузка настроек из localStorage
    loadSettings() {
        const savedSettings = localStorage.getItem('hsk-settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.state.language = settings.language || 'ru';
                this.state.theme = settings.theme || 'pink';
                this.state.autoFlip = settings.autoFlip !== undefined ? settings.autoFlip : true;
            } catch (e) {
                console.error('Ошибка загрузки настроек:', e);
            }
        }
    },

    // Сохранение настроек в localStorage
    saveSettings() {
        const settings = {
            language: this.state.language,
            theme: this.state.theme,
            autoFlip: this.state.autoFlip
        };
        localStorage.setItem('hsk-settings', JSON.stringify(settings));
    },

    // Применение выбранной темы
    applyTheme() {
        document.body.classList.remove('theme-pink', 'theme-blue', 'theme-green', 'theme-purple', 'theme-dark');
        document.body.classList.add(`theme-${this.state.theme}`);
    },

    // Применение выбранного языка
    applyLanguage() {
        const lang = this.state.language;
        const translations = this.translations[lang];
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });
    },

    // Получение слов для текущего уровня
    getWordsForLevel(level) {
        if (!hskWords || hskWords.length === 0) {
            console.error('Слова не загружены!');
            return [];
        }
        
        if (level === 'all') {
            return hskWords;
        }
        
        const levelNum = parseInt(level);
        return hskWords.filter(word => word.level === levelNum);
    },

    // Получение новых слов для изучения
    getNewWords() {
        const words = this.getWordsForLevel(this.state.currentLevel);
        
        if (words.length === 0) {
            console.warn('Нет слов для уровня', this.state.currentLevel);
            return [];
        }
        
        const currentLevels = this.state.currentLevel === 'all' ? [1, 2, 3, 4] : [parseInt(this.state.currentLevel)];
        
        return words
            .filter(word => {
                for (let level of currentLevels) {
                    if (this.state.learnedWords[level] && this.state.learnedWords[level].has(word.id)) {
                        return false;
                    }
                }
                return true;
            })
            .map(word => word.id)
            .sort(() => Math.random() - 0.5);
    },

    // Получение изученных слов для повторения
    getReviewWords(level = 'all') {
        const words = this.getWordsForLevel(level);
        const levelNum = level === 'all' ? null : parseInt(level);
        
        return words.filter(word => {
            if (levelNum) {
                return this.state.learnedWords[levelNum] && this.state.learnedWords[levelNum].has(word.id);
            } else {
                return (this.state.learnedWords[1] && this.state.learnedWords[1].has(word.id)) ||
                       (this.state.learnedWords[2] && this.state.learnedWords[2].has(word.id)) ||
                       (this.state.learnedWords[3] && this.state.learnedWords[3].has(word.id)) ||
                       (this.state.learnedWords[4] && this.state.learnedWords[4].has(word.id));
            }
        });
    },

    // Настройка обработчиков событий
    setupEventListeners() {
        // Переключение режимов
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.switchMode(mode);
            });
        });

        // Переключение уровней
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const level = btn.dataset.level;
                this.switchLevel(level);
            });
        });

        // Кнопка настроек
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // Управление карточками
        const flipCardBtn = document.getElementById('flipCard');
        if (flipCardBtn) {
            flipCardBtn.remove(); // Удаляем кнопку переворота
        }
        
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            let isFlipping = false;
            let lastFlipTime = 0;
            
            const handleFlip = () => {
                const now = Date.now();
                
                // Предотвращаем быстрые повторные клики (анти-дребезг)
                if (isFlipping || (now - lastFlipTime) < 500) {
                    return;
                }
                
                isFlipping = true;
                lastFlipTime = now;
                
                this.flipCard();
                
                // Сбрасываем флаг после завершения анимации
                setTimeout(() => {
                    isFlipping = false;
                }, 600);
            };
            
            // Для десктопов и мобильных с поддержкой клика
            flashcard.addEventListener('click', handleFlip);
            
            // Для тач-устройств добавляем обработчик touchstart
            flashcard.addEventListener('touchstart', (e) => {
                // Предотвращаем масштабирование при двойном тапе
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    const rect = flashcard.getBoundingClientRect();
                    
                    // Проверяем, что тап внутри карточки
                    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                        e.preventDefault();
                        handleFlip();
                    }
                }
            }, { passive: false });
            
            // Добавляем визуальную обратную связь для тача
            flashcard.addEventListener('touchstart', () => {
                flashcard.style.transform = 'scale(0.98)';
            });
            
            flashcard.addEventListener('touchend', () => {
                flashcard.style.transform = '';
            });
        }
        
        const prevCardBtn = document.getElementById('prevCard');
        if (prevCardBtn) {
            prevCardBtn.addEventListener('click', () => this.prevCard());
        }
        
        const nextCardBtn = document.getElementById('nextCard');
        if (nextCardBtn) {
            nextCardBtn.addEventListener('click', () => this.nextCard());
        }
        
        const shuffleCardsBtn = document.getElementById('shuffleCards');
        if (shuffleCardsBtn) {
            shuffleCardsBtn.addEventListener('click', () => this.shuffleCards());
        }
        
        const markLearnedBtn = document.getElementById('markLearned');
        if (markLearnedBtn) {
            markLearnedBtn.addEventListener('click', () => this.markAsLearned());
        }

        // Фильтры для повторения
        document.querySelectorAll('.review-level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.review-level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const level = btn.dataset.level;
                this.loadReviewWords(level);
            });
        });

        // Тестирование
        const startTestBtn = document.getElementById('startTest');
        if (startTestBtn) {
            startTestBtn.addEventListener('click', () => this.startTest());
        }
        
        const nextQuestionBtn = document.getElementById('nextQuestion');
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', () => this.nextTestQuestion());
        }
        
        const finishTestBtn = document.getElementById('finishTest');
        if (finishTestBtn) {
            finishTestBtn.addEventListener('click', () => this.finishTest());
        }
        
        const restartTestBtn = document.getElementById('restartTest');
        if (restartTestBtn) {
            restartTestBtn.addEventListener('click', () => this.restartTest());
        }

        // Все слова
        const wordSearchInput = document.getElementById('wordSearch');
        if (wordSearchInput) {
            wordSearchInput.addEventListener('input', (e) => this.filterWords(e.target.value));
        }
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterWords(document.getElementById('wordSearch').value);
            });
        });
        
        const sortBySelect = document.getElementById('sortBy');
        if (sortBySelect) {
            sortBySelect.addEventListener('change', () => this.filterWords(document.getElementById('wordSearch').value));
        }

        // Настройки
        const closeSettingsBtn = document.getElementById('closeSettings');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        }
        
        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveAndCloseSettings());
        }

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
            
            switch(e.key) {
                case ' ':
                case 'Spacebar':
                    e.preventDefault();
                    if (this.state.currentMode === 'learn') {
                        this.flipCard();
                    }
                    break;
                case 'ArrowLeft':
                    if (this.state.currentMode === 'learn') {
                        this.prevCard();
                    }
                    break;
                case 'ArrowRight':
                    if (this.state.currentMode === 'learn') {
                        this.nextCard();
                    }
                    break;
                case 'l':
                case 'L':
                    if (this.state.currentMode === 'learn') {
                        this.markAsLearned();
                    }
                    break;
                case 's':
                case 'S':
                    if (this.state.currentMode === 'learn') {
                        this.shuffleCards();
                    }
                    break;
                case '1':
                    if (this.state.currentMode === 'learn') {
                        this.switchLevel('1');
                    }
                    break;
                case '2':
                    if (this.state.currentMode === 'learn') {
                        this.switchLevel('2');
                    }
                    break;
                case '3':
                    if (this.state.currentMode === 'learn') {
                        this.switchLevel('3');
                    }
                    break;
                case '4':
                    if (this.state.currentMode === 'learn') {
                        this.switchLevel('4');
                    }
                    break;
                case 'a':
                case 'A':
                    if (this.state.currentMode === 'learn') {
                        this.switchLevel('all');
                    }
                    break;
                case 'Escape':
                    this.closeSettings();
                    break;
            }
        });
    },

    // Переключение режима
    switchMode(mode) {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        document.querySelectorAll('.mode-content').forEach(section => {
            section.classList.remove('active');
        });
        
        document.getElementById(`${mode}Mode`).classList.add('active');
        this.state.currentMode = mode;
        
        switch(mode) {
            case 'review':
                this.loadReviewWords('all');
                break;
            case 'all':
                this.loadAllWords();
                break;
        }
    },

    // Переключение уровня
    switchLevel(level) {
        this.state.currentLevel = level;
        this.state.cardOrder = this.getNewWords();
        this.state.currentCardIndex = 0;
        
        // Обновляем активные кнопки уровня
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === level) {
                btn.classList.add('active');
            }
        });
        
        this.updateLearnMode();
        this.updateProgressBar();
        
        const levelNames = {
            1: this.state.language === 'ru' ? 'HSK 1' : 'HSK 1',
            2: this.state.language === 'ru' ? 'HSK 2' : 'HSK 2', 
            3: this.state.language === 'ru' ? 'HSK 3' : 'HSK 3',
            4: this.state.language === 'ru' ? 'HSK 4' : 'HSK 4',
            all: this.state.language === 'ru' ? 'Все уровни' : '全部级别'
        };
        
        const message = this.state.language === 'ru' 
            ? `Переключено на ${levelNames[level]}`
            : `已切换到 ${levelNames[level]}`;
        
        this.showNotification(message, 'info');
    },

    // Обновление режима изучения
    updateLearnMode() {
        if (!hskWords || hskWords.length === 0) {
            console.error('Слова не загружены!');
            return;
        }
        
        if (this.state.cardOrder.length === 0) {
            this.state.cardOrder = this.getNewWords();
            this.state.currentCardIndex = 0;
        }

        if (this.state.cardOrder.length > 0 && this.state.currentCardIndex < this.state.cardOrder.length) {
            const wordId = this.state.cardOrder[this.state.currentCardIndex];
            const word = hskWords.find(w => w.id == wordId);
            
            if (word) {
                document.getElementById('currentCharacter').textContent = word.char;
                document.getElementById('currentPinyin').textContent = word.pinyin;
                document.getElementById('backCharacter').textContent = word.char;
                document.getElementById('backPinyin').textContent = word.pinyin;
                document.getElementById('currentTranslation').textContent = word.translation;
                document.getElementById('currentExample').textContent = word.example || '';
                document.getElementById('currentWordLevel').textContent = `HSK ${word.level}`;
                document.getElementById('currentLevelBadge').textContent = `HSK ${word.level}`;
                
                document.getElementById('flashcard').classList.remove('flipped');
                
                // Автопереворот, если включено
                if (this.state.autoFlip) {
                    setTimeout(() => {
                        if (document.getElementById('flashcard') && !document.getElementById('flashcard').classList.contains('flipped')) {
                            this.flipCard();
                        }
                    }, 3000);
                }
            } else {
                console.error('Слово не найдено по id:', wordId);
            }
        } else {
            const flashcardContainer = document.querySelector('.flashcard-container');
            if (flashcardContainer) {
                flashcardContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-check-circle"></i>
                        <h3>Поздравляем!</h3>
                        <p>Вы изучили все слова текущего уровня!</p>
                        <p>Переключитесь на другой уровень или перейдите в режим повторения.</p>
                    </div>
                `;
            }
        }
    },

    // Загрузка слов для повторения
    loadReviewWords(level = 'all') {
        const words = this.getReviewWords(level);
        const container = document.getElementById('reviewContainer');
        
        if (!container) return;
        
        if (words.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>Нет слов для повторения</h3>
                    <p>Изучите слова в режиме обучения, чтобы они появились здесь.</p>
                </div>
            `;
            container.classList.add('empty');
            return;
        }
        
        container.classList.remove('empty');
        container.innerHTML = '<div class="review-words"></div>';
        const wordsContainer = container.querySelector('.review-words');
        
        words.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'review-word';
            wordElement.innerHTML = `
                <div class="review-char">${word.char}</div>
                <div class="review-pinyin">${word.pinyin}</div>
                <div class="review-translation">${word.translation}</div>
                <div class="review-example">${word.example || ''}</div>
            `;
            wordsContainer.appendChild(wordElement);
        });
    },

    // Загрузка всех слов
    loadAllWords(filterText = '', level = 'all', sortBy = 'id') {
        let words = hskWords.slice();
        
        // Фильтрация по уровню
        if (level !== 'all') {
            words = words.filter(word => word.level == level);
        }
        
        // Фильтрация по тексту
        if (filterText) {
            const searchText = filterText.toLowerCase();
            words = words.filter(word => 
                word.char.toLowerCase().includes(searchText) ||
                word.pinyin.toLowerCase().includes(searchText) ||
                word.translation.toLowerCase().includes(searchText)
            );
        }
        
        // Сортировка
        switch(sortBy) {
            case 'char':
                words.sort((a, b) => a.char.localeCompare(b.char));
                break;
            case 'pinyin':
                words.sort((a, b) => a.pinyin.localeCompare(b.pinyin));
                break;
            case 'level':
                words.sort((a, b) => a.level - b.level);
                break;
            default:
                words.sort((a, b) => a.id - b.id);
        }
        
        this.renderAllWords(words);
    },

    // Рендер всех слов
    renderAllWords(words) {
        const container = document.getElementById('wordsGrid');
        if (!container) return;
        
        if (words.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Слова не найдены</h3>
                    <p>Попробуйте изменить критерии поиска.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        words.forEach(word => {
            const isLearned = this.state.learnedWords[word.level] && 
                             this.state.learnedWords[word.level].has(word.id);
            
            const wordElement = document.createElement('div');
            wordElement.className = `word-card ${isLearned ? 'learned' : ''}`;
            wordElement.innerHTML = `
                <div class="word-level-badge">HSK ${word.level}</div>
                <div class="word-char">${word.char}</div>
                <div class="word-pinyin">${word.pinyin}</div>
                <div class="word-translation">${word.translation}</div>
                ${word.example ? `<div class="word-example">${word.example}</div>` : ''}
            `;
            container.appendChild(wordElement);
        });
    },

    // Фильтрация слов
    filterWords(searchText) {
        const activeFilter = document.querySelector('.filter-btn.active');
        if (!activeFilter) return;
        
        const level = activeFilter.dataset.level;
        const sortBy = document.getElementById('sortBy').value;
        this.loadAllWords(searchText, level, sortBy);
    },

    // Обновление прогресс-бара
    updateProgressBar() {
        const words = this.getWordsForLevel(this.state.currentLevel);
        const currentLevels = this.state.currentLevel === 'all' ? [1, 2, 3, 4] : [parseInt(this.state.currentLevel)];
        
        let learnedCount = 0;
        let totalCount = words.length;
        
        if (totalCount > 0) {
            learnedCount = words.filter(word => {
                for (let level of currentLevels) {
                    if (this.state.learnedWords[level] && this.state.learnedWords[level].has(word.id)) {
                        return true;
                    }
                }
                return false;
            }).length;
        }
        
        const percentage = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            if (this.state.language === 'ru') {
                progressText.textContent = `Прогресс: ${learnedCount}/${totalCount} (${percentage}%)`;
            } else {
                progressText.textContent = `进度: ${learnedCount}/${totalCount} (${percentage}%)`;
            }
        }
    },

    // Переворот карточки
    flipCard() {
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            // Добавляем класс для анимации
            flashcard.classList.add('flipping');
            flashcard.classList.toggle('flipped');
            
            // Удаляем класс после анимации
            setTimeout(() => {
                flashcard.classList.remove('flipping');
            }, 600);
            
            // Визуальная обратная связь
            flashcard.style.transform = 'scale(1.02)';
            setTimeout(() => {
                flashcard.style.transform = '';
            }, 150);
        }
    },

    // Предыдущая карточка
    prevCard() {
        if (this.state.currentCardIndex > 0) {
            this.state.currentCardIndex--;
            this.updateLearnMode();
        }
    },

    // Следующая карточка
    nextCard() {
        if (this.state.currentCardIndex < this.state.cardOrder.length - 1) {
            this.state.currentCardIndex++;
            this.updateLearnMode();
        }
    },

    // Перемешивание карточек
    shuffleCards() {
        this.state.cardOrder = this.state.cardOrder.sort(() => Math.random() - 0.5);
        this.state.currentCardIndex = 0;
        this.updateLearnMode();
        const message = this.state.language === 'ru' 
            ? 'Карточки перемешаны' 
            : '卡片已打乱';
        this.showNotification(message, 'info');
    },

    // Отметить как выученное
    async markAsLearned() {
        if (this.state.cardOrder.length > 0) {
            const wordId = this.state.cardOrder[this.state.currentCardIndex];
            const word = hskWords.find(w => w.id == wordId);
            
            if (word) {
                if (!this.state.learnedWords[word.level]) {
                    this.state.learnedWords[word.level] = new Set();
                }
                
                this.state.learnedWords[word.level].add(wordId);
                
                try {
                    await this.saveProgressToIndexedDB();
                } catch (error) {
                    console.error('Ошибка сохранения прогресса:', error);
                }
                
                // Удаляем из текущего порядка
                this.state.cardOrder = this.state.cardOrder.filter(id => id != wordId);
                
                // Если это был последний элемент, переходим к предыдущему
                if (this.state.currentCardIndex >= this.state.cardOrder.length) {
                    this.state.currentCardIndex = Math.max(0, this.state.cardOrder.length - 1);
                }
                
                this.updateLearnMode();
                this.updateProgressBar();
                
                const message = this.state.language === 'ru' 
                    ? 'Слово отмечено как выученное' 
                    : '单词标记为已学会';
                this.showNotification(message, 'success');
            }
        } else {
            const message = this.state.language === 'ru' 
                ? 'Нет слов для изучения' 
                : '没有单词可学习';
            this.showNotification(message, 'info');
        }
    },

    // Начать тест
    startTest() {
        const selectedLevel = document.querySelector('input[name="testLevel"]:checked');
        if (!selectedLevel) return;
        
        const level = selectedLevel.value;
        const questionCount = parseInt(document.getElementById('testQuestionCount').value);
        
        // Получаем слова для теста
        let testWords = this.getWordsForLevel(level);
        
        if (testWords.length === 0) {
            const message = this.state.language === 'ru' 
                ? 'Нет слов для тестирования' 
                : '没有单词可测试';
            this.showNotification(message, 'error');
            return;
        }
        
        // Перемешиваем и выбираем нужное количество
        testWords = testWords.sort(() => Math.random() - 0.5).slice(0, questionCount);
        
        this.state.testData = {
            words: testWords,
            currentQuestion: 0,
            correctAnswers: 0,
            userAnswers: []
        };
        
        this.state.testInProgress = true;
        
        // Показываем область теста
        document.getElementById('testOptions').style.display = 'none';
        document.getElementById('startTest').style.display = 'none';
        document.getElementById('testArea').classList.remove('hidden');
        
        this.showTestQuestion();
    },

    // Показать вопрос теста
    showTestQuestion() {
        const testData = this.state.testData;
        const question = testData.words[testData.currentQuestion];
        
        if (!question) {
            this.finishTest();
            return;
        }
        
        // Обновляем прогресс
        const progress = ((testData.currentQuestion + 1) / testData.words.length) * 100;
        document.getElementById('testProgressFill').style.width = `${progress}%`;
        document.getElementById('testProgressText').textContent = 
            this.state.language === 'ru' 
                ? `Вопрос ${testData.currentQuestion + 1} из ${testData.words.length}`
                : `问题 ${testData.currentQuestion + 1} 的 ${testData.words.length}`;
        document.getElementById('testScore').textContent = 
            `${testData.correctAnswers}/${testData.currentQuestion}`;
        
        // Показываем вопрос
        document.getElementById('testQuestionText').textContent = question.char;
        
        // Создаем варианты ответов
        const answersContainer = document.getElementById('testAnswers');
        answersContainer.innerHTML = '';
        
        // Создаем правильный ответ и 3 случайных неправильных
        const allWords = hskWords.filter(w => w.id !== question.id);
        const wrongAnswers = allWords.sort(() => Math.random() - 0.5).slice(0, 3);
        const allAnswers = [question, ...wrongAnswers].sort(() => Math.random() - 0.5);
        
        allAnswers.forEach((word, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = word.translation;
            button.dataset.answerId = word.id;
            button.addEventListener('click', () => this.checkTestAnswer(word.id === question.id, button));
            answersContainer.appendChild(button);
        });
        
        // Скрываем обратную связь и кнопки
        document.getElementById('testFeedback').classList.add('hidden');
        document.getElementById('nextQuestion').classList.add('hidden');
        document.getElementById('finishTest').classList.add('hidden');
    },

    // Проверить ответ теста
    checkTestAnswer(isCorrect, button) {
        const testData = this.state.testData;
        
        // Записываем ответ пользователя
        testData.userAnswers.push({
            question: testData.words[testData.currentQuestion],
            isCorrect: isCorrect,
            userAnswer: button.textContent
        });
        
        // Обновляем счет
        if (isCorrect) {
            testData.correctAnswers++;
            button.classList.add('correct');
        } else {
            button.classList.add('incorrect');
            // Подсвечиваем правильный ответ
            document.querySelectorAll('.answer-btn').forEach(btn => {
                if (btn.dataset.answerId == testData.words[testData.currentQuestion].id) {
                    btn.classList.add('correct');
                }
            });
        }
        
        // Показываем обратную связь
        const feedback = document.getElementById('testFeedback');
        feedback.classList.remove('hidden');
        feedback.innerHTML = `
            <h4>${isCorrect ? (this.state.language === 'ru' ? 'Правильно!' : '正确!') : (this.state.language === 'ru' ? 'Неправильно!' : '不正确!')}</h4>
            <p><strong>${testData.words[testData.currentQuestion].char}</strong> — ${testData.words[testData.currentQuestion].pinyin}</p>
            <p>${this.state.language === 'ru' ? 'Перевод:' : '翻译:'} ${testData.words[testData.currentQuestion].translation}</p>
            ${testData.words[testData.currentQuestion].example ? `<p>${this.state.language === 'ru' ? 'Пример:' : '例子:'} ${testData.words[testData.currentQuestion].example}</p>` : ''}
        `;
        
        // Блокируем кнопки
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Показываем кнопки навигации
        if (testData.currentQuestion < testData.words.length - 1) {
            document.getElementById('nextQuestion').classList.remove('hidden');
        }
        document.getElementById('finishTest').classList.remove('hidden');
    },

    // Следующий вопрос теста
    nextTestQuestion() {
        this.state.testData.currentQuestion++;
        this.showTestQuestion();
    },

    // Завершить тест
    finishTest() {
        const testData = this.state.testData;
        const percentage = Math.round((testData.correctAnswers / testData.words.length) * 100);
        
        // Обновляем результаты
        document.getElementById('resultScore').textContent = `${percentage}%`;
        document.getElementById('correctCount').textContent = testData.correctAnswers;
        document.getElementById('totalQuestions').textContent = testData.words.length;
        document.getElementById('resultPercentage').textContent = `${percentage}%`;
        
        // Определяем сообщение
        let message = '';
        if (percentage >= 90) {
            message = this.state.language === 'ru' ? 'Отличный результат!' : '优秀!';
        } else if (percentage >= 70) {
            message = this.state.language === 'ru' ? 'Хороший результат!' : '很好!';
        } else if (percentage >= 50) {
            message = this.state.language === 'ru' ? 'Неплохо, но можно лучше' : '不错，但可以更好';
        } else {
            message = this.state.language === 'ru' ? 'Нужно больше практики' : '需要更多练习';
        }
        
        document.getElementById('resultMessage').textContent = message;
        
        // Сохраняем результат теста в IndexedDB
        this.saveTestResult(testData.correctAnswers, testData.words.length, percentage);
        
        // Показываем результаты
        document.getElementById('testArea').classList.add('hidden');
        document.getElementById('testResults').classList.remove('hidden');
        
        this.state.testInProgress = false;
    },

    // Сохранить результат теста
    async saveTestResult(correct, total, percentage) {
        if (!this.state.db) return;
        
        const testResult = {
            id: `test-${Date.now()}`,
            date: new Date().toISOString(),
            correctAnswers: correct,
            totalQuestions: total,
            percentage: percentage,
            level: this.state.currentLevel
        };
        
        try {
            const transaction = this.state.db.transaction(['tests'], 'readwrite');
            const store = transaction.objectStore('tests');
            await store.add(testResult);
            console.log('Результат теста сохранен в IndexedDB');
        } catch (error) {
            console.error('Ошибка сохранения результата теста:', error);
        }
    },

    // Перезапустить тест
    restartTest() {
        document.getElementById('testOptions').style.display = 'block';
        document.getElementById('startTest').style.display = 'block';
        document.getElementById('testResults').classList.add('hidden');
    },

    // Показать настройки
    showSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('hidden');
        
        // Устанавливаем текущие значения
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === this.state.language) {
                btn.classList.add('active');
            }
        });
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === this.state.theme) {
                btn.classList.add('active');
            }
        });
        
        document.getElementById('autoFlip').checked = this.state.autoFlip;
        
        // Назначаем обработчики для кнопок в настройках
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.language = btn.dataset.lang;
                this.applyLanguage();
            };
        });
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.theme = btn.dataset.theme;
                this.applyTheme();
            };
        });
    },

    // Закрыть настройки
    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    },

    // Сохранить и закрыть настройки
    saveAndCloseSettings() {
        const autoFlipCheckbox = document.getElementById('autoFlip');
        if (autoFlipCheckbox) {
            this.state.autoFlip = autoFlipCheckbox.checked;
        }
        
        this.saveSettings();
        this.closeSettings();
        const message = this.state.language === 'ru' 
            ? 'Настройки сохранены' 
            : '设置已保存';
        this.showNotification(message, 'success');
    },

    // Показать уведомление
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    },

    // Рендер приложения
    render() {
        if (!hskWords || hskWords.length === 0) {
            console.error('ОШИБКА: Слова не загружены!');
            this.showNotification('Ошибка загрузки словарных данных', 'error');
            return;
        }
        
        // Проверяем, существует ли элемент перед обновлением
        const flashcardContainer = document.querySelector('.flashcard-container');
        if (flashcardContainer && !flashcardContainer.querySelector('.empty-state')) {
            this.updateLearnMode();
        }
        
        this.updateProgressBar();
        
        // Загружаем начальные данные для других режимов
        this.loadReviewWords('all');
        this.loadAllWords();
    }
};

// PWA Installation
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

// Показываем кнопку установки при поддержке PWA
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired');
    
    // Предотвращаем автоматическое отображение промпта
    e.preventDefault();
    
    // Сохраняем событие для отложенного использования
    deferredPrompt = e;
    
    // Показываем кнопку установки
    if (installBtn) {
        installBtn.classList.remove('hidden');
    }
    
    // Обновляем UI для информирования пользователя
    if (App.state.language === 'ru') {
        App.showNotification('Приложение можно установить на рабочий стол!', 'info');
    } else {
        App.showNotification('应用可以安装到桌面!', 'info');
    }
});

// Обработчик клика на кнопке установки
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        console.log('Install button clicked');
        
        if (!deferredPrompt) {
            return;
        }
        
        // Показываем промпт установки
        deferredPrompt.prompt();
        
        // Ждем ответа пользователя
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // Сбрасываем сохраненное событие
        deferredPrompt = null;
        
        // Скрываем кнопку установки
        installBtn.classList.add('hidden');
    });
}

// Отслеживаем успешную установку
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    
    if (installBtn) {
        installBtn.classList.add('hidden');
    }
    
    if (App.state.language === 'ru') {
        App.showNotification('Приложение успешно установлено!', 'success');
    } else {
        App.showNotification('应用安装成功!', 'success');
    }
});

// Проверяем, установлено ли приложение уже
window.addEventListener('load', () => {
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://')) {
        console.log('App is running in standalone mode');
        if (installBtn) {
            installBtn.classList.add('hidden');
        }
    }
});

// Проверяем онлайн/офлайн статус
window.addEventListener('online', () => {
    document.getElementById('offlineNotification').classList.add('hidden');
    console.log('Вы онлайн');
});

window.addEventListener('offline', () => {
    document.getElementById('offlineNotification').classList.remove('hidden');
    console.log('Вы офлайн');
});

// Инициализация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('Service Worker зарегистрирован:', registration.scope);
                
                // Проверяем обновления Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Обнаружено обновление Service Worker');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Новая версия приложения доступна!');
                            // Можно показать уведомление пользователю
                            if (confirm('Доступна новая версия приложения. Обновить?')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch(function(error) {
                console.log('Ошибка регистрации Service Worker:', error);
            });
    });
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем загрузку данных перед инициализацией
    if (typeof hskWords === 'undefined') {
        console.error('Переменная hskWords не определена!');
        alert('Ошибка: данные слов не загружены. Проверьте подключение файлов данных.');
        return;
    }
    
    if (!hskWords || hskWords.length === 0) {
        console.error('Массив hskWords пустой!');
        alert('Ошибка: словарные данные пусты. Проверьте содержимое файлов данных.');
        return;
    }
    
    console.log('Данные успешно загружены, инициализируем приложение...');
    
    // Инициализируем статус
    if (!navigator.onLine) {
        document.getElementById('offlineNotification').classList.remove('hidden');
    }
    
    try {
        await App.init();
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        // Пробуем инициализировать без IndexedDB
        App.loadSettings();
        App.loadProgressFromLocalStorage();
        App.setupEventListeners();
        App.applyTheme();
        App.applyLanguage();
        App.render();
        App.updateProgressBar();
        App.loadAllWords();
    }
});

// Добавляем стили для уведомлений
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 15px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        z-index: 1000;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    }
    
    .notification-info { background: linear-gradient(135deg, #4a90e2 0%, #357ae8 100%); }
    .notification-success { background: linear-gradient(135deg, #34a853 0%, #2e8b57 100%); }
    .notification-warning { background: linear-gradient(135deg, #fbbc05 0%, #ff9800 100%); }
    .notification-error { background: linear-gradient(135deg, #ea4335 0%, #d23f31 100%); }
    
    .notification-close {
        background: transparent;
        border: none;
        color: inherit;
        font-size: 20px;
        cursor: pointer;
        margin-left: 15px;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Экспортируем App для отладки
window.App = App;
