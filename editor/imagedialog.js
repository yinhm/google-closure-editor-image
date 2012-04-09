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
 * @fileoverview An dialog for editing/uploading an image.
 * @author yinhm
 */

goog.provide('goog.editor.plugins.ImageDialog');
goog.provide('goog.editor.plugins.ImageDialog.OkEvent');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.focus');
goog.require('goog.events.ActionHandler');
goog.require('goog.events.ActionHandler.EventType');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.json');
goog.require('goog.net.EventType');
goog.require('goog.net.IframeIo');
goog.require('goog.string');
goog.require('goog.ui.editor.AbstractDialog');
goog.require('goog.ui.editor.AbstractDialog.Builder');
goog.require('goog.ui.editor.AbstractDialog.EventType');
goog.require('goog.ui.editor.TabPane');
goog.require('goog.ui.editor.messages');



// *** Public interface ***************************************************** //

/**
 * A dialog for editing/uploading an image.
 * @param {goog.dom.DomHelper} domHelper DomHelper to be used to create the
 *     dialog's DOM structure.
 * @param {HTMLImageElement} image The image.
 * @constructor
 * @extends {goog.ui.editor.AbstractDialog}
 */
goog.editor.plugins.ImageDialog = function(domHelper, image) {
  goog.base(this, domHelper);
  this.image_ = image;

  /**
   * The event handler for this dialog.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

};
goog.inherits(goog.editor.plugins.ImageDialog,
              goog.ui.editor.AbstractDialog);


/**
 * @desc Text label for image upload.
 */
var MSG_IMAGE_DIALOG = goog.getMsg('Add an image');

/**
 * @desc Text label for image upload tab.
 */
var MSG_IMAGE_DIALOG_UPLOAD_INPUT_TAB = goog.getMsg('My Computer');

/**
 * @desc Text label for image upload.
 */
var MSG_IMAGE_DIALOG_UPLOAD_INPUT = goog.getMsg('Upload an image: ');

/**
 * @desc Text label for image url.
 */
var MSG_IMAGE_DIALOG_ON_WEB_INPUT = goog.getMsg('Image URL: ');


/**
 * @desc Msg on image upload error.
 */
var MSG_IMAGE_DIALOG_ON_UPLOAD_ERROR = goog.getMsg('Upload failed.');


// *** Event **************************************************************** //

/**
 * OK event object for the image dialog.
 * @param {string} imageUrl Url the image.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.editor.plugins.ImageDialog.OkEvent = function(imageUrl) {
  goog.base(this, goog.ui.editor.AbstractDialog.EventType.OK);

  /**
   * The url of the image edited in the dialog.
   * @type {string}
   */
  this.imageUrl = imageUrl;
};
goog.inherits(goog.editor.plugins.ImageDialog.OkEvent, goog.events.Event);


/** @inheritDoc */
goog.editor.plugins.ImageDialog.prototype.show = function() {
  goog.base(this, 'show');

  if (this.isNewLink_()) {
    this.tabPane_.setSelectedTabId(goog.editor.plugins.ImageDialog.Id_.UPLOAD_TAB);
  } else {
    this.tabPane_.setSelectedTabId(goog.editor.plugins.ImageDialog.Id_.ON_WEB_TAB);
  }

  this.dom.getElement(goog.editor.plugins.ImageDialog.Id_.ON_WEB_INPUT)
    .value = this.isNewLink_() ? '' : this.image_.getAttribute('src');

  this.syncOkButton_();
};


/**
 * Set image dialog config.
 * @param {Object} config Config of image dialog.
 */
goog.editor.plugins.ImageDialog.prototype.setConfig = function(config) {
  this.config_ = config;
};


// *** Protected interface ************************************************** //

