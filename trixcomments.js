/* Copyright © 2022-2024 Jamie Zawinski <jwz@jwz.org>

   Permission to use, copy, modify, distribute, and sell this software and its
   documentation for any purpose is hereby granted without fee, provided that
   the above copyright notice appear in all copies and that both that
   copyright notice and this permission notice appear in supporting
   documentation.  No representations are made about the suitability of this
   software for any purpose.  It is provided "as is" without express or 
   implied warranty.

   Initialization of the trix editor for use with WP comments.

   By default, Trix has no way to add an inline <IMG> or a video embed,
   except by copying and pasting HTML from somewhere else.  It has an
   "Attach" button but that is geared toward uploading files along with
   the typed text.  Most of what this code does is replace that "Attach"
   button with one that lets you specify the URL of an image or video
   to be inlined.  This is more difficult than it should have been.

   Created: 25-Apr-2022.
 */

// There's no sensible way to add or remove items from the Trix toolbar.
// For removal, we can hide them with CSS, but to add a button, we have
// to replace the whole thing.
//
// Removed "Strike", "Heading" and "Attach"; added "Embed".
//
// For the custom Embed dialog, some of the attributes need to begin with
// "x_" and some need to begin with "x-" instead and I have no idea why.
//
document.addEventListener ('trix-before-initialize', function() {
  Trix.config.toolbar.getDefaultHTML = function() { return "\n\
   <div class='trix-button-row'>\n\
    <span class='trix-button-group trix-button-group--text-tools'\n\
          data-trix-button-group='text-tools'>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon trix-button--icon-bold'\n\
        data-trix-attribute='bold' data-trix-key='b' title='Bold'\n\
        tabindex='-1'>Bold</button>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon trix-button--icon-italic'\n\
        data-trix-attribute='italic' data-trix-key='i' title='Italic'\n\
        tabindex='-1'>Italic</button>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon trix-button--icon-link'\n\
        data-trix-attribute='href' data-trix-action='link'\n\
        data-trix-key='k' title='Link' tabindex='-1'>Link</button>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon trix-button--icon-attach'\n\
        data-trix-attribute='x_embed' data-trix-action='x-embed'\n\
        title='Embed Image or Video' tabindex='-1'>Embed</button>\n\
    </span>\n\
    \n\
    <span class='trix-button-group trix-button-group--block-tools'\n\
          data-trix-button-group='block-tools'>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon trix-button--icon-quote'\n\
        data-trix-attribute='quote' title='Quote'\n\
        tabindex='-1'>Quote</button>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon trix-button--icon-code'\n\
        data-trix-attribute='code' title='Code'\n\
        tabindex='-1'>Code</button>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon trix-button--icon-bullet-list'\n\
        data-trix-attribute='bullet' title='Bullets'\n\
        tabindex='-1'>Bullets</button>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon trix-button--icon-number-list'\n\
        data-trix-attribute='number' title='Numbers'\n\
        tabindex='-1'>Numbers</button>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon\n\
        trix-button--icon-decrease-nesting-level'\n\
        data-trix-action='decreaseNestingLevel' title='Decrease Level'\n\
        tabindex='-1'>Decrease Level</button>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon\n\
        trix-button--icon-increase-nesting-level'\n\
        data-trix-action='increaseNestingLevel' title='Increase Level'\n\
        tabindex='-1'>Increase Level</button>\n\
    </span>\n\
    \n\
    <span class='trix-button-group-spacer'></span>\n\
    \n\
    <span class='trix-button-group trix-button-group--history-tools'\n\
        data-trix-button-group='history-tools'>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon trix-button--icon-undo'\n\
        data-trix-action='undo' data-trix-key='z' title='Undo'\n\
        tabindex='-1'>Undo</button>\n\
      <button type='button'\n\
        class='trix-button trix-button--icon trix-button--icon-redo'\n\
        data-trix-action='redo' data-trix-key='shift+z'\n\
        title='Redo' tabindex='-1'>Redo</button>\n\
    </span>\n\
  </div>\n\
  \n\
  <div class='trix-dialogs' data-trix-dialogs>\n\
    <div class='trix-dialog trix-dialog--link' data-trix-dialog='href'\n\
         data-trix-dialog-attribute='href'>\n\
      <div class='trix-dialog__link-fields'>\n\
        <input type='url' name='href'\n\
               class='trix-input trix-input--dialog'\n\
               placeholder='Enter a URL…' aria-label='URL'\n\
               required data-trix-input>\n\
        <div class='trix-button-group'>\n\
          <input type='button' class='trix-button trix-button--dialog'\n\
                 value='Link' data-trix-method='setAttribute'>\n\
          <input type='button' class='trix-button trix-button--dialog'\n\
                 value='Unlink' data-trix-method='removeAttribute'>\n\
        </div>\n\
      </div>\n\
    </div>\n\
    <div class='trix-dialog trix-dialog--x-embed'\n\
         data-trix-dialog='x_embed'\n\
         data-trix-dialog-attribute='x_embed'>\n\
      <div class='trix-dialog__x-embed-fields'>\n\
        <input type='url' name='x_embed'\n\
               class='trix-input trix-input--dialog'\n\
               placeholder='URL of Image, MP3, MP4 or YouTube…'\n\
               aria-label='Embed' required data-trix-input>\n\
        <div class='trix-button-group'>\n\
          <input type='button' class='trix-button trix-button--dialog'\n\
                 value='Embed'>\n\
        </div>\n\
      </div>\n\
    </div>\n\
  </div>";
  };
});


