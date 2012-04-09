// Copyright 2010 The Imigu Authors. All Rights Reserved.

/**
 * @fileoverview Imigu editor.
 */
goog.provide('imigu.editor');

goog.require('goog.dom');
goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.editor.plugins.EnterHandler');
goog.require('goog.editor.plugins.HeaderFormatter');
goog.require('goog.editor.plugins.ImageBubble');
goog.require('goog.editor.plugins.ImageDialogPlugin');
goog.require('goog.editor.plugins.LinkBubble');
goog.require('goog.editor.plugins.LinkDialogPlugin');
goog.require('goog.editor.plugins.ListTabHandler');
goog.require('goog.editor.plugins.LoremIpsum');
goog.require('goog.editor.plugins.RemoveFormatting');
goog.require('goog.editor.plugins.SpacesTabHandler');
goog.require('goog.editor.plugins.TagOnEnterHandler');
goog.require('goog.editor.plugins.UndoRedo');
goog.require('goog.ui.editor.DefaultToolbar');
goog.require('goog.ui.editor.ToolbarController');


/**
 * replace textarea with closure torg editor.
 *
 * example:
 *
 * <pre>
 *   imigu.editor('content', {
 *     actionUrl : '/upload',
 *     extraCode: '<input name="token" type="hidden" value="TOKEN_VALUE_FOO" />'
 *   });
 * </ pre>
 *
 * upload should returns:
 *
 * <pre>
 *   // on succcess
 *   {"status": 0, "imageUrl": "http://youdomain/foo.png"}
 *   // on error
 *   {"status": 1, "errorMsg": "Upload failed!"}
 * </pre>
 *
 *
 * @param {string} id of content textarea container.
 * @param {Object} config Image upload configs, must supply an actionUrl for image upload, see example.
 */
imigu.editor = function(id, config) {
  function updateFieldContents() {
    textarea.value = trogField.getCleanContents();
  }

  var editorId = id + '-editor';
  var toolbarId = id + '-toolbar';
  var textarea = goog.dom.getElement(id);

  var dom = goog.dom.getDomHelper(textarea);

  var toolbar = dom.createDom(goog.dom.TagName.DIV,
                              {id: toolbarId,
                               style: 'width: 632px;'});
  goog.dom.insertSiblingAfter(toolbar, textarea);

  var editorDiv = dom.createDom(goog.dom.TagName.DIV,
                                {id: editorId,
                                 style: 'width: 630px; height: 300px; background-color: white; border: 1px solid grey;'});
  goog.dom.insertSiblingAfter(editorDiv, toolbar);

  textarea.style.display = 'none';

  // Create an editable field.
  var trogField = new goog.editor.Field(editorId);

  // Create and register all of the editing plugins you want to use.
  trogField.registerPlugin(new goog.editor.plugins.BasicTextFormatter());
  trogField.registerPlugin(new
                         goog.editor.plugins.TagOnEnterHandler(goog.dom.TagName.P));
  trogField.registerPlugin(new goog.editor.plugins.RemoveFormatting());
  trogField.registerPlugin(new goog.editor.plugins.UndoRedo());
  trogField.registerPlugin(new goog.editor.plugins.ListTabHandler());
  trogField.registerPlugin(new goog.editor.plugins.SpacesTabHandler());
  trogField.registerPlugin(new goog.editor.plugins.EnterHandler());
  trogField.registerPlugin(new goog.editor.plugins.HeaderFormatter());
  trogField.registerPlugin(
    new goog.editor.plugins.LoremIpsum('Click here to edit'));
  trogField.registerPlugin(
    new goog.editor.plugins.LinkDialogPlugin());
  trogField.registerPlugin(new goog.editor.plugins.LinkBubble());

  trogField.registerPlugin(new goog.editor.plugins.ImageBubble());
  trogField.registerPlugin(new goog.editor.plugins.ImageDialogPlugin(config));

  // Specify the buttons to add to the toolbar, using built in default buttons.
  var buttons = [
    goog.editor.Command.FONT_SIZE,
    goog.editor.Command.BOLD,
    goog.editor.Command.ITALIC,
    goog.editor.Command.UNDERLINE,
    goog.editor.Command.BACKGROUND_COLOR,
    goog.editor.Command.IMAGE,
    goog.editor.Command.LINK,
    goog.editor.Command.UNDO,
    goog.editor.Command.REDO,
    goog.editor.Command.UNORDERED_LIST,
    goog.editor.Command.ORDERED_LIST,
    goog.editor.Command.INDENT,
    goog.editor.Command.OUTDENT,
    goog.editor.Command.JUSTIFY_LEFT,
    goog.editor.Command.JUSTIFY_CENTER,
    goog.editor.Command.JUSTIFY_RIGHT,
    goog.editor.Command.REMOVE_FORMAT
  ];

  var myToolbar =
    goog.ui.editor.DefaultToolbar.makeToolbar(buttons, toolbar);

  // Hook the toolbar into the field.
  var myToolbarController =
    new goog.ui.editor.ToolbarController(trogField, myToolbar);

  goog.ui.editor.DefaultToolbar.setLocale('zh-cn');

  trogField.setHtml(false, textarea.value, true);

  // Watch for field changes, to display below.
  goog.events.listen(trogField, goog.editor.Field.EventType.DELAYEDCHANGE,
                     updateFieldContents);

  trogField.makeEditable();
  updateFieldContents();

};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('imigu.editor', imigu.editor);
