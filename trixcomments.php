<?php
/*
Plugin Name: WYSIWYG Comments with Trix Editor
Plugin URI: https://www.jwz.org/wysiwyg-comments-trix/
Version: 1.2
Description: Replaces the comment submission form with a WYSIWYG rich-text editor.
Author: Jamie Zawinski
Author URI: https://www.jwz.org/
*/

/* Copyright © 2022-2024 Jamie Zawinski <jwz@jwz.org>

   Permission to use, copy, modify, distribute, and sell this software and its
   documentation for any purpose is hereby granted without fee, provided that
   the above copyright notice appear in all copies and that both that
   copyright notice and this permission notice appear in supporting
   documentation.  No representations are made about the suitability of this
   software for any purpose.  It is provided "as is" without express or 
   implied warranty.

   Created: 31-May-2022.
 */

$trixcomments_plugin_version   = "1.2";
$trixcomments_plugin_title     = 'WYSIWYG Comments with Trix Editor';
$trixcomments_plugin_name      = 'trixcomments';
$trixcomments_prefs_theme_key  = 'theme';
$trixcomments_prefs_theme_id   = "$trixcomments_plugin_name-$trixcomments_prefs_theme_key";

// Replace the comment textarea with trix.
//
add_filter ('comment_form_defaults', 'trixcomments_form_defaults', 99);
function trixcomments_form_defaults ($default) {

  // Get the theme setting
  global $trixcomments_plugin_name;
  global $trixcomments_prefs_theme_key;
  $options = get_option ($trixcomments_plugin_name) ?? null;
  $theme = $options ? $options[$trixcomments_prefs_theme_key] : null;
  if (!$theme) $theme = 'light';

  $trix = ('<span class="trix-theme-' . $theme . '">' .
            '<input id="comment" name="comment" type="hidden" required />' .
            '<trix-editor id="trix" input="comment"></trix-editor>' .
           '</span>');
  $default['comment_field'] =
    preg_replace ('@<textarea[^<>]*>(.*?</textarea>)?@si',
                  $trix, $default['comment_field']);

  return $default;
}


add_action ('wp_enqueue_scripts', 'trixcomments_enqueue_scripts');
function trixcomments_enqueue_scripts() {  
  global $trixcomments_plugin_version;
  global $trixcomments_plugin_name;

  // Only load the JS if this is a post or page with comments.
  if (! is_singular()) return;

  // We need the CSS if any comments exist, to set the size of comment embeds.
  if (!have_comments() && !comments_open()) return;

  // This seems to not always be loaded already?
  wp_enqueue_script ('comment-reply');

  $base = plugin_dir_url (__FILE__);
  $v = $trixcomments_plugin_version;
  $n = $trixcomments_plugin_name;
  wp_enqueue_style  ('trix',         $base . "$n.css",  [], $v);
  wp_enqueue_script ('trix',         $base . "trix.js", [], $v);
  wp_enqueue_script ('trixcomments', $base . "$n.js",   [], $v);
}


add_action ('init', 'trixcomments_enable_tags');
function trixcomments_enable_tags() {  
  global $allowedtags;

  // Trix emits these tags in comments, which are not allowed by default:
  //
  $allowedtags['a']['data-size'] = true;
  $allowedtags['pre']    = [];
  $allowedtags['ul']     = ['type' => true];
  $allowedtags['li']     = ['align' => true, 'value' => true];
  $allowedtags['ol']     = ['start' => true, 'type' => true,
                            'reversed' => true];
  $allowedtags['div']    = ['align' => true, 'class' => true];
  $allowedtags['span']   = ['align' => true, 'dir' => true];
  $allowedtags['p']      = ['align' => true];
  $allowedtags['br']     = [];
  $allowedtags['img']    = ['src'         => true,
                            'width'       => true,
                            'height'      => true,
                            'style'       => true,
                            'data-size'   => true];
  $allowedtags['iframe'] = ['src'         => true,
                            'class'       => true,
                            'width'       => true,
                            'height'      => true];
  $allowedtags['video']  = ['src'         => true,
                            'class'       => true,
                            'controls'    => true,
                            'loop'        => true,
                            'muted'       => true,
                            'autoplay'    => true,
                            'playsinline' => true,
                            'width'       => true,
                            'height'      => true];
  $allowedtags['audio']  = ['src'         => true,
                            'class'       => true,
                            'controls'    => true,
                            'loop'        => true,
                            'muted'       => true,
                            'autoplay'    => true,
                            'playsinline' => true];

  // Trix also emits these tags, which *are* allowed by default,
  // but let's include them anyway just to be safe:
  //
  $allowedtags['blockquote'] = ['cite' => true];
  $allowedtags['strong']     = [];
  $allowedtags['em']         = [];
  $allowedtags['del']        = ['datetime' => true];
}


