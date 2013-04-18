photogroup
==========

#### photogroup.js jQuery plugin is an animated image viewer.
Many gallery and image viewers available presume that you will be adding them to composed HTML. This project is useful for generated HTML; for example, on a social networking site to display an unknown number of grouped image uploads attached to a post in an unknown width depending on browser window size.

[View the demo](http://photogroup.lxalumni.org).

Photogroup determines the number of rows and columns of its thumbnails automatically based on its parent's width and a fixed thumbnail size, which can optionally be passed into the constructor. Thumbnail images are not required, since larger images will be scaled down to thumbnail size anyway.  But when thumbnails are provided, the photos will appear to load faster.
## Dependencies:
Requires [jQuery](http://jquery.com/download/) and the [Transit jQuery plugin](https://github.com/rstacruz/jquery.transit).

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

### Documentation:
    Function: photoGroup(options)
    	Parameters:
    		options - An object with requied and optional arguments.
    			Required:
    				photoUrls - A required array of photo items, which can be a url string
    					or an object with image and thumb properties, {image:"url",thumb:"url"}.
    			Optional:
    				thumbWidth - An optional width for the thumbnails. Defaults to 160.
    				thumbHeight - An optional height for the thumbnails. Defaults to 160.
    				mouseoverScale - An optional scalar used to increase image scale on mouseover. Defaults to 1.5.
