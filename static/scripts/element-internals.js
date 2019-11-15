const refMap = new WeakMap();
const validityMap = new WeakMap();
const hiddenInputMap = new WeakMap();
const internalsMap = new WeakMap();
const validationMessageMap = new WeakMap();

const observerConfig = { attributes: true };

const observer = new MutationObserver(mutationsList => {
  for (const mutation of mutationsList) {
    const { attributeName, target } = mutation;

    if (attributeName === 'disabled' && target.constructor.formAssociated) {
      if (target.formDisabledCallback) {
        target.formDisabledCallback.bind(target)();
      }
    }
  }
});

const getHostRoot = node => {
  if (node instanceof Document) {
    return node;
  }
  let parent = node.parentNode;
  if (parent && parent.toString() !== '[object ShadowRoot]') {
    parent = getHostRoot(parent);
  }
  return parent;
};

const initRef = (ref, internals) => {
  ref.toggleAttribute('form-associated-custom-element', true);
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = ref.getAttribute('name');
  ref.after(input);
  hiddenInputMap.set(internals, input);
  return observer.observe(ref, observerConfig);
};

const initLabels = (ref, labels) => {
  Array.from(labels).forEach(label =>
    label.addEventListener('click', ref.focus.bind(ref)));
  const firstLabelId = `${labels[0].htmlFor}_Label`;
  labels[0].id = firstLabelId;
  ref.setAttribute('aria-describedby', firstLabelId);
};

const initForm = (ref, form, internals) => {
  form.addEventListener('submit', event => {
    if (internals.checkValidity() === false) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    }
  });

  form.addEventListener('reset', () => {
    if (ref.constructor.formAssociated && ref.formResetCallback) {
      ref.formResetCallback();
    }
  });
};

const findParentForm = elem => {
  let parent = elem.parentNode;
  if (parent && parent.tagName !== 'FORM') {
    parent = findParentForm(parent);
  } else if (!parent && elem.toString() === '[object ShadowRoot]') {
    parent = findParentForm(parent.host);
  }
  return parent;
};

class ValidityState {
  constructor() {
    this.badInput = false;
    this.customError = false;
    this.patternMismatch = false;
    this.rangeOverflow = false;
    this.rangeUnderflow = false;
    this.stepMismatch = false;
    this.tooLong = false;
    this.tooShort = false;
    this.typeMismatch = false;
    this.valid = true;
    this.valueMissing = false;

    Object.seal(this);
  }
}

class ElementInternals {
  constructor(ref) {
    const validity = new ValidityState();
    refMap.set(this, ref);
    validityMap.set(this, validity);
    internalsMap.set(ref, this);
    const { labels, form } = this;
    Object.seal(this);

    initRef(ref, this);
    initLabels(ref, labels);
    initForm(ref, form, this);
  }

  checkValidity() {
    const validity = validityMap.get(this);
    return validity.valid;
  }

  get form() {
    const ref = refMap.get(this);
    let form;
    if (ref && ref.constructor.formAssociated === true) {
      form = findParentForm(ref);
    }
    return form;
  }

  get labels() {
    const ref = refMap.get(this);
    const id = ref.getAttribute('id');
    const hostRoot = getHostRoot(ref);
    return hostRoot.querySelectorAll(`[for=${id}]`);
  }

  reportValidity() {
    // TODO: Figure out how to polyfill this
  }

  setFormValue(value) {
    if (!this.form) {
      return;
    }
    const hiddenInput = hiddenInputMap.get(this);
    hiddenInput.value = value;
  }

  setValidity(validityChanges = {}, validationMessage = '') {
    const validity = validityMap.get(this);
    if (Object.keys(validityChanges).length === 0) {
      console.log('yes');
      validity.valid = true;
      for (const key in validity) {
        if (key !== 'valid') {
          validity[key] = false;
        }
      }
    } else {
      for (const key in validityChanges) {
        if (validityChanges.hasOwnProperty(key)) {
          const value = validityChanges[key];
          validity[key] = validityChanges[key];

          if (value === true && key !== 'valid') {
            validity.valid = false;
          }
        }
      }
    }

    validationMessageMap.set(this, validationMessage);

    this.reportValidity();
  }

  get validationMessage() {
    return validationMessageMap.get(this);
  }

  get validity() {
    const validity = validityMap.get(this);
    return validity;
  }

  get willValidate() {
    const ref = refMap.get(this);
    if (ref.disabled || ref.hasAttribute('disabled')) {
      return false;
    }
    return true;
  }
}

if (!window.ElementInternals) {
  window.ElementInternals = ElementInternals;

  Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
    get() {
      return () => {
        return new ElementInternals(this);
      };
    }
  });
}

export { ElementInternals };
