photogroup
==========

photogroup.js is an animated jQuery plugin image viewer.  It determines the number of rows and columns of its thumbnails automatically based in its parent's width and thumbnail size.  The thumbnail width and height can optionally be passed in.

## Dependencies:
REQUIRES jQuery and the [Transit jQuery plugin](https://github.com/rstacruz/jquery.transit).

### Usage:
HTML:

    <div id=myDiv>

Javascript:

    $("#myDiv").photoGroup({
      photoUrls: [
        {image:"/images/1.jpg",thumb:"/images/thumb1.jpg"}, /* with optional thumb url*/
        {image:"/images/2.jpg",thumb:"/images/thumb2.jpg"},
        "/images/3.jpg",  /* or without thumb */
      ]
    });
