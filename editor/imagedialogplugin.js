// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview An simple Image dialog plugin.
 * @author yinhm
 */

goog.provide('goog.editor.plugins.ImageDialogPlugin');

goog.require('goog.dom.TagName');
goog.require('goog.editor.plugins.AbstractDialogPlugin');
goog.require('goog.editor.plugins.ImageDialog');
goog.require('goog.editor.range');
goog.require('goog.functions');
goog.require('goog.ui.editor.AbstractDialog.EventType');


// *** Public interface ***************************************************** //

/**
 * A plugin for the ImageDialog.
 * @param {Object} config The image dialog config.
 * @constructor
 * @extends {goog.editor.plugins.AbstractDialogPlugin}
 */
goog.editor.plugins.ImageDialogPlugin = function(config) {
  goog.base(this, goog.editor.Command.IMAGE);

  this.config_ = config;
};
goog.inherits(goog.editor.plugins.ImageDialogPlugin,
              goog.editor.plugins.AbstractDialogPlugin);

/** @inheritDoc */
goog.editor.plugins.ImageDialogPlugin.prototype.getTrogClassId =
  goog.functions.constant('ImageDialogPlugin');


// *** Protected interface ************************************************** //


/**
 * Creates a new instance of the dialog and registers for the relevant events.
 * @param {goog.dom.DomHelper} dialogDomHelper The dom helper to be used to
 *     create the dialog.
 * @param {*} image The source image if exists.
 * @return {goog.editor.plugins.ImageDialog} The dialog.
 * @override
 * @protected
 */
goog.editor.plugins.ImageDialogPlugin.prototype.createDialog = function(
  dialogDomHelper, image) {
  var dialog = new goog.editor.plugins.ImageDialog(dialogDomHelper,
                 /** @type {HTMLImageElement} */ (image));
  if (this.config_) {
    dialog.setConfig(this.config_);
  }

  dialog.addEventListener(goog.ui.editor.AbstractDialog.EventType.OK,
                          this.handleOk_,
                          false,
                          this);
  return dialog;
};


// *** Private implementation *********************************************** //

/**
 * The image dialog config.
 * @type {Object}
 * @private
 */
goog.editor.plugins.ImageDialogPlugin.prototype.config_;


/**
 * Handles the OK event from the dialog by inserting the Image
 * into the field.
 * @param {goog.editor.plugins.ImageDialog.OkEvent} e OK event object.
 * @private
 */
goog.editor.plugins.ImageDialogPlugin.prototype.handleOk_ = function(e) {
  // Notify the editor that we are about to make changes.
  this.fieldObject.dispatchBeforeChange();

  // Create the image to insert.
  var image = this.getFieldDomHelper().createElement(goog.dom.TagName.IMG);

  // Grab the url of the image off of the event.
  image.src = e.imageUrl;

  // We want to insert the image in place of the user's selection.
  // So we restore it first, and then use it for insertion.
  this.restoreOriginalSelection();
  var range = this.fieldObject.getRange();
  image = range.replaceContentsWithNode(image);

  // Done making changes, notify the editor.
  this.fieldObject.dispatchChange();

  // Put the user's selection right after the newly inserted image.
  goog.editor.range.placeCursorNextTo(image, false);

  // Dispatch selection change event since we just moved the selection.
  this.fieldObject.dispatchSelectionChangeEvent();
};
