// Основной объект приложения
const App = {
    // Текущее состояние
    state: {
        currentMode: 'learn',
        currentCardIndex: 0,
        learnedWords: new Set(),
        reviewWords: [],
        testInProgress: false,
        testResults: null,
        cardOrder: [],
        allWords: [...hskWords]
    },

    // Инициализация
    init() {
        this.loadProgress();
        this.setupEventListeners();
        this.render();
        this.updateProgressBar();
    },

    // Загрузка прогресса из localStorage
    loadProgress() {
        const saved = localStorage.getItem('hsk1-progress');
        if (saved) {
            const data = JSON.parse(saved);
            this.state.learnedWords = new Set(data.learnedWords || []);
            this.state.reviewWords = data.reviewWords || [];
            
            // Инициализируем порядок карточек для изучения
            this.state.cardOrder = this.getNewWords();
            if (this.state.cardOrder.length > 0) {
                this.state.currentCardIndex = 0;
            }
        } else {
            // Первый запуск - все слова новые
            this.state.cardOrder = [...Array(150).keys()].sort(() => Math.random() - 0.5);
            this.state.currentCardIndex = 0;
        }
    },

    // Сохранение прогресса в localStorage
    saveProgress() {
        const data = {
            learnedWords: Array.from(this.state.learnedWords),
            reviewWords: this.state.reviewWords,
            cardOrder: this.state.cardOrder,
            currentCardIndex: this.state.currentCardIndex
        };
        localStorage.setItem('hsk1-progress', JSON.stringify(data));
    },

    // Получение новых слов (еще не изученных)
    getNewWords() {
        return hskWords
            .map((word, index) => ({ word, index }))
            .filter(item => !this.state.learnedWords.has(item.word.id))
            .map(item => item.index)
            .sort(() => Math.random() - 0.5);
    },

    // Получение слов для повторения
    getReviewWords() {
        return hskWords.filter(word => this.state.learnedWords.has(word.id));
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

        // Управление карточками
        document.getElementById('flipCard').addEventListener('click', () => this.flipCard());
        document.getElementById('flashcard').addEventListener('click', () => this.flipCard());
        document.getElementById('prevCard').addEventListener('click', () => this.prevCard());
        document.getElementById('nextCard').addEventListener('click', () => this.nextCard());
        document.getElementById('shuffleCards').addEventListener('click', () => this.shuffleCards());
        document.getElementById('markLearned').addEventListener('click', () => this.markAsLearned());

        // Тестирование
        document.getElementById('startTest').addEventListener('click', () => this.startTest());
        document.getElementById('nextQuestion').addEventListener('click', () => this.nextTestQuestion());
        document.getElementById('finishTest').addEventListener('click', () => this.finishTest());

        // Все слова
        document.getElementById('wordSearch').addEventListener('input', (e) => this.filterWords(e.target.value));
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterWords(document.getElementById('wordSearch').value, btn.dataset.filter);
            });
        });

        // Управление прогрессом
        document.getElementById('resetProgress').addEventListener('click', () => this.resetProgress());
        document.getElementById('exportData').addEventListener('click', (e) => {
            e.preventDefault();
            this.exportProgress();
        });
        document.getElementById('importData').addEventListener('click', (e) => {
            e.preventDefault();
            this.importProgress();
        });

        // Модальное окно
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('copyData').addEventListener('click', () => this.copyData());

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
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
            }
        });
    },

    // Переключение режима
    switchMode(mode) {
        // Обновляем активную кнопку
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });

        // Скрываем все режимы
        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.remove('active');
        });

        // Показываем выбранный режим
        document.getElementById(`${mode}Mode`).classList.add('active');
        this.state.currentMode = mode;

        // Обновляем контент для режима
        switch(mode) {
            case 'learn':
                this.updateLearnMode();
                break;
            case 'review':
                this.updateReviewMode();
                break;
            case 'test':
                this.updateTestMode();
                break;
            case 'all':
                this.updateAllWordsMode();
                break;
        }

        this.updateProgressBar();
    },

    // Обновление режима изучения
    updateLearnMode() {
        if (this.state.cardOrder.length === 0) {
            this.state.cardOrder = this.getNewWords();
            this.state.currentCardIndex = 0;
        }

        if (this.state.cardOrder.length > 0) {
            const wordIndex = this.state.cardOrder[this.state.currentCardIndex];
            const word = hskWords[wordIndex];
            
            document.getElementById('currentCard').textContent = this.state.currentCardIndex + 1;
            document.getElementById('totalCards').textContent = this.state.cardOrder.length;
            document.getElementById('currentCharacter').textContent = word.char;
            document.getElementById('currentPinyin').textContent = word.pinyin;
            document.getElementById('backCharacter').textContent = word.char;
            document.getElementById('backPinyin').textContent = word.pinyin;
            document.getElementById('currentTranslation').textContent = word.translation;
            document.getElementById('currentExample').textContent = word.example || 'Пример отсутствует';
            
            // Сбрасываем переворот карточки
            document.getElementById('flashcard').classList.remove('flipped');
        } else {
            // Нет новых слов для изучения
            document.querySelector('.flashcard-container').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="font-size: 60px; color: #198754; margin-bottom: 20px;"></i>
                    <h3>Поздравляем!</h3>
                    <p>Вы изучили все слова из HSK 1!</p>
                    <p>Перейдите в режим "Повторение" для закрепления знаний.</p>
                </div>
            `;
        }
    },

    // Обновление режима повторения
    updateReviewMode() {
        const reviewWords = this.getReviewWords();
        const container = document.getElementById('reviewContainer');
        const badge = document.getElementById('reviewCount');
        
        badge.textContent = reviewWords.length;
        
        if (reviewWords.length === 0) {
            container.innerHTML = `
                <div class="empty">
                    <i class="fas fa-book-reader"></i>
                    <h3>Нет слов для повторения</h3>
                    <p>Изучите слова в режиме "Изучение", чтобы они появились здесь.</p>
                </div>
            `;
        } else {
            let html = '<div class="review-words">';
            reviewWords.forEach(word => {
                html += `
                    <div class="review-word">
                        <div class="review-char">${word.char}</div>
                        <div class="review-pinyin">${word.pinyin}</div>
                        <div class="review-translation">${word.translation}</div>
                        ${word.example ? `<div class="review-example">${word.example}</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
    },

    // Обновление режима тестирования
    updateTestMode() {
        // Сбрасываем состояние теста
        this.state.testInProgress = false;
        this.state.testResults = null;
        
        // Показываем настройки теста
        document.getElementById('testArea').classList.add('hidden');
        document.getElementById('testResults').classList.add('hidden');
        document.querySelector('.test-options').classList.remove('hidden');
    },

    // Обновление режима всех слов
    updateAllWordsMode() {
        this.renderAllWords();
    },

    // Рендер всех слов
    renderAllWords(filter = '', category = 'all') {
        const container = document.getElementById('wordsGrid');
        let filteredWords = hskWords;
        
        // Применяем фильтр по поиску
        if (filter) {
            const searchLower = filter.toLowerCase();
            filteredWords = filteredWords.filter(word => 
                word.char.toLowerCase().includes(searchLower) ||
                word.pinyin.toLowerCase().includes(searchLower) ||
                word.translation.toLowerCase().includes(searchLower)
            );
        }
        
        // Применяем фильтр по категории
        if (category === 'learned') {
            filteredWords = filteredWords.filter(word => this.state.learnedWords.has(word.id));
        } else if (category === 'new') {
            filteredWords = filteredWords.filter(word => !this.state.learnedWords.has(word.id));
        }
        
        // Рендерим слова
        let html = '';
        filteredWords.forEach(word => {
            const isLearned = this.state.learnedWords.has(word.id);
            html += `
                <div class="word-card ${isLearned ? 'learned' : ''}">
                    <div class="word-char">${word.char}</div>
                    <div class="word-pinyin">${word.pinyin}</div>
                    <div class="word-translation">${word.translation}</div>
                    ${word.example ? `<div class="word-example">${word.example}</div>` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html || '<p style="grid-column: 1/-1; text-align: center; color: #666;">Слова не найдены</p>';
    },

    // Фильтрация слов
    filterWords(searchTerm, category = 'all') {
        this.renderAllWords(searchTerm, category);
    },

    // Переворот карточки
    flipCard() {
        document.getElementById('flashcard').classList.toggle('flipped');
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
        // Перемешиваем только оставшиеся карточки
        const currentIndex = this.state.currentCardIndex;
        const remainingCards = this.state.cardOrder.slice(currentIndex);
        
        // Перемешиваем оставшиеся карточки
        for (let i = remainingCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingCards[i], remainingCards[j]] = [remainingCards[j], remainingCards[i]];
        }
        
        // Объединяем с уже пройденными карточками
        this.state.cardOrder = [
            ...this.state.cardOrder.slice(0, currentIndex),
            ...remainingCards
        ];
        
        // Обновляем отображение
        this.updateLearnMode();
        
        // Показываем уведомление
        this.showNotification('Карточки перемешаны!', 'success');
    },

    // Отметить как изученное
    markAsLearned() {
        if (this.state.cardOrder.length === 0) return;
        
        const wordIndex = this.state.cardOrder[this.state.currentCardIndex];
        const word = hskWords[wordIndex];
        
        // Добавляем слово в изученные
        this.state.learnedWords.add(word.id);
        
        // Удаляем из текущего порядка карточек
        this.state.cardOrder.splice(this.state.currentCardIndex, 1);
        
        // Если это была последняя карточка, переходим к предыдущей
        if (this.state.currentCardIndex >= this.state.cardOrder.length && this.state.cardOrder.length > 0) {
            this.state.currentCardIndex = this.state.cardOrder.length - 1;
        }
        
        // Сохраняем прогресс
        this.saveProgress();
        
        // Обновляем отображение
        this.updateLearnMode();
        this.updateProgressBar();
        
        // Показываем уведомление
        this.showNotification(`Слово "${word.char}" добавлено в повторение!`, 'success');
    },

    // Обновление прогресс-бара
    updateProgressBar() {
        const totalWords = hskWords.length;
        const learnedCount = this.state.learnedWords.size;
        const progressPercent = (learnedCount / totalWords) * 100;
        
        document.getElementById('progressFill').style.width = `${progressPercent}%`;
        document.getElementById('progressText').textContent = `Прогресс: ${learnedCount}/${totalWords}`;
        
        // Обновляем бейдж в навигации
        document.getElementById('reviewCount').textContent = learnedCount;
    },

    // Начать тест
    startTest() {
        const testType = document.querySelector('input[name="testType"]:checked').value;
        const questionCount = parseInt(document.getElementById('questionCount').value);
        
        // Создаем тест
        this.state.testInProgress = true;
        this.state.testResults = {
            total: questionCount,
            correct: 0,
            currentQuestion: 0,
            questions: [],
            answers: []
        };
        
        // Выбираем случайные слова для теста
        const allWords = [...hskWords];
        const testWords = [];
        
        for (let i = 0; i < questionCount; i++) {
            const randomIndex = Math.floor(Math.random() * allWords.length);
            testWords.push(allWords[randomIndex]);
        }
        
        // Создаем вопросы в зависимости от типа теста
        testWords.forEach((word, index) => {
            let question, correctAnswer, options;
            
            switch(testType) {
                case 'charToTranslation':
                    question = word.char;
                    correctAnswer = word.translation;
                    options = this.generateOptions(word.translation, 'translation');
                    break;
                case 'pinyinToChar':
                    question = word.pinyin;
                    correctAnswer = word.char;
                    options = this.generateOptions(word.char, 'char');
                    break;
                case 'translationToChar':
                    question = word.translation;
                    correctAnswer = word.char;
                    options = this.generateOptions(word.char, 'char');
                    break;
            }
            
            this.state.testResults.questions.push({
                question,
                correctAnswer,
                options: this.shuffleArray([...options, correctAnswer]),
                word: word
            });
        });
        
        // Показываем область теста
        document.querySelector('.test-options').classList.add('hidden');
        document.getElementById('testArea').classList.remove('hidden');
        document.getElementById('testResults').classList.add('hidden');
        
        // Показываем первый вопрос
        this.showTestQuestion(0);
    },

    // Генерация вариантов ответов
    generateOptions(correctAnswer, type) {
        const options = new Set();
        options.add(correctAnswer);
        
        // Добавляем случайные неправильные варианты
        while (options.size < 4) {
            let randomWord;
            
            if (type === 'translation') {
                randomWord = hskWords[Math.floor(Math.random() * hskWords.length)].translation;
            } else if (type === 'char') {
                randomWord = hskWords[Math.floor(Math.random() * hskWords.length)].char;
            }
            
            if (randomWord !== correctAnswer) {
                options.add(randomWord);
            }
        }
        
        return Array.from(options).filter(opt => opt !== correctAnswer).slice(0, 3);
    },

    // Перемешивание массива
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    // Показать вопрос теста
    showTestQuestion(questionIndex) {
        const test = this.state.testResults;
        const question = test.questions[questionIndex];
        
        // Обновляем прогресс
        const progressPercent = ((questionIndex) / test.total) * 100;
        document.getElementById('testProgressFill').style.width = `${progressPercent}%`;
        document.getElementById('testProgressText').textContent = `Вопрос ${questionIndex + 1}/${test.total}`;
        document.getElementById('correctCount').textContent = test.correct;
        document.getElementById('totalQuestions').textContent = test.total;
        
        // Показываем вопрос
        document.getElementById('testQuestion').innerHTML = `
            <div class="question-text">${question.question}</div>
        `;
        
        // Показываем варианты ответов
        const answersContainer = document.getElementById('testAnswers');
        answersContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option;
            button.dataset.answer = option;
            button.addEventListener('click', () => this.checkAnswer(option, question.correctAnswer));
            answersContainer.appendChild(button);
        });
        
        // Скрываем кнопку следующего вопроса
        document.getElementById('nextQuestion').classList.add('hidden');
        document.getElementById('testFeedback').classList.add('hidden');
    },

    // Проверка ответа
    checkAnswer(userAnswer, correctAnswer) {
        const test = this.state.testResults;
        const currentQuestion = test.questions[test.currentQuestion];
        const isCorrect = userAnswer === correctAnswer;
        
        // Записываем ответ
        test.answers.push({
            question: currentQuestion.question,
            userAnswer,
            correctAnswer,
            isCorrect,
            word: currentQuestion.word
        });
        
        // Обновляем счетчик правильных ответов
        if (isCorrect) {
            test.correct++;
        }
        
        // Показываем обратную связь
        const feedback = document.getElementById('testFeedback');
        feedback.classList.remove('hidden');
        
        if (isCorrect) {
            feedback.innerHTML = `
                <h3 style="color: #198754;"><i class="fas fa-check-circle"></i> Правильно!</h3>
                <p>Слово: ${currentQuestion.word.char} (${currentQuestion.word.pinyin})</p>
                <p>Перевод: ${currentQuestion.word.translation}</p>
            `;
        } else {
            feedback.innerHTML = `
                <h3 style="color: #dc3545;"><i class="fas fa-times-circle"></i> Неправильно</h3>
                <p>Правильный ответ: ${correctAnswer}</p>
                <p>Слово: ${currentQuestion.word.char} (${currentQuestion.word.pinyin})</p>
                <p>Перевод: ${currentQuestion.word.translation}</p>
            `;
        }
        
        // Подсвечиваем правильные/неправильные ответы
        document.querySelectorAll('.answer-btn').forEach(btn => {
            if (btn.dataset.answer === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.dataset.answer === userAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });
        
        // Показываем кнопку следующего вопроса или завершения теста
        if (test.currentQuestion < test.total - 1) {
            document.getElementById('nextQuestion').classList.remove('hidden');
        } else {
            document.getElementById('finishTest').classList.remove('hidden');
        }
    },

    // Следующий вопрос теста
    nextTestQuestion() {
        this.state.testResults.currentQuestion++;
        this.showTestQuestion(this.state.testResults.currentQuestion);
    },

    // Завершить тест
    finishTest() {
        const test = this.state.testResults;
        const score = Math.round((test.correct / test.total) * 100);
        
        // Показываем результаты
        document.getElementById('testArea').classList.add('hidden');
        document.getElementById('testResults').classList.remove('hidden');
        
        let message = '';
        let emoji = '';
        
        if (score >= 90) {
            message = 'Отлично! Вы отлично знаете слова HSK 1!';
            emoji = '🎉';
        } else if (score >= 70) {
            message = 'Хорошо! Продолжайте в том же духе!';
            emoji = '👍';
        } else if (score >= 50) {
            message = 'Неплохо, но есть куда расти!';
            emoji = '💪';
        } else {
            message = 'Попробуйте еще раз!';
            emoji = '📚';
        }
        
        document.getElementById('testResults').innerHTML = `
            <div class="test-results-content">
                <h2>Результаты теста</h2>
                <div class="result-score">${score}% ${emoji}</div>
                <div class="result-message">${message}</div>
                
                <div class="result-details">
                    <div class="result-detail">
                        <h4>Всего вопросов</h4>
                        <p>${test.total}</p>
                    </div>
                    <div class="result-detail">
                        <h4>Правильных ответов</h4>
                        <p>${test.correct}</p>
                    </div>
                    <div class="result-detail">
                        <h4>Неправильных ответов</h4>
                        <p>${test.total - test.correct}</p>
                    </div>
                </div>
                
                <button id="restartTest" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Пройти еще раз
                </button>
            </div>
        `;
        
        // Добавляем обработчик для кнопки перезапуска
        document.getElementById('restartTest').addEventListener('click', () => {
            this.updateTestMode();
        });
    },

    // Сброс прогресса
    resetProgress() {
        if (confirm('Вы уверены, что хотите сбросить весь прогресс? Все изученные слова будут удалены.')) {
            this.state.learnedWords.clear();
            this.state.reviewWords = [];
            this.state.cardOrder = [...Array(150).keys()].sort(() => Math.random() - 0.5);
            this.state.currentCardIndex = 0;
            
            localStorage.removeItem('hsk1-progress');
            
            this.updateLearnMode();
            this.updateProgressBar();
            
            this.showNotification('Прогресс сброшен!', 'info');
        }
    },

    // Экспорт прогресса
    exportProgress() {
        const data = {
            learnedWords: Array.from(this.state.learnedWords),
            reviewWords: this.state.reviewWords,
            cardOrder: this.state.cardOrder,
            currentCardIndex: this.state.currentCardIndex,
            exportDate: new Date().toISOString()
        };
        
        document.getElementById('modalTitle').textContent = 'Экспорт прогресса';
        document.getElementById('dataTextarea').value = JSON.stringify(data, null, 2);
        document.getElementById('dataModal').classList.remove('hidden');
    },

    // Импорт прогресса
    importProgress() {
        document.getElementById('modalTitle').textContent = 'Импорт прогресса';
        document.getElementById('dataTextarea').value = '';
        document.getElementById('dataTextarea').placeholder = 'Вставьте сюда данные экспорта...';
        document.getElementById('dataModal').classList.remove('hidden');
        
        // Временно меняем обработчик кнопки копирования
        const copyBtn = document.getElementById('copyData');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Импортировать';
        
        const originalClick = copyBtn.onclick;
        copyBtn.onclick = () => {
            try {
                const data = JSON.parse(document.getElementById('dataTextarea').value);
                
                // Валидация данных
                if (!data.learnedWords || !Array.isArray(data.learnedWords)) {
                    throw new Error('Некорректный формат данных');
                }
                
                // Импортируем данные
                this.state.learnedWords = new Set(data.learnedWords);
                this.state.reviewWords = data.reviewWords || [];
                this.state.cardOrder = data.cardOrder || this.getNewWords();
                this.state.currentCardIndex = data.currentCardIndex || 0;
                
                this.saveProgress();
                this.updateLearnMode();
                this.updateProgressBar();
                
                this.closeModal();
                this.showNotification('Прогресс успешно импортирован!', 'success');
                
            } catch (error) {
                alert('Ошибка при импорте данных: ' + error.message);
            }
        };
        
        // Восстанавливаем оригинальный обработчик после закрытия модального окна
        const modal = document.getElementById('dataModal');
        const observer = new MutationObserver(() => {
            if (modal.classList.contains('hidden')) {
                copyBtn.textContent = originalText;
                copyBtn.onclick = originalClick;
                observer.disconnect();
            }
        });
        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    },

    // Копирование данных
    copyData() {
        const textarea = document.getElementById('dataTextarea');
        textarea.select();
        document.execCommand('copy');
        this.showNotification('Данные скопированы в буфер обмена!', 'success');
    },

    // Закрыть модальное окно
    closeModal() {
        document.getElementById('dataModal').classList.add('hidden');
    },

    // Показать уведомление
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Добавляем стили для уведомления
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 1000;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    animation: slideIn 0.3s ease;
                }
                
                .notification-info { background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); }
                .notification-success { background: linear-gradient(135deg, #198754 0%, #146c43 100%); }
                .notification-warning { background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); color: #333; }
                .notification-error { background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%); }
                
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
        }
        
        // Добавляем уведомление на страницу
        document.body.appendChild(notification);
        
        // Обработчик закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    },

    // Рендер приложения
    render() {
        this.updateLearnMode();
        this.updateProgressBar();
    }
};

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});