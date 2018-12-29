'use strict';

(function () {
  var imageUploadForm = document.querySelector('.img-upload__form');
  var nameOfUploadFile = imageUploadForm.querySelector('#upload-file');
  var userFileEditor = imageUploadForm.querySelector('.img-upload__overlay');
  var userFileEditorClose = userFileEditor.querySelector('.img-upload__cancel');
  var imagePreview = userFileEditor.querySelector('.img-upload__preview');
  var hashtagsInput = userFileEditor.querySelector('.text__hashtags');
  var descriptionInput = userFileEditor.querySelector('.text__description');

  var effectLevel = userFileEditor.querySelector('.effect-level');
  var scaleValueIndicator = userFileEditor.querySelector('.scale__control--value');
  var scaleControlSmaller = userFileEditor.querySelector('.scale__control--smaller');
  var scaleControlBigger = userFileEditor.querySelector('.scale__control--bigger');
  var MIN_SCALE_VALUE = 25;
  var MAX_SCALE_VALUE = 100;
  var SCALE_VALUE_STEP = 25;
  var scaleValue = MAX_SCALE_VALUE;
  var effectLevelLine = effectLevel.querySelector('.effect-level__line');
  var effectLevelPin = effectLevel.querySelector('.effect-level__pin');
  var effectLevelDepth = effectLevel.querySelector('.effect-level__depth');
  var effectLevelValue = effectLevel.querySelector('.effect-level__value');
  var effectValue = effectLevelValue.value;
  var choiceEffect = userFileEditor.querySelector('.effects__list');
  var MAX_EFFECT_VALUE = 100;

  var EFFECTS_KIT = {
    chrome: {
      effectName: 'chrome',
      effectFilter: 'grayscale',
      minLevelEffect: 0,
      maxLevelEffect: 1,
      effectDimension: ''
    },
    sepia: {
      effectName: 'sepia',
      effectFilter: 'sepia',
      minLevelEffect: 0,
      maxLevelEffect: 1,
      effectDimension: ''
    },
    marvin: {
      effectName: 'marvin',
      effectFilter: 'invert',
      minLevelEffect: 0,
      maxLevelEffect: 100,
      effectDimension: '%'
    },
    phobos: {
      effectName: 'phobos',
      effectFilter: 'blur',
      minLevelEffect: 0,
      maxLevelEffect: 3,
      effectDimension: 'px'
    },
    heat: {
      effectName: 'heat',
      effectFilter: 'brightness',
      minLevelEffect: 1,
      maxLevelEffect: 3,
      effectDimension: ''
    },
    none: {
      effectName: 'none',
      effectFilter: 'none',
      minLevelEffect: null,
      maxLevelEffect: null,
      effectDimension: ''
    }
  };

  var currentEffectObj = EFFECTS_KIT['none'];

  nameOfUploadFile.addEventListener('change', function () {
    userFileEditor.classList.remove('hidden');
    effectLevel.classList.add('img-filters--inactive');
    setScaleValue(scaleValue);

    document.addEventListener('keydown', onFileEditorEscPress);
  });

  scaleControlSmaller.addEventListener('click', function () {
    scaleValue -= SCALE_VALUE_STEP;

    if (scaleValue < MIN_SCALE_VALUE) {
      scaleValue = MIN_SCALE_VALUE;
    }

    setScaleValue(scaleValue);
  });

  scaleControlBigger.addEventListener('click', function () {
    scaleValue += SCALE_VALUE_STEP;

    if (scaleValue > MAX_SCALE_VALUE) {
      scaleValue = MAX_SCALE_VALUE;
    }

    setScaleValue(scaleValue);
  });

  effectLevelPin.addEventListener('mousedown', onMouseDownLevelPin);
  choiceEffect.addEventListener('focus', onChoiceEffect, true);

  userFileEditorClose.addEventListener('click', function () {
    closeFileEditor();
  });

  userFileEditorClose.addEventListener('keydown', function (evt) {
    window.util.isEnterEvent(evt, closeFileEditor);
  });

  function onFileEditorEscPress(evt) {
    if (document.activeElement !== hashtagsInput && document.activeElement !== descriptionInput) {
      window.util.isEscEvent(evt, closeFileEditor);
    }
  }

  function closeFileEditor() {
    userFileEditor.classList.add('hidden');
    nameOfUploadFile.value = '';
    clearEffect();
    imagePreview.style.transform = '';
    scaleValue = MAX_SCALE_VALUE;
    hashtagsInput.setCustomValidity('');
    hashtagsInput.style.borderColor = '';
    hashtagsInput.value = '';
    descriptionInput.value = '';
    document.removeEventListener('keydown', onFileEditorEscPress);
  }

  function setScaleValue(value) {
    scaleValueIndicator.value = value + '%';
    imagePreview.style.transform = 'scale(' + value / 100 + ')';
  }

  function onMouseDownLevelPin(downEvt) {
    downEvt.preventDefault();

    var effectLevelLineCoords = getCoords(effectLevelLine);
    var effectRange = currentEffectObj.maxLevelEffect - currentEffectObj.minLevelEffect;

    document.addEventListener('mousemove', onPinMove);
    document.addEventListener('mouseup', onMouseUp);

    function onPinMove(moveEvt) {
      var newLeft = moveEvt.clientX - effectLevelLineCoords.left;
      var maxLeft = effectLevelLine.offsetWidth;

      if (newLeft < 0) {
        newLeft = 0;
      }

      if (newLeft > maxLeft) {
        newLeft = maxLeft;
      }

      effectLevelPin.style.left = newLeft + 'px';
      effectLevelDepth.style.width = newLeft + 'px';
      effectValue = newLeft * 100 / maxLeft;
      effectLevelValue.setAttribute('value', effectValue);

      var effectDepth = (effectRange / 100) * effectValue + currentEffectObj.minLevelEffect;

      imagePreview.style.filter = currentEffectObj.effectFilter + '(' + effectDepth + currentEffectObj.effectDimension + ')';
    }

    function onMouseUp(upEvt) {
      onPinMove(upEvt);
      document.removeEventListener('mousemove', onPinMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  }

  effectLevelPin.ondragstart = function () {
    return false;
  };

  function getCoords(element) {
    var box = element.getBoundingClientRect();
    return {
      top: box.top + pageYOffset,
      left: box.left + pageXOffset
    };
  }

  function onChoiceEffect(choiceEvt) {
    clearEffect();
    setEffect(choiceEvt.target.value);
  }

  function setEffect(effect) {
    currentEffectObj = EFFECTS_KIT[effect];

    if (typeof currentEffectObj === 'undefined') {
      currentEffectObj = EFFECTS_KIT['none'];
    }

    if (currentEffectObj.effectFilter === 'none') {
      effectLevel.classList.add('img-filters--inactive');
    } else {
      effectLevel.classList.remove('img-filters--inactive');
      imagePreview.classList.add('effects__preview--' + effect);
      effectLevelValue.setAttribute('value', MAX_EFFECT_VALUE);
      effectValue = MAX_EFFECT_VALUE;
      imagePreview.style.filter = currentEffectObj.effectFilter + '(' + currentEffectObj.maxLevelEffect + currentEffectObj.effectDimension + ')';
      effectLevelPin.style.left = effectLevelLine.offsetWidth + 'px';
      effectLevelDepth.style.width = effectLevelLine.offsetWidth + 'px';
    }
  }

  function clearEffect() {
    imagePreview.classList.remove('effects__preview--' + currentEffectObj.effectName);
    imagePreview.style.filter = '';
    effectLevelValue.removeAttribute('value');
    effectLevelPin.style.left = '';
    effectLevelDepth.style.width = '';
  }

  hashtagsInput.addEventListener('input', function () {
    var validationErrors = getValidationErrors(getHashtagsArray());

    if (validationErrors !== '') {
      hashtagsInput.style.borderColor = 'red';
      hashtagsInput.setCustomValidity(validationErrors);
    } else {
      hashtagsInput.style.borderColor = '';
      hashtagsInput.setCustomValidity('');
    }
  });

  function getHashtagsArray() {
    var hashtagsList = [];
    var hashtags = hashtagsInput.value;
    var sliceStartIndex = 0;
    var sliceEndIndex = 0;

    while (sliceEndIndex >= 0) {
      sliceEndIndex = hashtags.indexOf(' ', sliceStartIndex);
      hashtagsList.push(hashtags.slice(sliceStartIndex, (sliceEndIndex < 0 ? hashtags.length : sliceEndIndex)));
      sliceStartIndex = sliceEndIndex + 1;
    }

    return hashtagsList;
  }

  function getValidationErrors(hashtags) {
    var errorMessage = '';
    var noHashtag = 0;
    var MAX_LONG_HASHTAG = 20;
    var MAX_QUANTITY_HASHTAG = 5;
    var validationErrorList = {
      singleSymbol: {
        errorActive: false,
        errorText: 'Хеш-тег не может состоять только из одной решётки'
      },
      firstSymbol: {
        errorActive: false,
        errorText: 'Хэш-тег должен начинатся с символа # (решётка)'
      },
      separator: {
        errorActive: false,
        errorText: 'Хеш-теги разделяются пробелами'
      },
      longHashtag: {
        errorActive: false,
        errorText: 'Максимальная длина одного хэш-тега ' + MAX_LONG_HASHTAG + ' символов, включая решётку'
      },
      sameHashtag: {
        errorActive: false,
        errorText: 'Нельзя использовать одинаковые хэш-теги (с учетом регистра)'
      },
      manyHashtag: {
        errorActive: false,
        errorText: 'Нельзя указать больше ' + MAX_QUANTITY_HASHTAG + ' хэш-тегов'
      }
    };

    var validationErrorNames = Object.keys(validationErrorList);

    hashtags.forEach(function (hashtag) {
      getPersonalHashtagError(hashtag);
    });

    function getPersonalHashtagError(hashtag) {
      if (hashtag === '') {
        noHashtag++;
      }

      if (hashtag !== '' && hashtag[0] !== '#') {
        validationErrorList.firstSymbol.errorActive = true;
      } else if (hashtag.length === 1) {
        validationErrorList.singleSymbol.errorActive = true;
      }

      if (hashtag.includes('#', 1)) {
        validationErrorList.separator.errorActive = true;
      }

      if (hashtag.length > MAX_LONG_HASHTAG) {
        validationErrorList.longHashtag.errorActive = true;
      }
    }

    if (hashtags.length - noHashtag > MAX_QUANTITY_HASHTAG) {
      validationErrorList.manyHashtag.errorActive = true;
    }

    if (getEqualHashtags(hashtags).length > 0) {
      validationErrorList.sameHashtag.errorActive = true;
    }

    function getEqualHashtags(allHashtags) {
      var equalHashtags = allHashtags.map(function (thisHashtag) {
        return thisHashtag.toUpperCase();
      }).filter(function (hashtagValue, currentIndex, currentHashtags) {
        return currentHashtags.indexOf(hashtagValue, currentIndex) !== currentHashtags.lastIndexOf(hashtagValue) && currentHashtags.indexOf(hashtagValue) === currentIndex;
      }).filter(function (currentHashtag) {
        return currentHashtag !== '';
      });

      return equalHashtags;
    }

    validationErrorNames.forEach(function (errorName) {
      if (validationErrorList[errorName].errorActive) {
        errorMessage += validationErrorList[errorName].errorText + '. \n';
      }
    });

    return errorMessage;
  }

  function onLoad() {
    closeFileEditor();
    showSuccess();
  }

  function showSuccess() {
    var successMessageTemplate = document.querySelector('#success').content.querySelector('.success');
    var successMessageElement = successMessageTemplate.cloneNode(true);

    document.querySelector('main').appendChild(successMessageElement);

    var successWindow = document.querySelector('.success');
    var successButton = successWindow.querySelector('.success__button');

    successWindow.addEventListener('click', closeSuccess);
    successButton.addEventListener('click', closeSuccess);
    document.addEventListener('keydown', closeFromEsc);

    function closeFromEsc(evt) {
      window.util.isEscEvent(evt, closeSuccess);
    }

    function closeSuccess() {
      document.removeEventListener('keydown', closeFromEsc);
      successWindow.removeEventListener('click', closeSuccess);
      document.querySelector('main').removeChild(successMessageElement);
    }
  }

  function onError(errorMessage) {
    var errorMessageTemplate = document.querySelector('#error').content.querySelector('.error');
    var errorMessageElement = errorMessageTemplate.cloneNode(true);
    var fragment = document.createDocumentFragment();

    errorMessageElement.querySelector('.error__title').textContent = errorMessage;
    fragment.appendChild(errorMessageElement);
    document.querySelector('main').appendChild(fragment);

    var errorWindow = document.querySelector('.error');
    var errorButtons = errorWindow.querySelectorAll('.error__button');
    errorWindow.style.zIndex = 10;

    errorWindow.addEventListener('click', closeError);
    errorButtons[0].addEventListener('click', closeError);
    errorButtons[1].addEventListener('click', closeErrorAndForm);
    document.addEventListener('keydown', closeErrorFromEsc);

    function closeErrorFromEsc(evt) {
      window.util.isEscEvent(evt, closeErrorAndForm);
    }

    function closeError() {
      errorWindow.removeEventListener('click', closeError);
      errorButtons[0].removeEventListener('click', closeError);
      errorButtons[1].removeEventListener('click', closeErrorAndForm);
      document.removeEventListener('keydown', closeErrorFromEsc);
      document.querySelector('main').removeChild(errorWindow);
    }

    function closeErrorAndForm() {
      closeError();
      closeFileEditor();
    }
  }

  imageUploadForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
    window.backend.upload(new FormData(imageUploadForm), onLoad, onError);
  });

})();
