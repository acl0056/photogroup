photogroup
==========

photogroup.js is an animated jQuery plugin image viewer.  It determines the number of rows and columns of its thumbnails automatically based in its parent's width and thumbnail size.  The thumbnail width and height can optionally be passed in.  Many gallery and image viewers available presume that you will be adding them to composed HTML. This project is useful for generated HTML, for example on a BBS to display an unknown number of grouped image uploads in an unknown width depending on browser window size.

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
