/*global MocksHelper, MockL10n, AppWindow, BrowserContextMenu */

'use strict';

requireApp('system/test/unit/mock_l10n.js');
requireApp('system/test/unit/mock_orientation_manager.js');
requireApp('system/test/unit/mock_app_window.js');

var mocksForAppModalDialog = new MocksHelper([
  'AppWindow'
]).init();

suite('system/BrowserContextMenu', function() {
  var stubById, realL10n, stubQuerySelector;
  mocksForAppModalDialog.attachTestHelpers();
  setup(function(done) {
    realL10n = navigator.mozL10n;
    navigator.mozL10n = MockL10n;

    stubById = this.sinon.stub(document, 'getElementById');
    var e = document.createElement('div');
    stubQuerySelector = this.sinon.stub(e, 'querySelector');
    stubQuerySelector.returns(document.createElement('div'));
    stubById.returns(e);
    requireApp('system/js/system.js');
    requireApp('system/js/base_ui.js');
    requireApp('system/js/browser_context_menu.js', done);
  });

  teardown(function() {
    navigator.mozL10n = realL10n;
    stubById.restore();
    stubQuerySelector.restore();
  });

  var fakeAppConfig1 = {
    url: 'app://www.fake/index.html',
    manifest: {},
    manifestURL: 'app://wwww.fake/ManifestURL',
    origin: 'app://www.fake'
  };

  var fakeContextMenuEvent = {
    type: 'mozbrowsercontextmenu',
    defaultPrevented: false,
    preventDefault: function() {
      this.defaultPrevented = true;
    },
    detail: {
      contextmenu: {
        items: [{
          label: 'test0',
          icon: 'test'
        }]
      }
    }
  };

  var SYSTEM_TARGET_TYPES = [
    'A',
    'IMG',
    'VIDEO',
    'AUDIO'
  ];

  var fakeSystemContextMenuEvents = [];

  SYSTEM_TARGET_TYPES.forEach(function(type) {
    fakeSystemContextMenuEvents.push({
      type: 'mozbrowsercontextmenu',
      defaultPrevented: false,
      preventDefault: function() {
        this.defaultPrevented = true;
      },
      detail: {
        contextmenu: {
          items: []
        },
        systemTargets: [{
          nodeName: type,
          data: {
            uri: 'http://fake.com'
          }
       }]
      }
    });
  });

  var fakeEmptyContextMenuEvent = {
    type: 'mozbrowsercontextmenu',
    defaultPrevented: false,
    preventDefault: function() {
      this.defaultPrevented = true;
    },
    detail: {}
  };

  var fakeNoItemsContextMenuEvent = {
    type: 'mozbrowsercontextmenu',
    defaultPrevented: false,
    preventDefault: function() {
      this.defaultPrevented = true;
    },
    detail: {
      contextmenu: {
        items: []
      }
    }
  };

  test('New', function() {
    var app1 = new AppWindow(fakeAppConfig1);
    var md1 = new BrowserContextMenu(app1);
    assert.isDefined(md1.instanceID);
  });

  test('launch menu', function() {
    var app1 = new AppWindow(fakeAppConfig1);
    var md1 = new BrowserContextMenu(app1);

    md1.handleEvent(fakeContextMenuEvent);
    assert.isTrue(md1.element.classList.contains('visible'));
    assert.equal(
      md1.elements.list.querySelector('button:first-child').textContent,
      fakeContextMenuEvent.detail.contextmenu.items[0].label);
    assert.equal(
      md1.elements.list.querySelector('button:first-child').
        style.backgroundImage,
      'url("' + fakeContextMenuEvent.detail.contextmenu.items[0].icon + '")');
  });

  test('manually launch menu', function() {
    var app1 = new AppWindow(fakeAppConfig1);
    var md1 = new BrowserContextMenu(app1);
    md1.showDefaultMenu();
    assert.isTrue(md1.element.classList.contains('visible'));
  });

  test('Check that a context menu containing items is prevented', function() {
    var app1 = new AppWindow(fakeAppConfig1);
    var md1 = new BrowserContextMenu(app1);

    md1.handleEvent(fakeContextMenuEvent);
    assert.isTrue(fakeContextMenuEvent.defaultPrevented);
  });

  test('Check that an empty context menu is not prevented', function() {
    var app1 = new AppWindow(fakeAppConfig1);
    var md1 = new BrowserContextMenu(app1);

    md1.handleEvent(fakeEmptyContextMenuEvent);
    assert.isTrue(!fakeEmptyContextMenuEvent.defaultPrevented);
  });

  test('Check that a context menu without items is not prevented', function() {
    var app1 = new AppWindow(fakeAppConfig1);
    var md1 = new BrowserContextMenu(app1);

    md1.handleEvent(fakeNoItemsContextMenuEvent);
    assert.isTrue(!fakeNoItemsContextMenuEvent.defaultPrevented);
  });


  test('Check that a system menu without items is prevented', function() {
    var app1 = new AppWindow(fakeAppConfig1);
    var md1 = new BrowserContextMenu(app1);

    app1.isBrowser = function() {
      return true;
    };

    for (var i = 0; i < fakeSystemContextMenuEvents.length; i++) {
      var event = fakeSystemContextMenuEvents[i];
      md1.handleEvent(event);
      assert.isTrue(event.defaultPrevented);
    }
  });


  test('Check that an app with system menu is not prevented', function() {
    var app1 = new AppWindow(fakeAppConfig1);
    var md1 = new BrowserContextMenu(app1);

    app1.isCertified = function() {
      return true;
    };

    for (var i = 0; i < fakeSystemContextMenuEvents.length; i++) {
      var event = fakeSystemContextMenuEvents[i];
      event.defaultPrevented = false;
      md1.handleEvent(event);
      assert.isFalse(event.defaultPrevented);
    }
  });

});
