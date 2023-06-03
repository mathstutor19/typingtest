let eventsModule = (function (dModule, uModule, cModule, wModule) {
  let addEventListeners = function () {
    //enter click event
    uModule
      .getDOMElements()
      .textInput.addEventListener('keydown', function (event) {
        //if the test ended, do nothing
        if (dModule.testEnded()) {
          return;
        }

        //check if the user pressed Enter
        let key = event.keyCode;
        if (key == 13) {
          uModule.getDOMElements().textInput.value +=
            dModule.getLineReturn() + ' ';

          //create a new 'input' event
          let inputEvent = new Event('input');

          //dispatch it
          uModule.getDOMElements().textInput.dispatchEvent(inputEvent);
        }
      });

    //character typing event listener
    uModule
      .getDOMElements()
      .textInput.addEventListener('input', function (event) {
        //if the test ended, do nothing
        if (dModule.testEnded()) {
          return;
        }

        //if the test has not started yet, start the test and countdown
        if (!dModule.testStarted()) {
          //start the test: data Module
          dModule.startTest();

          //start counter

          let b = setInterval(function () {
            //calculate the results: data Module

            let results = {};
            //update wpm, wpmChange
            [results.wpm, results.wpmChange] = dModule.calculateWpm();

            //update cpm, cpmChange
            [results.cpm, results.cpmChange] = dModule.calculateCpm();

            //update accuracy, accuracyChange
            [results.accuracy, results.accuracyChange] =
              dModule.calculateAccuracy();

            //dModule.returnData();

            //update results (UI module)
            uModule.updateResults(results);

            //check if we have time left
            if (dModule.timeLeft()) {
              //reduce time by one sec: data Module
              let timeLeft = dModule.reduceTime();

              //update time remaining in UI
              uModule.updateTimeLeft(timeLeft);
            } else {
              //end the test: data module
              clearInterval(b);
              dModule.endTest();

              dModule.returnData();

              //fill modal
              uModule.fillModal(results.wpm);
              //show modal
              uModule.showModal();
            }
          }, 1000);
        }

        //get typed word: UI module
        let typedWord = uModule.getTypedWord();

        //update current word: data module
        dModule.updateCurrentWord(typedWord);

        //format the active word
        let currentWord = dModule.getCurrentWord();
        uModule.formatWord(currentWord);

        //check if the user pressed space or enter
        if (
          uModule.spacePressed(event) ||
          uModule.enterPressed(dModule.getLineReturn())
        ) {
          //empty text input
          uModule.emptyInput();

          //deactivate current word
          uModule.deactivateCurrentWord();

          //move to a new word: data Module
          dModule.moveToNewWord();

          //set active Word: UI Module
          let index = dModule.getCurrentWordIndex();
          uModule.setActiveWord(index);

          //format the active word: UI Module
          let currentWord = dModule.getCurrentWord();
          uModule.formatWord(currentWord);

          //scroll word into the middle view
          uModule.scroll();
        }
      });

    //click on download button event listener
    uModule
      .getDOMElements()
      .download.addEventListener('click', function (event) {
        if (uModule.isNameEmpty()) {
          uModule.flagNameInput();
        } else {
          let certificateData = dModule.getCertificateData();
          certificateModule.generateCertificate(certificateData);
        }
      });
  };

  //scroll active word into middle view on window resize
  window.addEventListener('resize', uModule.scroll);

  return {
    //init function, initializes the test before start
    init: function (duration, textNumber) {
      //fill the list of test words: data Module

      let words = wModule.getWords(textNumber);
      dModule.fillListOfTestWords(textNumber, words);

      //fill the list of test words: UI Module
      let lineReturn = dModule.getLineReturn();
      let testWords = dModule.getListofTestWords();
      uModule.fillContent(testWords, lineReturn);

      //set the total test time: data Module
      dModule.setTestTime(duration);

      //update time left: data Module
      dModule.initializeTimeLeft();

      //update time left: UI module
      let timeLeft = dModule.getTimeLeft();
      uModule.updateTimeLeft(timeLeft);

      //move to a new word: data Module
      dModule.moveToNewWord();

      //set active Word: UI Module
      let index = dModule.getCurrentWordIndex();
      uModule.setActiveWord(index);

      //format the active word: UI Module
      let currentWord = dModule.getCurrentWord();
      uModule.formatWord(currentWord);

      //focus on text input: UI Module
      uModule.inputFocus();

      //add avent listeners
      addEventListeners();
    },
  };
})(dataModule, UIModule, certificateModule, wordsModule);
