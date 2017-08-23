let BeaverBrowser = {
  isVisible: function(element) {
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom#answer-21696585
    return element.offsetParent !== null;
  },
  findField: function(form, fieldName) {
    // https://www.w3schools.com/html/html_form_input_types.asp
    let element = form.querySelector(fieldName);
    if (!element) {
      return null;
    }

    let visible = BeaverBrowser.isVisible(element);
    if (visible !== true) {
      return null;
    }
    return element;
  },
  updateField: function(element, newValue) {
    element.value = newValue;

    // Things like artifactory (gross) do stupid things like
    // rely on onChange events to enable form submission.
    var event = document.createEvent("HTMLEvents");
    event.initEvent("change", false, true);
    element.dispatchEvent(event);
  },
  doLogin: function() {
    if (typeof(login) === "undefined" || login == null) {
      return;
    }

    let forms = Array.from(document.getElementsByTagName("form"));
    forms.forEach(function(form) {
      if (!BeaverBrowser.isVisible(form)) {
        return;
      }

      let hasPassword = false;
      let hasUsername = false;

      Object.entries(login.fields).forEach(function([field, value]) {
        if (!field.startsWith('FIELD.') || field === "FIELD.") {
          return;
        }

        let fieldName = field.substr(6);

        if (fieldName === "username" || fieldName === "login") {
          hasUsername = true;
        }

        if (fieldName === "password") {
          hasPassword = true;
        }

        let identifier = `#${fieldName}`;
        let element = BeaverBrowser.findField(form, identifier);
        if (element !== null) {
          BeaverBrowser.updateField(element, value);
        }
      });

      if (login.password && !hasPassword) {
        let value = login.fields.password;
        let element = BeaverBrowser.findField(form, "input[type='password']");
        if (element !== null) {
          BeaverBrowser.updateField(element, value);
        }
      }

      if (login.fields.username && !hasUsername) {
        let value = login.fields.username;

        let selectors = [
          "input[id*='username'][type='text']",
          "input[id='user'][type='text']"
        ];

        let element;

        for (var i=0; i < selectors.length; i++) {
          element = BeaverBrowser.findField(form, selectors[i]);
          if (element !== null) {
            break;
          }
        }

        if (element !== null) {
          BeaverBrowser.updateField(element, value);
        }
      }
    });
    return;
  }
}

if (typeof(fetchEntry) !== "undefined" && fetchEntry === true) {
  BeaverBrowser.doLogin();
  fetchEntry = false;
}
