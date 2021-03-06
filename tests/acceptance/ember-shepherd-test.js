import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import sinonTest from 'ember-sinon-qunit/test-support/test';
import steps from '../data';

let tour;

module('Acceptance | Tour functionality tests', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    tour = this.owner.lookup('service:tour');
    tour.setProperties({
      steps,
      confirmCancel: false,
      modal: false,
      defaults: {
        classes: 'shepherd-element shepherd-open shepherd-theme-arrows',
        scrollTo: true,
        showCancelLink: true
      }
    });
  });

  hooks.afterEach(async function() {
    // Remove all Shepherd stuff, to start fresh each time.
    document.body.classList.remove('shepherd-active');
    document.querySelectorAll('[class^=shepherd]').forEach((el) => {
      el.parentNode.removeChild(el);
    });
    document.querySelectorAll('[id^=shepherd]').forEach((el) => {
      el.parentNode.removeChild(el);
    });
    tour.cleanup();
  });

  test('Shows cancel link', async function(assert) {
    await visit('/');

    await click('.toggleHelpModal');

    const cancelLink = document.querySelector('.shepherd-cancel-link');
    assert.ok(cancelLink, 'Cancel link shown');
  });

  test('Hides cancel link', async function(assert) {
    const defaults = {
      classes: 'shepherd-element shepherd-open shepherd-theme-arrows test-defaults',
      showCancelLink: false
    };

    const steps = [{
      id: 'test-highlight',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [
          {
            classes: 'shepherd-button-secondary cancel-button',
            text: 'Exit',
            type: 'cancel'
          },
          {
            classes: 'shepherd-button-primary next-button',
            text: 'Next',
            type: 'next'
          }
        ],
        showCancelLink: false,
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    await visit('/');

    tour.set('defaults', defaults);
    tour.set('steps', steps);

    await click('.toggleHelpModal');

    assert.notOk(document.querySelector('.shepherd-open a.shepherd-cancel-link'));
  });

  test('Cancel link cancels the tour', async function(assert) {
    await visit('/');

    await click('.toggleHelpModal');

    assert.ok(document.body.classList.contains('shepherd-active'), 'Body has class of shepherd-active, when shepherd becomes active');

    await click(document.querySelector('.shepherd-content a.shepherd-cancel-link'));

    assert.notOk(document.body.classList.contains('shepherd-active'), 'Body does not have class of shepherd-active, when shepherd becomes inactive');
  });

  sinonTest('Confirm cancel makes you confirm cancelling the tour', async function(assert) {
    const steps = [{
      id: 'intro',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [
          {
            classes: 'shepherd-button-secondary cancel-button',
            text: 'Exit',
            type: 'cancel'
          },
          {
            classes: 'shepherd-button-primary next-button',
            text: 'Next',
            type: 'next'
          }
        ],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        title: 'Welcome to Ember Shepherd!',
        text: ['A field that has rested gives a bountiful crop.'],
        scrollTo: false
      }
    }];

    const spy = this.spy(window, 'confirm');

    await visit('/');

    tour.set('confirmCancel', true);
    tour.set('steps', steps);

    await click('.toggleHelpModal');

    assert.ok(document.body.classList.contains('shepherd-active'), 'Body has class of shepherd-active, when shepherd becomes active');

    await click(document.querySelector('.shepherd-open a.shepherd-cancel-link'));

    assert.ok(spy.calledOnce);
  });

  test('Modal page contents', async function(assert) {
    assert.expect(3);

    await visit('/');

    await click('.toggleHelpModal');

    assert.ok(document.body.classList.contains('shepherd-active'), 'Body gets class of shepherd-active, when shepherd becomes active');
    assert.equal(document.querySelectorAll('.shepherd-enabled').length, 2, 'attachTo element and tour have shepherd-enabled class');
    assert.ok(document.querySelector('#shepherdOverlay'), '#shepherdOverlay exists, since modal');
  });

  test('Non-modal page contents', async function(assert) {
    assert.expect(3);

    await visit('/');

    await click('.toggleHelpNonmodal');

    assert.ok(document.body.classList.contains('shepherd-active'), 'Body gets class of shepherd-active, when shepherd becomes active');
    assert.equal(document.querySelectorAll('.shepherd-enabled').length, 2, 'attachTo element and tour get shepherd-enabled class');
    assert.notOk(document.querySelector('#shepherdOverlay'), '#shepherdOverlay should not exist, since non-modal');
  });

  test('Tour next, back, and cancel builtInButtons work', async function(assert) {
    assert.expect(3);

    await visit('/');

    await click('.toggleHelpModal');
    await click(document.querySelector('.shepherd-content .next-button'));

    assert.ok(document.querySelector('.shepherd-enabled .back-button'), 'Ensure that the back button appears');

    await click(document.querySelector('.shepherd-content .back-button'));

    assert.notOk(document.querySelector('.shepherd-enabled .back-button'), 'Ensure that the back button disappears');

    await click(document.querySelector('.shepherd-content .cancel-button'));

    assert.notOk(document.querySelector('.shepherd-enabled [class^=shepherd-button]'), 'Ensure that all buttons are gone, after exit');
  });

  test('Highlight applied', async function(assert) {
    assert.expect(2);

    const steps = [{
      id: 'test-highlight',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [
          {
            classes: 'shepherd-button-secondary cancel-button',
            text: 'Exit',
            type: 'cancel'
          },
          {
            classes: 'shepherd-button-primary next-button',
            text: 'Next',
            type: 'next'
          }
        ],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    await visit('/');

    tour.set('steps', steps);
    tour.set('modal', true);

    await click('.toggleHelpModal');

    assert.ok(document.querySelector('.highlight'), 'currentElement highlighted');

    await click(document.querySelector('.shepherd-content .cancel-button'));

    assert.notOk(document.querySelector('.highlight'), 'highlightClass removed on cancel');
  });

  test('Highlight applied when `tour.modal == false`', async function(assert) {
    assert.expect(2);

    const steps = [{
      id: 'test-highlight',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [
          {
            classes: 'shepherd-button-secondary cancel-button',
            text: 'Exit',
            type: 'cancel'
          },
          {
            classes: 'shepherd-button-primary next-button',
            text: 'Next',
            type: 'next'
          }
        ],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    await visit('/');

    tour.set('steps', steps);

    await click('.toggleHelpNonmodal');

    assert.ok(document.querySelector('.highlight'), 'currentElement highlighted');

    await click(document.querySelector('.shepherd-content .cancel-button'));

    assert.notOk(document.querySelector('.highlight'), 'highlightClass removed on cancel');
  });

  test('Defaults applied', async function(assert) {
    assert.expect(1);

    const defaults = {
      classes: 'shepherd-element shepherd-open shepherd-theme-arrows test-defaults',
      scrollTo: false,
      showCancelLink: true
    };

    const steps = [{
      id: 'test-defaults-classes',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [
          {
            classes: 'shepherd-button-secondary cancel-button',
            text: 'Exit',
            type: 'cancel'
          },
          {
            classes: 'shepherd-button-primary next-button',
            text: 'Next',
            type: 'next'
          }
        ],
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing defaults']
      }
    }];

    await visit('/');

    tour.set('defaults', defaults);
    tour.set('steps', steps);

    await click('.toggleHelpModal');

    assert.ok(document.querySelector('.test-defaults'), 'defaults class applied');
  });

  test('configuration works with attachTo object when element is a simple string', async function(assert) {
    assert.expect(1);

    // Override default behavior
    const steps = [{
      id: 'test-attachTo-string',
      options: {
        attachTo: {
          element: '.first-element',
          on: 'bottom'
        },
        builtInButtons: [
          {
            classes: 'shepherd-button-secondary cancel-button',
            text: 'Exit',
            type: 'cancel'
          },
          {
            classes: 'shepherd-button-primary next-button',
            text: 'Next',
            type: 'next'
          }
        ],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    tour.set('steps', steps);

    await visit('/');

    await click('.toggleHelpModal');

    assert.ok(document.querySelector('.shepherd-step'), 'tour is visible');
  });

  test('configuration works with attachTo object when element is dom element', async function(assert) {
    assert.expect(1);

    await visit('/');

    // Override default behavior
    const steps = [{
      id: 'test-attachTo-dom',
      options: {
        attachTo: {
          element: find('.first-element'),
          on: 'bottom'
        },
        builtInButtons: [
          {
            classes: 'shepherd-button-secondary cancel-button',
            text: 'Exit',
            type: 'cancel'
          },
          {
            classes: 'shepherd-button-primary next-button',
            text: 'Next',
            type: 'next'
          }
        ],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    tour.set('steps', steps);

    await click('.toggleHelpModal');

    assert.ok(document.querySelector('.shepherd-step'), 'tour is visible');
  });

  test('buttons work when type is not specified and passed action is triggered', async function(assert) {
    assert.expect(4);

    let buttonActionCalled = false;

    const steps = [{
      id: 'test-buttons-custom-action',
      options: {
        attachTo: {
          element: '.first-element',
          on: 'bottom'
        },
        builtInButtons: [
          {
            classes: 'shepherd-button-secondary button-one',
            text: 'button one'
          },
          {
            classes: 'shepherd-button-secondary button-two',
            text: 'button two',
            action() {
              buttonActionCalled = true;
            }
          },
          {
            classes: 'shepherd-button-secondary button-three',
            text: 'button three'
          }
        ],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        highlightClass: 'highlight',
        title: 'Welcome to Ember-Shepherd!',
        text: ['Testing highlight']
      }
    }];

    await visit('/');

    tour.set('steps', steps);

    await click('.toggleHelpModal');

    assert.ok(document.querySelector('.button-one'), 'tour button one is visible');
    assert.ok(document.querySelector('.button-two'), 'tour button two is visible');
    assert.ok(document.querySelector('.button-three'), 'tour button three is visible');

    await click(document.querySelector('.button-two'));

    assert.ok(buttonActionCalled, 'button action triggered');
  });

  test('`pointer-events` is set to `auto` for any step element on clean up', async function(assert) {
    assert.expect(4);

    await visit('/');

    await click('.toggleHelpModal');

    // Go through a step of the tour...
    await click(document.querySelector('[data-id="intro"] .next-button'));

    // Check the target elements have pointer-events = 'none'
    // Get the 2 shepherd-target's
    document.querySelectorAll('.shepherd-target').forEach((elem) => {
      assert.equal(elem.style.pointerEvents, 'none');
    });

    // Exit the tour
    await click(document.querySelector('[data-id="installation"] .cancel-button'));

    // Check all the target elements now have pointer-events = 'auto'
    // Get the 2 shepherd-target's again
    document.querySelectorAll('.shepherd-target').forEach((elem) => {
      assert.equal(elem.style.pointerEvents, 'auto');
    });
  });

  test('scrollTo works with disableScroll on', async function(assert) {
    assert.expect(2);
    // Setup controller tour settings
    tour.set('disableScroll', true);
    tour.set('scrollTo', true);

    // Visit route
    await visit('/');

    document.querySelector('#ember-testing-container').scrollTop = 0;

    assert.equal(document.querySelector('#ember-testing-container').scrollTop, 0, 'Scroll is initially 0');

    await click('.toggleHelpModal');

    await click(document.querySelector('.shepherd-content .next-button'));

    await click(document.querySelector('.shepherd-content .next-button'));

    assert.ok(document.querySelector('#ember-testing-container').scrollTop > 0, 'Scrolled down correctly');
  });

  test('scrollTo works with a custom scrollToHandler', async function(assert) {
    assert.expect(2);
    // Override default behavior
    const steps = [{
      id: 'intro',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [
          {
            classes: 'shepherd-button-secondary cancel-button',
            text: 'Exit',
            type: 'cancel'
          },
          {
            classes: 'shepherd-button-primary next-button',
            text: 'Next',
            type: 'next'
          }
        ],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: false,
        title: 'Welcome to Ember Shepherd!',
        text: ['A field that has rested gives a bountiful crop.'],
        scrollTo: true,
        scrollToHandler() {
          return document.querySelector('#ember-testing-container').scrollTop = 120;
        }
      }
    }];

    // Visit route
    await visit('/');

    tour.set('steps', steps);

    document.querySelector('#ember-testing-container').scrollTop = 0;
    assert.equal(document.querySelector('#ember-testing-container').scrollTop, 0, 'Scroll is initially 0');

    await click('.toggleHelpModal');
    await click(document.querySelector('.shepherd-content .next-button'));

    assert.ok(document.querySelector('#ember-testing-container').scrollTop === 120, 'Scrolled correctly');
  });

  test('scrollTo works without a custom scrollToHandler', async function(assert) {
    assert.expect(2);
    // Setup controller tour settings
    tour.set('scrollTo', true);

    // Visit route
    await visit('/');

    document.querySelector('#ember-testing-container').scrollTop = 0;

    assert.equal(document.querySelector('#ember-testing-container').scrollTop, 0, 'Scroll is initially 0');

    await click('.toggleHelpModal');
    await click(document.querySelector('.shepherd-content .next-button'));

    assert.ok(document.querySelector('#ember-testing-container').scrollTop > 0, 'Scrolled correctly');
  });

  test('Shows by id works', async function(assert) {
    await visit('/');

    tour.show('usage');

    assert.equal(document.querySelector('.shepherd-enabled.shepherd-open .shepherd-text').textContent,
      'To use the tour service, simply inject it into your application and use it like this example.',
      'Usage step shown');
  });

  test('copyStyles copies the element correctly', async function(assert) {
    assert.expect(1);

    const steps = [{
      id: 'intro',
      options: {
        attachTo: '.first-element bottom',
        builtInButtons: [
          {
            classes: 'shepherd-button-secondary cancel-button',
            text: 'Exit',
            type: 'cancel'
          },
          {
            classes: 'shepherd-button-primary next-button',
            text: 'Next',
            type: 'next'
          }
        ],
        classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
        copyStyles: true,
        title: 'Welcome to Ember Shepherd!',
        text: ['A field that has rested gives a bountiful crop.'],
        scrollTo: false
      }
    }];

    await visit('/');

    tour.set('steps', steps);

    await click('.toggleHelpModal');

    assert.equal(document.querySelectorAll('.first-element').length, 2, 'First element is copied with copyStyles');
  });
});