/**************************************************************************

 The "Embed" dialog.

 **************************************************************************/

// Attach a click handler to the x_embed dialog's "Submit" button
// to dismiss the dialog.  I don't understand why this is necessary
// but it is.  (Hitting RET in the text field dismisses properly.)
//
document.addEventListener ('trix-initialize', function() {
  for (d of document.getElementsByClassName('trix-dialog--x-embed')) {
    for (inp of d.getElementsByTagName('input')) {
      if (inp.type == 'button') {
        inp.addEventListener('click', function(e) {
          document.getElementsByTagName('trix-editor')[0]
            .editorController.toolbarController.hideDialog();

       });
      }
    }
  }
});


// Given a URL, return an IMG, VIDEO, AUDIO or IFRAME tag as appropriate.
//
function trixcomments_embed_html (url) {

  var url2 = url.replace (/[?#].*$/, '');
  if (!url2.match (/^https?:\/\//))
    return null;

  // Special case Giphy, since their URLs are garbage.
  // "https://giphy.com/gifs/buncha-words-CODE" =>
  // "https://media.giphy.com/media/CODE.gif"
  if (url2.match (/^https?:\/\/(?:[^\/]+\.)*giphy\.com\/.*?([^-.\/]+)$/s)) {
    url = url2 = "https://media.giphy.com/media/" + RegExp.$1 + "/giphy.gif";
  }

  var node = null;
  if (url2.match (/\.(jpg|jpeg|png|gif|svg)$/i)) {		// .jpg
    node = document.createElement('img');
    node.src = url;

  } else if (url2.match (/\.(mp4|m4v|mov)$/i)) {		// .mp4
    node = document.createElement ('video');
    node.src = url;
    node.setAttribute('controls', '');
    node.setAttribute('playsinline', '');
    node.setAttribute('allow', 'autoplay; fullscreen');
    node.setAttribute('gesture', 'media');
    node.setAttribute('delegatestickyuseractivation', '');
    node.setAttribute('allowfullscreen', '');

  } else if (url2.match (/\.(mp3|m3a|wav|m3u8?)$/i)) {		// .mp3
    node = document.createElement ('audio');
    node.src = url;
    node.setAttribute('controls', '');

  } else if (url.match (
    /^https:\/\/(?:[^\/]+\.)*youtu\.be\/([^\/?&#]+)/s)) {	// youtu.be
    var id = RegExp.$1;
    url2 = 'https://www.youtube.com/embed/' + id;
    node = document.createElement ('iframe');
    node.src = url2;
    node.setAttribute('allow', 'autoplay; fullscreen');
    node.setAttribute('gesture', 'media');
    node.setAttribute('delegatestickyuseractivation', '');
    node.setAttribute('allowfullscreen', '');

  } else if (url2.match (
    /^https:\/\/(?:[^\/]+\.)*youtube(-nocookie)?\.com\//i)) {	// youtube.com
    if (url.match (/v[\/=]([^<>?&\#\"]+)/i) ||
	url.match (/\/shorts\/([^<>?&\#\"]+)/i) ||
	url.match (/\/embed\/([^<>?&\#\"]+)/i)) {		// watch?v=...
      var id = RegExp.$1;
      url2 = 'https://www.youtube.com/embed/' + id;
      node = document.createElement ('iframe');
      node.src = url2;
      node.setAttribute('allow', 'autoplay; fullscreen');
      node.setAttribute('gesture', 'media');
      node.setAttribute('delegatestickyuseractivation', '');
      node.setAttribute('allowfullscreen', '');

    } else if (url.match (/p[\/=]([^<>?&\#\"]+)/i) ||	  // view_play_list?p=
	       url.match (/playlist.*list=([^<>?&\#\"]+)/i) ||
	       url.match (/play_list=([^<>?&\#\"]+)/i)) {
      var id = RegExp.$1;
      url2 = 'https://www.youtube.com/embed/' +
             '?version=3&listType=playlist&list=' + id;
      node = document.createElement ('iframe');
      node.src = url2;
      node.setAttribute('allow', 'autoplay; fullscreen');
      node.setAttribute('gesture', 'media');
      node.setAttribute('delegatestickyuseractivation', '');
      node.setAttribute('allowfullscreen', '');
    }

  } else if (url.match (/https?:\/\/(?:[a-z.]+\.)?vimeo\.com\//i)) { // vimeo
    if (url.match (/\bvimeo\.com\/([\d]+)/i) ||
        url.match (/\/(?:videos?|m|name|embed)\/([\d]+)/i)) {
      var id = RegExp.$1;
      url2 = 'https://www.youtube.com/embed/' + id;
      node = document.createElement ('iframe');
      node.src = url2;
      node.setAttribute('allow', 'autoplay; fullscreen');
      node.setAttribute('gesture', 'media');
      node.setAttribute('delegatestickyuseractivation', '');
      node.setAttribute('allowfullscreen', '');
    }
  }

  if (node)
    return (node.outerHTML);
}


// When the "x_embed" dialog has been dismissed, grab the URL out of it
// and insert an appropiate IMG or IFRAME into the editor.
//
// #### If you "cancel" the dialog by clicking outside of it, this still
// runs, and I don't know how to tell that it was a cancel gesture.
// The various event objects are identical.
//
document.addEventListener ('trix-toolbar-dialog-hide', function(event) {
  if (event.dialogName == 'x_embed') {
    var d = document.getElementsByClassName('trix-dialog--x-embed')[0];
    for (inp of d.getElementsByTagName('input')) {
      if (inp.type == 'url' && inp.value.match(/\S/)) {
        var trix = document.getElementsByTagName('trix-editor')[0];
        var html = trixcomments_embed_html (inp.value);
        if (!html)
          html = '<DIV ALIGN=CENTER>' +
            '<DIV CLASS="broken-embed"></DIV>' +
            '<DIV CLASS="broken-embed-caption">bad embed URL</DIV>' +
            '</DIV>';
        trix.editor.insertAttachment (new Trix.Attachment({ content: html }));

      }
    }
  }
});


// By default, dropping a local file onto the editor makes it an attachment
// queued for upload.  Silently ignore such drops instead.
//
document.addEventListener("trix-file-accept", function(e) {
  e.preventDefault();
});


/**************************************************************************

 When clicking the "Reply" link, move the comment form to the right place,
 and make sure the Trix editor area has focus.

 **************************************************************************/

function trixcomments_wrap_moveform() {
  if (! window.addComment) {
    console.log ("trixcomments: wrap: comment-reply.js not yet loaded");
    return;
  } else if (window.addComment.trixcomments_orig_moveForm) {
    console.log ("trixcomments: wrap: already wrapped");
    return;
  }

  window.addComment.trixcomments_orig_moveForm = window.addComment.moveForm;
  window.addComment.moveForm = function (commId, parentId, respondId, postId) {

    // Expose the possibly-hidden response form, then call super.
    document.getElementById (respondId).style.display = "block";
    window.addComment.trixcomments_orig_moveForm (commId, parentId,
                                                  respondId, postId);

    var comm = commId ? document.getElementById (commId) : null;
    if (comm) {
      // Focus text field upon clicking "Reply"; moveForm tried to do
      // this, but fails with Trix.
      //
      var trix = comm.parentNode.getElementsByTagName ('trix-editor')[0];
      if (trix) trix.focus();

      // Make it more obvious who we are replying to.
      //
      var name = comm.getElementsByTagName('cite')[0];
      var out = document.getElementById ('comment-form-replying-to');
      if (name && out)
        out.innerText = 'Replying to ' + name.innerText + '.';
    }

    return false;
  };

  console.log ("trixcomments: wrapped");
}


/**************************************************************************

 If this is a "#comment-NNNN" page (link to show comment), then hide the
 reply form until the "Reply" link is clicked.

 If this is a "?replytocom-NNNN#respond" page (link to respond to
 comment), then move the field to the right place and scroll it into
 view.

 **************************************************************************/

function trixcomments_adjust_reply_form (url) {
  var resp = document.getElementById("respond");
  if (document.location.hash.match (/\b(comment)-(\d+)\b/)) {
    resp.style.display = "none";
    console.log ("trixcomments: reply: hid form");

  } else if (document.location.search.match (/\b(replytocom)=(\d+)\b/)) {
    var cid = RegExp.$2;
    var pid = document.getElementById ('comment_post_ID');
    if (pid) {
      if (window.addComment) {  // Maybe comment-reply.js isn't loaded?
        window.addComment.init();
        window.addComment.moveForm ("div-comment-" + cid, cid,
                                    "respond", pid.value);
        resp.style.display = "block";
        console.log ("trixcomments: reply: moved form");
      } else {
        resp.style.display = "none";  // made visible next time around
        console.log ("trixcomments: reply: comment-reply.js not yet loaded");
      }
      var n = document.getElementById ("comment-" + cid);
      if (n) n.scrollIntoView();
      n = document.getElementById ("commentform");
      if (n) n.scrollIntoView();
    }
  }
}


/**************************************************************************

 This needs to fire after "comment-reply.js" is loaded, so "DOMContentLoaded"
 might be too early. However, "load" is very late, because it also waits for
 all images to fully load.

 I guess we could try to find the script tag for "comment-reply.min.js" and
 add a load event handler to that, but that seems pretty sketchy as well.

 **************************************************************************/

function trixcomments_init() {
  if (window.addComment) {
    trixcomments_wrap_moveform();
    trixcomments_adjust_reply_form();
    console.log ("trixcomments: initted");
  } else {
    console.log ("trixcomments: comment-reply.js not yet loaded");

    // "comment-reply.js" not loaded - try again in a second.
    setTimeout (trixcomments_init, 1000);

    // And also try again once all scripts *and images* are loaded.
    window.addEventListener ("load", trixcomments_init);
  }
}

document.addEventListener ("DOMContentLoaded", trixcomments_init);