/** @inheritDoc */
goog.editor.plugins.ImageDialog.prototype.createDialogControl = function() {

  var content = this.dom.createDom(goog.dom.TagName.DIV, null);

  var builder = new goog.ui.editor.AbstractDialog.Builder(this);
  builder.setTitle(MSG_IMAGE_DIALOG)
      .setContent(content);

  this.tabPane_ = new goog.ui.editor.TabPane(this.dom);
  this.tabPane_.addTab(goog.editor.plugins.ImageDialog.Id_.UPLOAD_TAB,
      MSG_IMAGE_DIALOG_UPLOAD_INPUT_TAB,
      '',
      this.buildTabUpload_());
  this.tabPane_.addTab(goog.editor.plugins.ImageDialog.Id_.ON_WEB_TAB,
      goog.ui.editor.messages.MSG_ON_THE_WEB,
      goog.ui.editor.messages.MSG_ON_THE_WEB_TIP,
      this.buildTabOnTheWeb_());
  this.tabPane_.render(content);

  this.eventHandler_.listen(this.tabPane_, goog.ui.Component.EventType.SELECT,
      this.onChangeTab_);

  return builder.build();
};


/**
 * Creates and returns the event object to be used when dispatching the OK
 * event to listeners based on which tab is currently selected and the contents
 * of the input fields of that tab.
 * @return {goog.editor.plugins.ImageDialog.OkEvent} The event object to be used when
 *     dispatching the OK event to listeners.
 * @protected
 * @override
 */
goog.editor.plugins.ImageDialog.prototype.createOkEvent = function() {
  if (this.tabPane_.getCurrentTabId() ==
      goog.editor.plugins.ImageDialog.Id_.UPLOAD_TAB) {
    var image = this.getUploadedImage_();
    var imageURL = typeof image == 'undefined' ? '' : image.getAttribute('src');
  } else {
    var input = /** @type {HTMLInputElement} */(
      this.dom.getElement(goog.editor.plugins.ImageDialog.Id_.ON_WEB_INPUT));
    var imageURL = input.value;
    if (imageURL.search(/:/) < 0) {
      imageURL = 'http://' + goog.string.trimLeft(imageURL);
    }
  }

  return new goog.editor.plugins.ImageDialog.OkEvent(imageURL);
};


/** @inheritDoc */
goog.editor.plugins.ImageDialog.prototype.disposeInternal = function() {
  this.eventHandler_.dispose();
  this.eventHandler_ = null;

  this.urlInputHandler_.dispose();
  this.urlInputHandler_ = null;

  goog.base(this, 'disposeInternal');
};


// *** Private implementation *********************************************** //

/**
 * Config of the image dialog.
 * @type {Object}
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.config_ = {};


/**
 * The image being modified by this dialog.
 * @type {HTMLImageElement}
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.image_ = null;


/**
 * EventHandler object that keeps track of all handlers set by this dialog.
 * @type {goog.events.EventHandler}
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.eventHandler_;


/**
 * InputHandler object to listen for changes in the url input field.
 * @type {goog.events.InputHandler}
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.urlInputHandler_;


/**
 * The tab bar where the image and upload tabs are.
 * @type {goog.ui.editor.TabPane}
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.tabPane_;


/**
* Builds and returns the div containing the tab "On the web".
* @return {Element} The div element containing the tab.
* @private
*/
goog.editor.plugins.ImageDialog.prototype.buildTabOnTheWeb_ = function() {
  var onTheWebDiv = this.dom.createElement(goog.dom.TagName.DIV);

  var table = this.dom.createTable(1, 2);
  table.cellSpacing = '0';
  table.cellPadding = '0';
  table.style.fontSize = '12pt';
  // Build the text to display input.
  table.rows[0].cells[0].innerHTML = '<span style="position: relative;' +
      ' bottom: 2px; padding-right: 1px; white-space: nowrap;">' +
    MSG_IMAGE_DIALOG_ON_WEB_INPUT + '&nbsp;</span>';

  var urlInput = this.dom.createDom(goog.dom.TagName.INPUT,
      {id: goog.editor.plugins.ImageDialog.Id_.ON_WEB_INPUT,
       className: goog.editor.plugins.ImageDialog.TARGET_INPUT_CLASSNAME_});

  if (!goog.userAgent.IE) {
    // On browsers that support Web Forms 2.0, allow autocompletion of URLs.
    // (As of now, this is only supported by Opera 9)
    urlInput.type = 'url';
  }

  goog.style.setStyle(urlInput, 'width', '98%');
  goog.style.setStyle(table.rows[0].cells[1], 'width', '100%');
  goog.dom.appendChild(table.rows[0].cells[1], urlInput);

  this.urlInputHandler_ = new goog.events.InputHandler(urlInput);
  this.eventHandler_.listen(this.urlInputHandler_,
      goog.events.InputHandler.EventType.INPUT,
      this.onUrlInputChange_);

  onTheWebDiv.appendChild(table);

  return onTheWebDiv;
};