// Clean up some dumb stuff that Trix emits in its HTML output.
// This should have lower priority than the KSES filters.
//
add_filter ('pre_comment_content', 'trixcomments_clean_html', 1);
function trixcomments_clean_html ($html) {

  // The string comes in backslashed, and I don't understand why.
  // Are we expected to return a backslashed string too?
  $html = wp_kses_stripslashes ($html);

  // What's with the spurious UTF-8 byte-order marks scattered within?
  $html = str_replace ("\u{FEFF}", '', $html);

  // The HTML that Trix emits into the hidden output form field is full of
  // a lot of internal cruft that confuses 'wp_filter_kses' -- stuff like
  //
  //   <figure data-trix-attachment="{&quot;content&quot;:&quot;<B ...
  //
  // It's hard to remove because the quoted string contains literal < and >.
  // WordPress dooms us all to inhuman toil for the One whose Name cannot
  // be expressed in the Basic Multilingual Plane.
  //
  $html = preg_replace ('/\s*\bdata-trix-[^\s=]+=".*?"\s*/si', ' ', $html);

  // Lose all <figure> and <figcaption> tags.  KSES will do this, but do it
  // earlier just in case there's more Trix madness in them.
  //
  $html = preg_replace ('@</?(figure|figcaption)[^<>]*>@si', '', $html);

  // Turn allowfullscreen="" into just allowfullscreen.
  $html = preg_replace_callback ('@<[^/<>][^<>]*>@s',
            function ($s) { return preg_replace ('/=""/s', '', $s[0]); },
            $html);

  // Trix goes nbsp-happy. Replace solitary nbsps with real spaces.
  $html = preg_replace ('@([^; ])&nbsp;([^& ])@s', '$1 $2', $html);

  // The following div-and-br rewriting is to simplify things down to readable
  // plain-text without a forest of spurious and inconsequential divs around
  // things.

  // <div><br></div>  =>  <br>
  $html = preg_replace ('@<div>((<br>[ \t]*)+)</div>@si', '$1', $html);

  // </div><br>  ==>  <br></div>
  $html = preg_replace ('@(</div>)(([ \t]*<br>)+)@si', '$2$1', $html);

  // </div></div>  =>  <br>
  $html = preg_replace ('@</div>[ \t]*<div\s*>@si', '<br>', $html);

  // </div><ul>  =>  <br><br></div><ul>
  // </ul><div>  =>  </ul><br><br><div>
  $html = preg_replace ('@(</div>)[ \t]*(<(ul|ol)\b)@si',
                        '<br><br>$1$2', $html);
  $html = preg_replace ('@(</(?:ul|ol)>)[ \t]*(<div\b)@si',
                        '$1<br><br>$2', $html);

  // If there's only one DIV around the whole thing, remove it.
  if (! preg_match ('@<div.*<div@si', $html))
    $html = preg_replace ('@^<div>(.*)</div>\s*$@si', '$1', $html);

  // Trix only includes literal newlines inside <PRE>.
  // Since WordPress converts newlines in comments to <BR> at display time,
  // let's use real newlines.
  $html = preg_replace ('@<br>@si', "\n", $html);

  // If there is a DIV with no tags inside it, that can go too.
  // $html = preg_replace ('@<div>([^<>]*)</div>@si', "$1", $html);

  // I think that any remaining <div> or </div> can be converted to a newline.
  // Trix does not emit <div style>.
  $html = preg_replace ('@\n</?div\b[^<>]*>@si',  "\n", $html);
  $html = preg_replace ('@</?div\b[^<>]*>\n?@si', "\n", $html);

  // At most 2 consecutive blank lines.
  $html = preg_replace ('@(\n\n)\n+@si', '$1', $html);

  // Remove trailing blank lines.
  // $html = preg_replace ('@\n+((</div>)*)$@si', '$1', $html);

  // Remove leading and trailing blank lines.
  $html = preg_replace ('/^\n+|\n+$/si', '', $html);

  return $html;
}


// If someone appears to be typing raw HTML, make them go back and try again.
// Many long-time readers are are in the habit of doing that...
//
add_filter ('preprocess_comment', 'trixcomments_forbid_raw_html');
function trixcomments_forbid_raw_html ($commentdata) {
  $body = $commentdata['comment_content'];
  $body = wp_kses_stripslashes ($body);
  $body = preg_replace ('/&nbsp;/', ' ', $body);
  if (preg_match ('@&amp;lt;@si', $body) ||		        // Literal &lt;
      preg_match ('@&lt;\s*(A|IMG)\s+(HREF|SRC)\s*=@si', $body) ||  // <A HREF=
      preg_match ('@&lt;\s*(VIDEO|IFRAME)\s+@si', $body) ||         // <IFRAME
      preg_match (
        '@&lt;\s*(B|I|EM|STRONG|TT|PRE|CODE|P|BR|BLOCKQUOTE)\s*&@si', // <B>
                  $body)) {
    wp_die (__('It looks like you are typing raw HTML. ' .
               'Go back and format using the toolbar instead.'),
            '',
            [ 'response' => 400, 'back_link' => true ]);
  }
  return $commentdata;
}


/*************************************************************************
 Admin pages
 *************************************************************************/

// Create the preferences fields and hook in to the database.
// Add the preferences field on the "Settings / Discussion" page,
// before the "Avatars" section.
//
add_action('admin_init', 'trixcomments_admin_init');
function trixcomments_admin_init() {
  global $trixcomments_plugin_name;
  global $trixcomments_prefs_theme_id;

  register_setting ('discussion', $trixcomments_plugin_name, 'array');
  add_settings_field ($trixcomments_prefs_theme_id,
                      'Comment form color theme',
                      'trixcomments_setting_string',
                      'discussion',
                      'default');
}


// Generates the <select> form element for our preference.
//
function trixcomments_setting_string() {
  global $trixcomments_plugin_name;
  global $trixcomments_prefs_theme_key;
  global $trixcomments_prefs_theme_id;

  $options = get_option ($trixcomments_plugin_name) ?? null;
  $def_theme = $options ? $options[$trixcomments_prefs_theme_key] : "light";

  print "<select id='$trixcomments_prefs_theme_id'" .
             " name='" . $trixcomments_plugin_name . "[" .
                         $trixcomments_prefs_theme_key . "]'>\n";
  foreach (array('light', 'dark', 'green') as $tt) {
    print "<option value='$tt'" . 
          ($def_theme == $tt ? ' selected' : '') . ">" .
          htmlspecialchars (ucwords($tt)) . "</option>\n";
  }
  print "</select>\n";
}
