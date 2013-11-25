Random Name Picker
==================

Simple app that will pick a random name from a list of give names. Will rotate through all the names entered and slowly/eventually pick a winner for the suspense effect if shown on a projector.

Might've gone a bit over the top, but is backed by backbone (with local storage). Uses underscore's shuffle for randomisation. Developed and tested in Chrome (and sort of Firefox) only.

Feel free to change as per your needs :)

How to use
----------
1. Load up `main.html` and you should see the input screen.
1. Enter list of names that will be in the draw
1. Click on 'pick winner' in bottom left hand corner to start the draw

**Notes**

* If you need to pick another name, hover around the far left of the winning name to reveal the remove icon to remove the name from the list - you can now pick another winner
* If you want to clear all the names from the list, click on the 'clear all' in the bottom right hand corner, and click on the new red 'CLEAR ALL' that appears

Entering names via file
------------------
If you want to populate the list of names via values from a file, you can reveal the file upload controls by clicking on the 'file upload' trigger in the bottom right.

The upload file will appear in the top left of the screen. You can toggle the visibility of these controls by clicking on the 'file upload' trigger.

The contents of the file should only contain the names to be uploaded. The names will be separated by commas(,), pipes(|) or enters.

For example, the following are valid:
```
one,two,three,four
```
```
one|two|three|four
```
```
one
two
three
four
```
_Note: I have not focussed on the performance of this app, so upload large files at your own risk!_


License
-------
MIT