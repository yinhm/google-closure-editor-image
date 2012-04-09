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
 * @fileoverview An bubble for edit or remove an image.
 * @author yinhm
 */

goog.provide('goog.editor.plugins.ImageBubble');

goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.TagName');
goog.require('goog.editor.plugins.AbstractBubblePlugin');
goog.require('goog.editor.range');
goog.require('goog.style');
goog.require('goog.ui.editor.messages');


/**
 * Property bubble plugin for image.
 * @constructor
 * @extends {goog.editor.plugins.AbstractBubblePlugin}
 */
goog.editor.plugins.ImageBubble = function() {
  goog.base(this);
};
goog.inherits(goog.editor.plugins.ImageBubble,
    goog.editor.plugins.AbstractBubblePlugin);


/**
 * Element id for the change image span.
 * type {string}
 * @private
 */
goog.editor.plugins.ImageBubble.CHANGE_IMAGE_SPAN_ID_ = 'tr_change-image-span';


/**
 * Element id for the image.
 * type {string}
 * @private
 */
goog.editor.plugins.ImageBubble.CHANGE_IMAGE_ID_ = 'tr_change-image';


/**
 * Element id of the delete image spam.
 * type {string}
 * @private
 */
goog.editor.plugins.ImageBubble.DELETE_IMAGE_SPAN_ID_ = 'tr_delete-image-span';

/**
 * Element id for the delete image.
 * type {string}
 * @private
 */
goog.editor.plugins.ImageBubble.DELETE_IMAGE_ID_ = 'tr_delete-image';


/**
 * Element id for the image bubble wrapper div.
 * type {string}
 * @private
 */
goog.editor.plugins.ImageBubble.IMAGE_DIV_ID_ = 'tr_image-div';


/**
 * @desc Label that pops up a bubble caption.
 */
var MSG_IMAGE_BUBBLE = goog.getMsg('Add an image');


/**
 * @desc Label of edit the image action.
 */
var MSG_IMAGE_BUBBLE_CHANGE = goog.getMsg('Edit');


/**
 * @desc Label of remove this image action.
 */
var MSG_IMAGE_BUBBLE_REMOVE = goog.getMsg('Remove');


/** @inheritDoc */
goog.editor.plugins.ImageBubble.prototype.getTrogClassId = function() {
  return 'ImageBubble';
};

/**
 * @type {string}
 */
goog.editor.plugins.ImageBubble.CLASS_NAME = 'ImageBubbleClass';


/** @inheritDoc */
goog.editor.plugins.ImageBubble.prototype.getBubbleTargetFromSelection =
    function(selectedElement) {
  var bubbleTarget = goog.dom.getAncestorByTagNameAndClass(selectedElement,
      goog.dom.TagName.IMG);

  if (!bubbleTarget) {
    // See if the selection is touching the right side of a link, and if so,
    // show a bubble for that link.  The check for "touching" is very brittle,
    // and currently only guarantees that it will pop up a bubble at the
    // position the cursor is placed at after the link dialog is closed.
    // NOTE(robbyw): This assumes this method is always called with
    // selected element = range.getContainerElement().  Right now this is true,
    // but attempts to re-use this method for other purposes could cause issues.
    // TODO(robbyw): Refactor this method to also take a range, and use that.
    var range = this.fieldObject.getRange();
    if (range && range.isCollapsed() && range.getStartOffset() == 0) {
      var startNode = range.getStartNode();
      var previous = startNode.previousSibling;
      if (previous && previous.tagName == goog.dom.TagName.IMG) {
        bubbleTarget = previous;
      }
    }
  }

  return /** @type {Element} */ (bubbleTarget);
};


/** @inheritDoc */
goog.editor.plugins.ImageBubble.prototype.getBubbleType = function() {
  return goog.dom.TagName.IMG;
};


/** @inheritDoc */
goog.editor.plugins.ImageBubble.prototype.getBubbleTitle = function() {
  return MSG_IMAGE_BUBBLE;
};


/** @inheritDoc */
goog.editor.plugins.ImageBubble.prototype.createBubbleContents = function(
    bubbleContainer) {

  var changeImageSpan = this.dom_.createDom(goog.dom.TagName.SPAN,
      { id: goog.editor.plugins.ImageBubble.CHANGE_IMAGE_SPAN_ID_,
        className: goog.editor.plugins.AbstractBubblePlugin.OPTION_LINK_CLASSNAME_});

  this.createLink(goog.editor.plugins.ImageBubble.CHANGE_IMAGE_ID_,
      MSG_IMAGE_BUBBLE_CHANGE, this.showImageDialog_, changeImageSpan);

  var removeImageSpan = this.createLinkOption(
    goog.editor.plugins.ImageBubble.DELETE_IMAGE_SPAN_ID_);
  this.createLink(goog.editor.plugins.ImageBubble.DELETE_IMAGE_ID_,
      MSG_IMAGE_BUBBLE_REMOVE, this.deleteImage_, removeImageSpan);

  this.onShow();

  var bubbleContents = this.dom_.createDom(goog.dom.TagName.DIV,
      {id: goog.editor.plugins.ImageBubble.IMAGE_DIV_ID_},
      changeImageSpan, removeImageSpan);

  goog.dom.appendChild(bubbleContainer, bubbleContents);
};


/**
 * Gets the text to display for a image, based on the type of image
 * @return {Object} Returns an object of the form:
 *     {imageSrc: displayTextForImageSrc, imageAlt: displayTextForImageAlt}.
 * @private
 */
goog.editor.plugins.ImageBubble.prototype.getImageToTextObj_ = function() {
  var alt = this.getTargetElement().getAttribute('alt') || '';
  var src = this.getTargetElement().getAttribute('src') || '';

  return {imageSrc: src, imageAlt: alt};
};


/**
 * Deletes the image associated with the bubble
 * @private
 */
goog.editor.plugins.ImageBubble.prototype.deleteImage_ = function() {
  this.fieldObject.dispatchBeforeChange();
  goog.dom.removeNode(this.getTargetElement());
  this.closeBubble();
  this.fieldObject.dispatchChange();
};


/**
 * Shows the image dialog
 * @private
 */
goog.editor.plugins.ImageBubble.prototype.showImageDialog_ = function() {
  this.fieldObject.execCommand(goog.editor.Command.IMAGE, this.getTargetElement());
  this.closeBubble();
};