/**
* Builds and returns the div containing the tab "On the web".
* @return {Element} The div element containing the tab.
* @private
*/
goog.editor.plugins.ImageDialog.prototype.buildTabUpload_ = function() {
  var uploadDiv = this.dom.createElement(goog.dom.TagName.DIV);

  if (goog.typeOf(this.config_['actionUrl']) == 'undefined') {
    return uploadDiv;
  }

  var table = this.dom.createTable(1, 2);
  table.cellSpacing = '0';
  table.cellPadding = '0';
  table.style.fontSize = '12pt';
  // Build the text to display input.
  table.rows[0].cells[0].innerHTML = '<span style="position: relative;' +
      ' bottom: 2px; padding-right: 1px; white-space: nowrap;">' +
    MSG_IMAGE_DIALOG_UPLOAD_INPUT + '&nbsp;</span>';

  var fileInput = this.dom.createDom(goog.dom.TagName.INPUT,
      {id: goog.editor.plugins.ImageDialog.Id_.UPLOAD_INPUT,
       type: 'file',
       name: 'file',
       className: goog.editor.plugins.ImageDialog.TARGET_INPUT_CLASSNAME_});

  var fileForm = this.dom.createDom(goog.dom.TagName.FORM,
      {id: goog.editor.plugins.ImageDialog.Id_.UPLOAD_FORM,
       method: 'post',
       action: this.config_['actionUrl'],
       enctype: 'multipart/form-data',
       onsubmit: 'return false'});

  fileForm.encoding = 'multipart/form-data'; // fix for IE

  if (this.config_['extraCode']) {
    var extraCodeDiv = this.dom.createDom(goog.dom.TagName.DIV, {});
    extraCodeDiv.innerHTML = this.config_['extraCode'];
    fileForm.appendChild(extraCodeDiv);
  }
  fileForm.appendChild(fileInput);

  goog.style.setStyle(fileForm, 'width', '98%');
  goog.style.setStyle(table.rows[0].cells[1], 'width', '100%');
  goog.dom.appendChild(table.rows[0].cells[1], fileForm);

  this.form_ = fileForm;

  this.eventHandler_.listen(fileInput,
                            goog.events.EventType.CHANGE,
                            this.onFileInputChange_);

  uploadDiv.appendChild(table);

  return uploadDiv;
};


/**
 * Called whenever the url input is edited.
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.onUrlInputChange_ = function() {
  this.syncOkButton_();
};


/**
 * Called whenever the file input is changed. If the selected file matches an
 * image, auto upload it on background.
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.onFileInputChange_ = function() {
  // starting upload
  var io = new goog.net.IframeIo();
  this.eventHandler_.listen(io, goog.net.EventType.SUCCESS,
                            this.onFileUploadSuccess_);
  this.eventHandler_.listen(io, goog.net.EventType.ERROR,
                            this.onFileUploadError_);
  io.sendFromForm(this.form_);
};


/**
 * Called when image succcess uploaded.
 * @param {goog.events.Event} e The net event object.
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.onFileUploadSuccess_ = function(e) {
  var tabId = goog.editor.plugins.ImageDialog.Id_.UPLOAD_TAB + goog.editor.plugins.ImageDialog.Id_.TAB_SUFFIX;
  var currTab = document.getElementById(tabId);

  var io = e.target;
  var rspJson = /** @type {Object} **/ io.getResponseJson();
  if (rspJson['status'] === 0) {
    var uploadedImage = this.dom.createDom(goog.dom.TagName.IMG,
                                           { id: 'uploaded-image',
                                             src: rspJson['imageUrl']});
    this.dom.appendChild(currTab, uploadedImage);
    this.syncOkButton_();
    this.processOkAndClose();
  } else {
    var errorMsg = this.dom.createDom(goog.dom.TagName.SPAN,
                                      { style: 'color: red;'},
                                      this.dom.createTextNode(rspJson['errorMsg']));
    this.dom.appendChild(currTab, errorMsg);
  }
};


