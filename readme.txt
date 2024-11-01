=== WYSIWYG Comments with Trix Editor ===

Contributors: jwz
Tags: HTML, rich text, Trix, WYSIWYG, Comments
Requires at least: 2.7
Tested up to: 6.5
Stable tag: 1.2
License: MIT
License URI: https://github.com/basecamp/trix/blob/main/LICENSE

This replaces the WordPress comment submission form with a WYSIWYG rich-text editor.

== Description ==

This replaces the WordPress comment submission form with a WYSIWYG rich-text editor. It includes a toolbar for bold, italic, links, embeds, blockquotes, code, and lists.

The editor used is [Trix](https://trix-editor.org/), written by Sam Stephenson and Javan Makhmali for Basecamp. This WordPress integration is by Jamie Zawinski.

== Installation ==

1. Upload the `wysiwyg-comments-trix` directory to your `/wp-content/plugins/` directory.
2. Activate the plugin through the "Plugins" menu in WordPress.
3. Select the "Settings / Discussion" page to adjust the color scheme.

== Screenshots ==
1. The rich-text comment edit field.

== Changelog ==

= 1.0 =
* Created

= 1.1 =
* Reject comments that appear to have been typed using raw HTML. The elderly will get used to the new way eventually.

= 1.2 =
* Updated to Trix 2.0.10.
* Avoid race condition when initializing comment-reply JavaScript.
* Added a special case to make embedding Giphy images work.
