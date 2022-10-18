class WebflowMagic_FormValidator {
  localOptions = {}
  defaultOptions = {
    FIELD_WRAPPER_SELECTOR: '.form-field-wrapper',
    FIELD_SELECTOR: '[wr-type="required-field"]',
    FIELD_ERROR_CLASS: 'error',
    ERROR_MESSAGE_SELECTOR: '[wr-type=error]',
    SUBMIT_BUTTON_SELECTOR: '[wr-type="submit"]',
  }

  constructor(options) {
    if (options && typeof options === 'object') {
      Object.entries(this.defaultOptions).forEach(([option, value]) => {
        this.localOptions[option] = options[option] == null ? value : options[option];
      });
    } else {
      this.localOptions = { ...this.defaultOptions };
    }

    this.mount();
  }

  mount() {  
    this.hideErrorMessages(document);

    document.querySelectorAll(this.localOptions.FIELD_SELECTOR).forEach(field => {
      // TODO: Enter on input/textarea submits form?
   
      this.getFieldEvents(field).forEach(eventName => {
        field.addEventListener(eventName, () => {
          const fieldErrors = this.checkField(field);
          this.tryUpdateFieldErrorState(field, fieldErrors);
        });
      })
    
    });
    
    document.querySelectorAll(this.localOptions.SUBMIT_BUTTON_SELECTOR).forEach(el => {
      el.addEventListener('click', () => {
        const form = el.closest('form');
        if (form == null) {
          console.error(`No <form> element found for this submit button: `, el);
          return;
        }
        this.hideErrorMessages(form);
        const formErrors = [];
        form.querySelectorAll(this.localOptions.FIELD_SELECTOR).forEach(field => {
          const fieldName = field.name;
          const fieldErrors = this.checkField(field);
          if (this.tryUpdateFieldErrorState(field, fieldErrors) && fieldErrors.length > 0) {
            formErrors.push({ name: fieldName, errors: fieldErrors });
          }
        });

        if (formErrors.length === 0) form.submit();
        else console.warn(formErrors);
      });
    });
  }

  tryUpdateFieldErrorState(field, errors) {
    const fieldWrapper = field.closest(this.localOptions.FIELD_WRAPPER_SELECTOR);
    if (fieldWrapper == null) {
      console.error(`Unable to find FIELD_WRAPPER for field ${fieldName}.`);
      return false;
    }
    const errNode = fieldWrapper.querySelector(this.localOptions.ERROR_MESSAGE_SELECTOR);
    if (errNode == null) {
      console.error(`Unable to find ERROR_MESSAGE for field ${fieldName}.`);
      return false;
    }
    if (errors.length) {
      this.showElement(errNode);
      field.classList.add(this.localOptions.FIELD_ERROR_CLASS);
      // TODO: error messages text from fieldErrors?
    } else {
      this.hideErrorMessages(fieldWrapper);
    }
    return true;
  }
  
  getFieldEvents(field) {
    const tagName = field.tagName.toLowerCase();
    switch (tagName) {
      case 'input':
        const inputType = field.type;
        switch (inputType) {
          case 'checkbox':
          case 'radio':
            return ['change'];
          // case 'color':
          // case 'date':
          // case 'time':
          // case 'month':
          // case 'datetime-local':
          // case 'range':
          // case 'week':
          // case 'search':
          // case 'image':
          // case 'file':
          // case 'url':
          case 'email': 
          case 'tel':
          case 'number':
          case 'text':
          case 'password':
            return ['input'];

          // case 'hidden':
          // case 'button':
          // case 'reset':
          // case 'submit':
          default:
            console.error(`getFieldEvents do not know how to handle input with type="${inputType}" yet.`, field);
            return [];
        }
      case 'select':
      case 'textarea':
        return ['input'];

      default: 
        console.error(`getFieldEvents do not know how to handle tag <${tagName}> of field yet.`, field);
        return [];
    }
  }

  checkField(field) {
    // console.log(field);
    const fieldErrors = [];
    const tagName = field.tagName.toLowerCase();
    switch (tagName) {
      case 'input':
        const inputType = field.type;
        switch (inputType) {
          case 'checkbox':
            if (!field.checked)
              fieldErrors.push(`required`);
            break;

          case 'email':
            if (!field.value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/))
              fieldErrors.push(`wrong email format`);
            break;

          case 'hidden':
            break;

          default:
            if (!field.value) fieldErrors.push(`required`);
            break;
        }
        break;

      // case 'select':
      //   // TODO: implement, ignore first option?
      //   break;

      case 'textarea':
        
        break;
    
      default:
        break;
    }

   
  
    return fieldErrors;
  }

  showElement(el) {
    el.style.display = ''; 
  }

  hideErrorMessages(parent) {
    parent.querySelectorAll(this.localOptions.ERROR_MESSAGE_SELECTOR).forEach(el => el.style.display = 'none');
    parent.querySelectorAll(this.localOptions.FIELD_SELECTOR).forEach(el => el.classList.remove(this.localOptions.FIELD_ERROR_CLASS));
  }
}