/**
 * Called when image upload failed.
 * @param {goog.events.Event} e The net event object.
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.onFileUploadError_ = function(e) {
  var tabId = goog.editor.plugins.ImageDialog.Id_.UPLOAD_TAB + goog.editor.plugins.ImageDialog.Id_.TAB_SUFFIX;
  var currTab = document.getElementById(tabId);

  var io = e.target;
  var errorMsg = this.dom.createDom(goog.dom.TagName.SPAN,
                                    { style: 'color: red;'},
                                    this.dom.createTextNode(MSG_IMAGE_DIALOG_ON_UPLOAD_ERROR));
  this.dom.appendChild(currTab, errorMsg);
};


/**
 * Called when the currently selected tab changes.
 * @param {goog.events.Event} e The tab change event.
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.onChangeTab_ = function(e) {
  var tab = /** @type {goog.ui.Tab} */ (e.target);

      // Focus on the input field in the selected tab.
  var input = this.dom.getElement(tab.getId() +
                                  goog.editor.plugins.ImageDialog.Id_.TAB_INPUT_SUFFIX);

  if (this.tabPane_.getCurrentTabId() ==
      goog.editor.plugins.ImageDialog.Id_.ON_WEB_TAB) {
    goog.editor.focus.focusInputField(input);
  }

  if (input) {
    // For some reason, IE does not fire onpropertychange events when the width
    // is specified as a percentage, which breaks the InputHandlers.
    input.style.width = '';
    input.style.width = input.offsetWidth + 'px';
  }

  this.syncOkButton_();
};


/**
 * Called on a change to the url or email input. If either one of those tabs
 * is active, sets the OK button to enabled/disabled accordingly.
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.syncOkButton_ = function() {
  var inputValue;
  var imageURL;
  if (this.tabPane_.getCurrentTabId() ==
      goog.editor.plugins.ImageDialog.Id_.ON_WEB_TAB) {
    imageURL = this.dom.getElement(
      goog.editor.plugins.ImageDialog.Id_.ON_WEB_INPUT).value;
  } else if (this.tabPane_.getCurrentTabId() ==
      goog.editor.plugins.ImageDialog.Id_.UPLOAD_TAB) {
    var image = this.getUploadedImage_();
    imageURL = typeof image == 'undefined' ? '' : image.getAttribute('src');
  } else {
    return;
  }
  this.getOkButtonElement().disabled = goog.string.isEmpty(imageURL);
};


/**
 * @return {HTMLImageElement} Uploaded imaage.
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.getUploadedImage_ = function() {
  var tabId = goog.editor.plugins.ImageDialog.Id_.UPLOAD_TAB + goog.editor.plugins.ImageDialog.Id_.TAB_SUFFIX;
  var currTab = this.dom.getElement(tabId);
  var images = goog.dom.getElementsByTagNameAndClass('img', null, currTab);

  return images.length > 0 ? images[0] : undefined;
};


/**
 * @return {boolean} Whether the link is new.
 * @private
 */
goog.editor.plugins.ImageDialog.prototype.isNewLink_ = function() {
  return this.image_ == null ? true : false;
};


/**
 * IDs for relevant DOM elements.
 * @enum {string}
 * @private
 */
goog.editor.plugins.ImageDialog.Id_ = {
  ON_WEB_TAB: 'imagedialog-onweb',
  ON_WEB_INPUT: 'imagedialog-onweb-tab-input',
  UPLOAD_TAB: 'imagedialog-upload',
  UPLOAD_INPUT: 'imagedialog-upload-tab-input',
  UPLOAD_FORM: 'imagedialog-upload-tab-form',
  TAB_SUFFIX: '-tab',
  TAB_INPUT_SUFFIX: '-tab-input'
};


/**
 * Class name for the url and email input elements.
 * @type {string}
 * @private
 */
goog.editor.plugins.ImageDialog.TARGET_INPUT_CLASSNAME_ =
    goog.getCssName('tr-link-dialog-target-input');
