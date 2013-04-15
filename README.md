photogroup
==========

#### photogroup.js jQuery plugin is an animated image viewer.
Many gallery and image viewers available presume that you will be adding them to composed HTML. This project is useful for generated HTML, for example on a BBS to display an unknown number of grouped image uploads are attached to a post in an unknown width depending on browser window size.

[View the demo](http://photogroup.lxalumni.org).

Photogroup determines the number of rows and columns of its thumbnails automatically based in its parent's width and a fixed thumbnail size, which can optionally be passed into the constructor. 
## Dependencies:
REQUIRES jQuery and the [Transit jQuery plugin](https://github.com/rstacruz/jquery.transit).

### Usage:
HTML:

    <div id=myDiv style="width:100%;" />
    <!-- if the div has a flexible width photogroup will adjust its rows, columns and height when resized -->

Javascript:

    $("#myDiv").photoGroup({
      photoUrls: [
        {image:"/images/1.jpg",thumb:"/images/thumb1.jpg"}, /* with optional thumb url*/
        {image:"/images/2.jpg",thumb:"/images/thumb2.jpg"},
        "/images/3.jpg",  /* or without thumb */
      ]
    });
