(() => {
  // параметры игры
  const game = {
    // название игры
    title: 'НАЙДИ ПАРУ',
    // размер поля игры
    w: 4,
    h: 4,
    // счетчик кликов до нахождения пары
    click: 0,
    // счетчик количества ходов (кликов) в игре
    step: 0,
    // счетчик открытых пар
    paired: 0,
    // массив для формирования карточек
    arrayCards: [],
    // контейнер для первой открытой карты
    cardOpenSave: '',
    // таймаут показа открытых карт
    timeoutCard: 600,
    // таймаут нажатия кнопок
    timeoutClick: 600,
    // режим игры: free - свободный, timer - на время, step - на число шагов, timerStap - смешанный, level - по уровням сложности
    mode: 'free',
    // результат окончания игры: win - победа, loc - проигрыш
    over: '',
  }

  // таймер
  const timer = {
    // начальное значение 6000
    init: 6000,
    // минимальное значение 3000
    min: 3000,
    // максимальное значение
    max: 60000,
    // текущее значение
    current: 0,
    // следующее событие
    event: 'start',
    // статус остановки
    break: false,
  }

  // id таймера
  let timerID;

  // определение числа пар
  function numberOfPairs(withField, heightField) {
    return (withField * heightField) / 2
  }

  // создание массива карточек
  function createCardsPaired(numberPairs, array) {
    array = [];
    for (let i = 0; i < numberPairs; i++) {
      let objCard = {};
      objCard.id = i;
      // символ или изображение на карте может быть любым
      objCard.simbol = i + 1;
      array.push(objCard);
      array.push(objCard);
    }
    return array;
  }

  // перемешивание массива
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // заголовок
  function createTitle(name) {
    const titile = document.createElement('h1');
    titile.classList.add('paired-card__title')
    titile.textContent = name;
    return titile;
  }

  // игровое поле------------------------------------
  // создание строки сетки
  function createRow() {
    const row = document.createElement('div');
    row.classList.add('row');
    return row;
  }

  // создание карточки
  function createCard(objCard) {
    const card = document.createElement('button');
    card.classList.add('col', 'm-1', 'js-card', 'js-card-close', 'game-button', 'field__button', 'field__button_close')
    card.textContent = '';
    card.value = objCard.id;
    // обработчик клика по карте
    card.addEventListener('click', () => {
      card.classList.remove('js-card-close', 'field__button_close');
      card.classList.add('js-card-open', 'field__button_open');
      card.style.opacity = '1';
      card.textContent = objCard.simbol;
      card.disabled = true;
      game.click++;
      // проверка условий игры
      rulesGame(card);
    })
    return card;
  }

  //установка адаптивной высоты карты (не реализована)
  function setHeightCard() {
    const listCards = document.querySelectorAll('.js-card');
    listCards.forEach(card => {
      card.style.height = `100px`;
      // card.style.height = `${card.offsetWidth}px`;
    });
  }

  // возврат карты в исходное состояние
  function cleanCard(element) {
    element.disabled = false;
    element.classList.remove('js-card-open', 'field__button_open');
    element.classList.add('js-card-close', 'field__button_close')
    element.textContent = '';
  }

  // формируем игровое поле
  function createField(widthField, heightField, array) {
    const field = document.createElement('div');
    field.classList.add('paired-card__field', 'js-field-game')
    let counter = 0;
    for (let i = 0; i < heightField; i++) {
      let row = createRow();
      for (let j = 0; j < widthField; j++) {
        let card = createCard(array[counter]);
        row.append(card);
        counter++;
      }
      field.append(row)
    }
    return field;
  }

  // инициализация игрового поля
  function initiallField() {
    // создаем массив
    game.arrayCards = createCardsPaired(numberOfPairs(game.w, game.h), game.arrayCards);
    // перемешиваем массив
    game.arrayCards = shuffle(game.arrayCards);
    // удаляем предыдущее игровое поле
    const container = document.getElementById('game-paired-cards');
    const fieldGameOld = document.querySelector('.js-field-game');
    if (fieldGameOld) {
      container.removeChild(fieldGameOld);
    }
    // фомируем игровое поле
    const fieldGameNew = createField(game.w, game.h, game.arrayCards);
    container.append(fieldGameNew);
    // устанавливаем высоту карты
    setHeightCard();
  }

  // блокировка-разблокировка закрытых карт
  function disableCloseCards(disableStatus) {
    const listCloseCards = document.querySelectorAll('.js-card-close');
    for (const cardClose of listCloseCards) {
      cardClose.disabled = disableStatus;
    }
  }

  // обнуление счетчиков
  function cleanCounts() {
    // сбрасываем счетчики
    game.click = 0;
    game.step = 0;
    game.paired = 0;
    document.querySelector('.js-count-step').textContent = game.step;
  }

  // подготовка к новой игре
  function cleanGame() {
    // таймер в исходное состояние
    cleanTimer();
    // кнопка 'ЗАКОНЧИТЬ ИГРУ' в исходное состояние
    cleanTimerBtnSet();
    // разблокировка кнопки изменения размеров поля
    document.querySelector('.js-field-size').disabled = false;
    // смена режима игры
    game.mode = 'free';
    game.over = '';
    // очистка счетчиков
    cleanCounts();
    // инициализация нового игрового поля
    initiallField();
  }

  // панель управления--------------------------------------------------
  function createControlPanel() {
    const wrap = document.createElement('div');
    wrap.classList.add('control-panel', 'paired-card__control-panel');
    const wrapTimer = document.createElement('div');
    wrapTimer.classList.add('control-panel__timer', 'timer');
    const wrapCountStep = document.createElement('div');
    wrapCountStep.classList.add('control-panel__count-step', 'count-step');

    wrap.append(wrapTimer, wrapCountStep);
    return {wrap, wrapTimer, wrapCountStep};
  }

  // панель таймера
  function createTimerPanel() {
    const wrap = document.createElement('div');
    wrap.classList.add('timer__wrap');
    const title = document.createElement('h3');
    title.classList.add('timer__title');
    title.textContent = 'ИГРАТЬ НА ВРЕМЯ';
    const panelBtn = document.createElement('div');
    panelBtn.classList.add('timer__panel-button');
    const outWindow = document.createElement('div');
    outWindow.classList.add('js-timer-windov', 'timer__window');
    outWindow.textContent = formatMinSec(timer.init, true);
    // кнопка 'УСТАНОВИТЬ ТАЙМЕР'
    const btnSet = document.createElement('button');
    btnSet.classList.add('js-timer-set', 'timer__button-set', 'game-button');
    btnSet.textContent = 'УСТАНОВИТЬ ТАЙМЕР';
    btnSet.setAttribute('data-bs-toggle', 'modal');
    btnSet.setAttribute('data-bs-target', '#modal-timer-set');
    // событие на кнопке "ЗАКОНЧИТЬ ИГРУ"
    btnSet.addEventListener('click', () => {
      if (timer.event == 'contin') {
        // игра в исходное состояние
        cleanGame();
      }
    })
    const btnStart = document.createElement('button');
    btnStart.classList.add('js-timer-start', 'timer__button-start', 'game-button');
    btnStart.textContent = 'СТАРТ!!!';
    btnStart.addEventListener('click', debounce(rulesTimerStart, game.timeoutClick));

    panelBtn.append(outWindow, btnStart, btnSet);
    wrap.append(title, panelBtn);
    return wrap;
  }

  // таймер в исходное состояние
  function cleanTimer() {
    timer.event = 'start';
    timer.current = 0;
    timer.break = false;
    document.querySelector('.js-timer-start').textContent = 'СТАРТ !!!';
    document.querySelector('.js-timer-windov').textContent = formatMinSec(timer.init, true);
  }

  // переназначение кнопки "УСТАНОВИТЬ ТАЙМЕР" в "ЗАВЕРШИТЬ ИГРУ"
  function changeTimerBtnSet(disabledValue) {
    const timerBtnSet = document.querySelector('.js-timer-set')
    timerBtnSet.disabled = disabledValue;
    timerBtnSet.classList.add('timer__button-gameover');
    timerBtnSet.textContent = 'ЗАВЕРШИТЬ ИГРУ';
    timerBtnSet.removeAttribute('data-bs-toggle', 'modal');
    timerBtnSet.removeAttribute('data-bs-target', '#modal-timer-set');
  }

  // кнопка "ЗАКОНЧИТЬ ИГРУ" в исходное состояние
  function cleanTimerBtnSet() {
    const timerBtnSet = document.querySelector('.js-timer-set')
    timerBtnSet.disabled = false;
    timerBtnSet.classList.remove('timer__button-gameover');
    timerBtnSet.textContent = 'УСТАНОВИТЬ ТАЙМЕР';
    timerBtnSet.setAttribute('data-bs-toggle', 'modal');
    timerBtnSet.setAttribute('data-bs-target', '#modal-timer-set');
  }

  // счетчтк числа ходов
  function createCountSteps() {
    const wrap = document.createElement('div');
    wrap.classList.add('count-step__wrap');
    const caption = document.createElement('span');
    caption.classList.add('count-step__caption');
    caption.textContent = 'Вы сделали';
    const outWindov = document.createElement('span');
    outWindov.classList.add('count-step__windov', 'js-count-step');
    outWindov.textContent = 0;
    const textSupport = document.createElement('span');
    textSupport.classList.add('count-step__support', 'js-count-step-support');
    textSupport.textContent = formatEndings(0, 'ход');

    wrap.append(caption, outWindov, textSupport);
    return wrap;
  }

  // кнопка 'ВЫБРАТЬ РАЗМЕР ИГРОВОГО ПОЛЯ'
  function createBtnResizeField() {
    const btnResize = document.createElement('button');
    btnResize.classList.add('js-field-size', 'paired-card__field-resize', 'game-button');
    btnResize.setAttribute('data-bs-toggle', 'modal');
    btnResize.setAttribute('data-bs-target', '#modal-size-field');
    btnResize.textContent = 'ВЫБРАТЬ ИГРОВОЕ ПОЛЕ';

    return btnResize;
  }

  // модальные окна------------------------------------------------------
  // шаблон модального окна (оболочка) bootstrap
  function createModal(contentBody) {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade');
    modal.tabIndex = -1;
    modal.setAttribute('data-bs-backdrop', 'static');
    modal.setAttribute('data-bs-keyboard', 'false');
    modal.setAttribute('aria-labelledby', 'staticBackdropLabel');
    modal.setAttribute('aria-hidden', 'true');

    const modalDialog = document.createElement('div');
    modalDialog.classList.add('modal-dialog', 'modal-lg');
    const modalConten = document.createElement('div');
    modalConten.classList.add('modal-content');
    const modalHeader = document.createElement('div');
    modalHeader.classList.add('modal-header');
    const modalTitle = document.createElement('h2');
    modalTitle.classList.add('modal-title');
    const modalBtnClose = document.createElement('button');
    modalBtnClose.classList.add("btn-close");
    modalBtnClose.setAttribute('data-bs-dismiss', 'modal');
    modalBtnClose.ariaLabel = "Close";
    const modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    const modalFooter = document.createElement('div');
    modalFooter.classList.add('modal-footer');
    const modalBtnStart = document.createElement('button');
    modalBtnStart.classList.add("game-button");
    modalBtnStart.setAttribute('data-bs-dismiss', 'modal');

    modalHeader.append(modalTitle, modalBtnClose);
    modalBody.append(contentBody);
    modalFooter.append(modalBtnStart);
    modalConten.append(modalHeader, modalBody, modalFooter);
    modalDialog.append(modalConten);
    modal.append(modalDialog);
    return {modal,modalConten, modalTitle, modalBtnStart, modalBtnClose};
  }

  // радио чекбокс
  function createRadioCheck(optionClass, name, index) {
    const wrapForm = document.createElement('div');
    wrapForm.classList.add('form-check', 'modal-field__check-lable');
    wrapForm.classList.add(optionClass);
    const input = document.createElement('input');
    input.classList.add('form-check-input', 'modal-field__check-input');
    input.type = 'radio';
    input.id = name + index;
    input.value = index;
    input.name = name;
    // событие выбора чекбокса
    input.setAttribute('onchange','rulesCreateField(this.name, this.value)');
    const label = document.createElement('label');
    label.classList.add('form-check-label', 'modal-field__check-lable');
    label.for = name + index;
    label.textContent = index;

    wrapForm.append(input, label);
    return {wrapForm, input};
  }

  // панель выбора размера игрового поля с радио чекбоксами
  function createPanelSizeField(minSize = 1, maxSize = 4) {
    const wrap = document.createElement('div');
    wrap.classList.add('modal-field__body')
    const wrapWithField = document.createElement('div');
    wrapWithField.classList.add('with-line', 'd-flex', 'flex-nowrap', 'ps-5', 'modal-field__with');
    const wrapHeightField = document.createElement('div');
    wrapHeightField.classList.add('height-line', 'modal-field__height');
    wrap.append(wrapWithField, wrapHeightField)
    // горизонтальная строка
    for (let i = minSize; i <= maxSize; i++) {
      let radioChek = createRadioCheck('form-check-inline', 'js-with-field', i).wrapForm;
      wrapWithField.append(radioChek);
    }
    // вертикальная колонка
    for (let i = minSize; i <= maxSize; i++) {
      let radioChek = createRadioCheck('form-check-reverse', 'js-height-field', i).wrapForm;
      wrapHeightField.append(radioChek);
    }
    return wrap;
  }

  // панель установки таймера (input range)
  function createSetTimerPanel() {
    const timerSet = document.createElement('div');
    timerSet.classList.add('modal-timer__body');
    const timerSetInput = document.createElement('input');
    timerSetInput.classList.add('modal-timer__input-range', 'form-range');
    timerSetInput.id = 'timer-set-range';
    timerSetInput.type = 'range';
    timerSetInput.min = timer.min;
    timerSetInput.max = timer.max;
    timerSetInput.defaultValue = timer.init;
    timerSetInput.step = '100';
    const timerSetLabel = document.createElement('label');
    timerSetLabel.classList.add('modal-timer__label', 'form-label', 'js-timer-set-lable');
    timerSetLabel.for = 'timer-set-range';
    timerSetLabel.textContent = formatMinSec(timerSetInput.value, false, ' мин ', ' сек');
    // обработчик события на input range
    timerSetInput.setAttribute('onchange','rulesTimerSet(this.value)')

    timerSet.append(timerSetLabel, timerSetInput);
    return timerSet;
  }

  // сообщения окончания игры-------------------------
  // модальное окно окончания игры
  function createModalGameOver(panel) {
    const modalGameOver = createModal(panel);
    modalGameOver.modal.id = 'modal-game-over';
    modalGameOver.modalConten.classList.add('modal-gameover');
    modalGameOver.modalTitle.classList.add('modal-gameover__title');
    modalGameOver.modalTitle.textContent = 'ИГРА ОКОНЧЕНА';
    modalGameOver.modalBtnStart.classList.add('modal-gameover__button-newgame');
    modalGameOver.modalBtnStart.textContent = 'НОВАЯ ИГРА';
    // показать модальное окно
    visibleModal(modalGameOver);
    // обработчик на кнопку закрытия и 'НОВАЯ ИГРА'
    modalGameOver.modalBtnClose.addEventListener('click', () => {
      cleanGame();
      hiddenModal(modalGameOver);
    })
    modalGameOver.modalBtnStart.addEventListener('click', () => {
      cleanGame();
      hiddenModal(modalGameOver);
    })
    return modalGameOver;
  }

  // показать модальное окно
  function visibleModal(modalName) {
    modalName.modal.classList.add('show');
    modalName.modal.style.display = 'block';
    modalName.modal.removeAttribute('aria-hidden');
    modalName.modal.setAttribute('aria-modal', 'true');
    modalName.modal.setAttribute('role', 'dialog');
  }

  // скрыть модальное окно
  function hiddenModal(modalName) {
    modalName.modal.classList.remove('show');
    modalName.modal.style.display = 'none';
    modalName.modal.setAttribute('aria-hidden', 'true');
    modalName.modal.removeAttribute('aria-modal');
    modalName.modal.removeAttribute('role');
  }

  // панель сообщения окончания игры (для модального окна)
  function createPanelGameOver(message) {
    const wrap = document.createElement('div');
    wrap.classList.add('game-over');
    const title = document.createElement('h3');
    title.classList.add('game-over__title');

    wrap.append(title, message);
    return {wrap, title}
  }

  // сообщение выигрыш в свободном режиме
  function createMassageWinFree() {
    const wrap = document.createElement('div');
    wrap.classList.add('game-over__wrap-massage');
    const textMassage = document.createElement('span');
    textMassage.classList.add('game-over__text', 'win-theme__text');
    textMassage.textContent = 'все пары найдены за';
    const outStep = document.createElement('span');
    outStep.classList.add('game-over__out-windov', 'win-theme__number');
    const textSupport2 = document.createElement('span');
    textSupport2.classList.add('game-over__text', 'win-theme__text');
    textSupport2.textContent = 'ходов';

    wrap.append(textMassage, outStep, textSupport2);
    return {wrap, outStep, textSupport2}
  }

  // сообщение выигрыш в режиме на время
  function createMassageWinTime() {
    const wrap = document.createElement('div');
    wrap.classList.add('game-over__wrap-massage');

    const wrapSupport1 = document.createElement('div');
    wrapSupport1.classList.add('game-over__wrap-massage', 'game-over__wrap-massage_support');
    const textMassage = document.createElement('span');
    textMassage.classList.add('game-over__text', 'win-theme__text');
    textMassage.textContent = 'все пары найдены за';
    const outTime = document.createElement('span');
    outTime.classList.add('game-over__out-windov', 'win-theme__number');
    wrapSupport1.append(textMassage, outTime);

    const wrapSupport2 = document.createElement('div');
    wrapSupport2.classList.add('game-over__wrap-massage', 'game-over__wrap-massage');
    const textSupport2 = document.createElement('span');
    textSupport2.classList.add('game-over__text', 'win-theme__text');
    textSupport2.textContent = 'вы сделали';
    const outStep = document.createElement('span');
    outStep.classList.add('game-over__out-windov', 'win-theme__number');
    const textSupport3 = document.createElement('span');
    textSupport3.classList.add('game-over__text', 'win-theme__text');
    textSupport3.textContent = 'ходов';
    wrapSupport2.append(textSupport2, outStep, textSupport3);

    wrap.append(wrapSupport1, wrapSupport2);
    return {wrap, outTime, outStep, textSupport3};
  }
  // сообщение проигрыш по времени
  function createMassageLosTime() {
    const wrap = document.createElement('div');
    wrap.classList.add('game-over__wrap-massage');
    const textMassage = document.createElement('span');
    textMassage.classList.add('game-over__text', 'los-theme__text');
    textMassage.textContent = 'время вышло...';

    wrap.append(textMassage);
    return {wrap};
  }

  // правила -------------------------------------------------------------
  // правила открытия карт и выигрыша
  function rulesGame(element) {
    // если открыта первая карта запоминаем ее
    if (game.click == 1) {
      game.cardOpenSave = element;
      return;
    }
    // если открыта вторая карта
    if (game.click == 2) {
      // число ходов
      game.step++;
      // вывод числа ходов
      document.querySelector('.js-count-step').textContent = game.step;
      document.querySelector('.js-count-step-support').textContent = formatEndings(game.step, 'ход');

      let cardOpenCurrent = element;
      // если карты не совпадают = возвращаем их в исходное состояние с задержкой
      if (cardOpenCurrent.value !== game.cardOpenSave.value) {
        setTimeout(cleanCard, game.timeoutCard, game.cardOpenSave);
        setTimeout(cleanCard, game.timeoutCard, cardOpenCurrent);
        // брасываем счетчик кликов
        game.click = 0;
        game.cardOpenSave = '';
        return;
      } else {
        // если карты совпадают
        game.cardOpenSave = '';
        game.click = 0;
        game.paired++;
        // проверка условия окончания игры
        if (game.paired == numberOfPairs(game.w, game.h)) {
          // результат игры
          game.over = 'win';
          clearInterval(timerID);
          gameOver();
          return;
        }
        return;
      }
    }
  }

  // правила создания игрового поля (исключение выбора нечетного числа полей)
  function rulesCreateField(nameRadio, value) {
    // горизонтальный ряд
    if (nameRadio == 'js-with-field') {
      game.w = value;
      const listRadio = document.getElementsByName('js-height-field');
      if (value % 2 !== 0) {
        for (const radio of listRadio) {
          if (radio.value % 2 !== 0) {
            // блокируем нечетные чекбоксы в вертикальном ряду
            radio.disabled = true;
          }
        }
      } else {
        for (const radio of listRadio) {
          if (radio.disabled == true) {
            radio.disabled = false;
          }
        }
      }
    }
    // вертикальный ряд
    if (nameRadio == 'js-height-field') {
      game.h = value;
      const listRadio = document.getElementsByName('js-with-field');
      if (value % 2 !== 0) {
        for (const radio of listRadio) {
          if (radio.value % 2 !== 0) {
            // блокируем нечетные чекбоксы в горизонтальном ряду
            radio.disabled = true;
          }
        }
      } else {
        for (const radio of listRadio) {
          if (radio.disabled == true) {
            radio.disabled = false;
          }
        }
      }
    }
  }

  // правила установки таймера
  function rulesTimerSet(value) {
    const outWindov = document.querySelector('.js-timer-set-lable')
    outWindov.textContent = formatMinSec(value, false, ' мин ', ' сек');
    timer.init = value;
  }

  // правила запуска таймера
  function rulesTimerStart() {
    const timerBtnStart = document.querySelector('.js-timer-start');
    const timerWindow = document.querySelector('.js-timer-windov');
    const timerBtnSet = document.querySelector('.js-timer-set');
    const btnSizeField = document.querySelector('.js-field-size');
    // start
    if (timer.event == 'start') {
      timerBtnStart.textContent = 'СТОП !!!';
      // блокировка других кнопок
      timerBtnSet.disabled = true;
      btnSizeField.disabled = true;
      timer.event = 'stop';
      // смена режима игры
      game.mode = 'timer';
      // инициализация нового игрового поля
      cleanCounts();
      initiallField();
      // переопределение кнопки "УСТАНОВИТЬ ТАЙМЕР" в "ЗАКОНЧИТЬ ИГРУ"
      changeTimerBtnSet(true);
      // запуск таймера
      runTimer(timerWindow, timer.init);
      return;
    }
    // stop
    if (timer.event == 'stop') {
      timer.break = true;
      timer.event = 'contin';
      timerBtnStart.textContent = 'ПОДОЛЖИТЬ !!!';
      // переопределение кнопки "УСТАНОВИТЬ ТАЙМЕР" в "ЗАКОНЧИТЬ ИГРУ"
      changeTimerBtnSet(false);
      // блокировка игрового поля
      disableCloseCards(true);
      return;
    }
    // contin
    if (timer.event == 'contin') {
      timer.break = false;
      timer.event = 'stop';
      timerBtnStart.textContent = 'СТОП !!!';
      // блокировка других кнопок
      timerBtnSet.disabled = true;
      // разблокировка игрового поля
      disableCloseCards(false);
      // запуск таймера с точки остановки
      runTimer(timerWindow, timer.current);
      return;
    }
  }

  // правила работы таймера
  function runTimer(targetOut, timeStart) {
    timer.current = timeStart;
    function timeCount() {
      timer.current--;
      targetOut.textContent = formatMinSec(timer.current, true);
      // проигрышь по времени
      if (timer.current <= 0) {
        clearInterval(timerID);
        // результат игры
        game.over = 'los';
        gameOver();
      }
      // досрочная остановка таймера
      if (timer.break) {
        clearInterval(timerID);
      }
    }
    clearInterval(timerID);
    timerID = setInterval(timeCount, 10);
  }

  // правила окончания игры
  function gameOver() {
    const container = document.getElementById('game-paired-cards');
    // выигрыш
    if (game.over == 'win') {
      // выигрыш в свободном режиме
      if (game.mode == 'free') {
        const message = createMassageWinFree();
        message.outStep.textContent = game.step;
        message.textSupport2.textContent = formatEndings(game.step, 'ход');
        const panelGameOver = createPanelGameOver(message.wrap);
        panelGameOver.title.classList.add('win-theme__title');
        panelGameOver.title.textContent = 'ВЫ ВЫИГРАЛИ !!!';
        const modalWindov = createModalGameOver(panelGameOver.wrap);
        modalWindov.modalConten.classList.add('win-theme');
        container.append(modalWindov.modal);
      }
      // выигрыш в режиме на время
      if (game.mode == 'timer') {
        const message = createMassageWinTime();
        message.outTime.textContent = formatMinSec(timer.init - timer.current, false, ' мин ', ' сек')
        message.outStep.textContent = game.step;
        message.textSupport3.textContent = formatEndings(game.step, 'ход')
        const panelGameOver = createPanelGameOver(message.wrap);
        panelGameOver.title.classList.add('win-theme__title');
        panelGameOver.title.textContent = 'ВЫ ВЫИГРАЛИ !!!';
        const modalWindov = createModalGameOver(panelGameOver.wrap);
        modalWindov.modalConten.classList.add('win-theme');
        container.append(modalWindov.modal);
      }
    }
    // проигрыш
    if (game.over == 'los') {
      // проигрыш по времени
      if (game.mode == 'timer') {
        const message = createMassageLosTime();
        const panelGameOver = createPanelGameOver(message.wrap);
        panelGameOver.title.classList.add('los-theme__title');
        panelGameOver.title.textContent = 'ВЫ ПРОИГРАЛИ...';
        const modalWindov = createModalGameOver(panelGameOver.wrap);
        modalWindov.modalConten.classList.add('los-theme');
        container.append(modalWindov.modal);
      }
    }
  }

  // вспомогательные функции-----------------------------------------------------

  // задержка выполнения функции
  function debounce(fn, ms) {
    let isCooldown = false;
    return function () {
      if (isCooldown) return;
      fn.apply(this, arguments);
      isCooldown = true;
      setTimeout(() => (isCooldown = false), ms);
    };
  }

  // перевод времени в формат мин:сек
  //timeVal - время в миллисекундах
  // msStatus - нужно ли выводить миллисекунды (true/false)
  //sepMin, sepSec - разделители минут и секунд
  function formatMinSec(timeVal, msStatus = false, sepMin = ' : ', sepSec = ' . ') {
    let minutes = Math.trunc(timeVal / 6000);
    let seconds = Math.trunc((timeVal - minutes * 6000) / 100);
    let milliseconds = timeVal - minutes * 6000 - seconds * 100
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    if (milliseconds < 10) {
      milliseconds = '0' + milliseconds;
    }
    if (msStatus) {
      return `${minutes}${sepMin}${seconds}${sepSec}${milliseconds}`;
    }
    return `${minutes}${sepMin}${seconds}${sepSec}`;
  }

  // окончания а, ов (шаг, шага, шагов)
  function formatEndings(number, word = 'шаг') {
    if (number > 10 && number < 20) {
      return word + 'ов';
    }
    const lastNumber = number % 10;
    if (lastNumber == 1) {
      return word;
    }
    if (lastNumber > 1 && lastNumber < 5) {
      return word + 'а';
    }
    if ((lastNumber > 4 && lastNumber < 10) || lastNumber == 0) {
      return word + 'ов';
    }
  }


  document.addEventListener('DOMContentLoaded', () => {
    // контейнер игры
    const container = document.getElementById('game-paired-cards');
    container.classList.add('container', 'paired-card__container');

    // модальное окно выбора размера игрового поля
    const panelSizeField = createPanelSizeField(1, 10);
    const modalSizeField = createModal(panelSizeField);
    modalSizeField.modal.id = 'modal-size-field';
    modalSizeField.modalConten.classList.add('modal-field');
    modalSizeField.modalTitle.classList.add('modal-field__title');
    modalSizeField.modalTitle.textContent = 'РАЗМЕР ИГРОВОГО ПОЛЯ';
    modalSizeField.modalBtnStart.classList.add('modal-field__button-create', 'game-button');
    modalSizeField.modalBtnStart.textContent = 'СФОРМИРОВАТЬ ИГРОВОЕ ПОЛЕ';
    modalSizeField.modalBtnStart.addEventListener('click', () => {
      cleanCounts();
      initiallField();
    })

    container.append(modalSizeField.modal);

    // модальное окно установки таймера
    const panelSetTimer = createSetTimerPanel();
    const modallSetTimer = createModal(panelSetTimer);
    modallSetTimer.modal.id = 'modal-timer-set';
    modallSetTimer.modalConten.classList.add('modal-timer');
    modallSetTimer.modalTitle.classList.add('modal-timer__title');
    modallSetTimer.modalTitle.textContent = 'ВЫБЕРИТЕ ВРЕМЯ ИГРЫ';
    modallSetTimer.modalBtnStart.classList.add('modal-timer__button-set');
    modallSetTimer.modalBtnStart.textContent = 'УСТАНОВИТЬ ТАЙМЕР';
    modallSetTimer.modalBtnStart.addEventListener('click', () => {
      document.querySelector('.js-timer-windov').textContent = formatMinSec(timer.init, true);
    })

    container.append(modallSetTimer.modal);

    // заголовок
    const titleGame = createTitle(game.title);
    container.append(titleGame);

    // панель управления
    const ControlPanel = createControlPanel()
    const timerPanel = createTimerPanel();
    const countSteps = createCountSteps();
    ControlPanel.wrapTimer.append(timerPanel);
    ControlPanel.wrapCountStep.append(countSteps);
    container.append(ControlPanel.wrap);

    const btnResizeField = createBtnResizeField();
    container.append(btnResizeField);

    // фомируем игровое поле по умолчанию
    initiallField();
  })

  window.rulesCreateField = rulesCreateField;
  window.rulesTimerSet = rulesTimerSet;
})();
