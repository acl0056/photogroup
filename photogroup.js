/*
	File: photogroup.js
	
The MIT License (MIT)
Copyright (c) 2013 Adam Lockhart

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/*	Function: photoGroup(options)
	Takes an array of urls and creates a photogroup in the div contained in the jQuery object, on which this function is called.
	
	Parameters:
		options - An object with requied and optional arguments.
		
		(start code)
		Required:
			photoUrls - A required array of photo items, which can be a url string or an object with image and thumb properties, {image:"url",thumb:"url"}.
			
		Optional:
			thumbWidth - An optional width for the thumbnails. Defaults to 160.
			thumbHeight - An optional height for the thumbnails. Defaults to 160.
			mouseoverScale - An optional scalar used to increase image scale on mouseover. Defaults to 1.5.
 		(end)
*/
jQuery.fn.photoGroup = function(options) {
	if (!options || !$.isArray(options.photoUrls))
		throw "Required photoGroup argument photoUrls should be array.";
		
	var photoUrls = options.photoUrls,
		photoUrlsCount = photoUrls.length, i,
		thumbWidth = options.thumbWidth?options.thumbWidth:160,
		thumbHeight =  options.thumbWidth?options.thumbHeight:160,
		mouseoverScale = options.mouseoverScale?options.mouseoverScale:1.5,
		$parent = this.parent(),
		outerWidth = $parent.innerWidth() - parseInt($parent.css('padding-left')) - parseInt($parent.css('padding-right'));
		
	if (!$.photoGroupScalars)
		$.photoGroupScalars = {}; // A class scoped scalar dictionary is used to find the original scale by id.
	if (!$.photoGroupVectors)
		$.photoGroupVectors = {}; // A class scoped vector dictionary is used to find the original translation vector by id.
	if (!$.photoGroupCount)
		$.photoGroupCount = 1; // A class scoped instance count is used to help ensure unique ids.
	if (!$.photoGroupAnimation)
		$.photoGroupAnimation = {}; // A class scoped dictionary to track active animations.
	
	// Define photoGroupAnimation states.
	var animatingNone = 0,
		animatingMouseEnter = 1,
		animatingMouseLeave = 2,
		animatingModalShow = 3,
		animatingModalDismiss = 4;
	
	// Test the photoGroupBackground class for border width.  This is needed to calculate the thumbnail cell sizes.
	$("body").append("<div id=photoGroupBackgroundTester class=photoGroupBackground style=display:none; />");
	var tester = $("#photoGroupBackgroundTester"),
		tBorderSize = Math.round((parseInt( tester.css("border-top-width") ) + 
						parseInt( tester.css("border-bottom-width") ) + 
						parseInt( tester.css("border-left-width") ) + 
						parseInt( tester.css("border-right-width") ) ) / 4);
	tester.remove();
	
	// Calculate number of columns and rows.
	var tOuterWidth = tBorderSize + thumbWidth + tBorderSize, // Thumbnail cell outer width.
		columns = Math.floor( outerWidth / tOuterWidth ),
		rows = Math.ceil( photoUrlsCount / columns ),
		borderOffset =  (tBorderSize - (tBorderSize % 2))/2;
	
	// Scale by width or height depending on which is greater, unless when scaled the other dimension is larger than the container.
	function getScale(containerWidth, containerHeight, imageWidth, imageHeight) {
		if (imageWidth > imageHeight) {
			if (imageHeight * containerWidth / imageWidth > containerHeight)
				return containerHeight/imageHeight;
			else
				return containerWidth/imageWidth;
		}
		else {
			if (imageWidth * containerHeight / imageHeight > containerWidth)
				return containerWidth/imageWidth;
			else
				return containerHeight/imageHeight;
		}
	}
	
	//! Ready functions
	// The ready function is called after the image is loaded and everything can be calculateed based on its size.
	$.photoGroupReady = function($img, x, y) {
		var w = parseInt($img.css("width")),
			h = parseInt($img.css("height")),
			id = $img.attr("id"),
			s = $.photoGroupScalars[id] = getScale(thumbWidth, thumbHeight, w, h),
			v = $.photoGroupVectors[id] = [x+borderOffset-(w-thumbWidth)/2, y+borderOffset-(h-thumbHeight)/2];
		$img.css({display:""});
		$img.css({ translate:[v[0],v[1]], scale:s });
	};
	// The thumb ready function is called after the thumb image is loaded and everything can be calculateed based on its size.
	$.photoGroupThumbReady = function($img, x, y) {
		var w = parseInt($img.css("width")),
			h = parseInt($img.css("height")),
			s = getScale(thumbWidth, thumbHeight, w, h);
		w *= s;
		h *= s;
		$img.css({
			display:"",
			position:"absolute",
			left:x+borderOffset-(w-thumbWidth)/2,
			top:y+borderOffset-(h-thumbHeight)/2,
			width: w,
			height: h
		});
	};
	
	//! Generate HTML
	var parentId = this.attr("id"),
		idAppend = $.photoGroupCount+parentId,
		html = ['<div id=pGrpDivO',idAppend,' style="width:',outerWidth,'px;height:',(rows*(tBorderSize+thumbHeight)),'px;" >'],
		backHtml = [],
		imageHtml = [],
		w=0,
		h=0,
		row=0,
		col=0;
	for (i=0;i<photoUrlsCount;i++){
		var photoUrl = photoUrls[i],
			imageUrl,
			thumbUrl,
			x = col*thumbWidth, y = row*thumbHeight,
			imgId = 'pGrpImg'+idAppend+i,
			divId = 'pGrpDiv'+idAppend+i,
			thumbHtml = "";
			
		if (typeof photoUrl == "string")
			imageUrl = photoUrl;
		else {
			if (!(photoUrl && photoUrl.image && photoUrl.thumb))
				throw "photoUrls should be a url string or an object with image and thumb properties.";
			imageUrl = photoUrl.image;
			thumbUrl = photoUrl.thumb;
		}
		if (thumbUrl) {
			var thumbId = 'pGrpThumb'+idAppend+i,
			thumbHtml = '<img src="'+thumbUrl+'" id="'+thumbId+'" onload="$.photoGroupThumbReady($(this), '+x+', '+y+');" />';
		}
		backHtml = backHtml.concat([
			'<div id=',divId,' style="position:absolute;top:',y,'px;left:',x,'px;display:inline;width:',
				thumbWidth-tBorderSize,'px;height:',thumbHeight-tBorderSize,'px;" class=photoGroupBackground >',
			'</div>',
			thumbHtml
		]);
		imageHtml = imageHtml.concat([
			'<img class=pGrpImg id=',imgId,' src="',imageUrl,'" style="position:absolute;max-height:none;max-width:none;top:0;left:0;display:none;"',
			' onload="$.photoGroupReady($(this), ',x,', ',y,');" />',
		]);
		if (col == columns-1) {
			row++;
			col = 0;
		}
		else
			col++;
	}
	html = html.concat(backHtml, imageHtml);
	html.push("</div>");
	html = html.join("");
	this.html(html);

	var $currentMask;
	// Define event handlers
	if (!$.pGrpImgMouseEnter) {
		//! pGrpImgMouseEnter
		$.pGrpImgMouseEnter = function(e){
			var $this = $(this), thisId = $this.attr("id");
			if (!$.photoGroupAnimation[thisId]) {
				var scale = $.photoGroupScalars[thisId];
				$this.css({"z-index":1});
				$.photoGroupAnimation[thisId] = animatingMouseEnter;
				$this.transition({ scale: scale*mouseoverScale }, 'fast', function(){ 
					if ($.photoGroupAnimation[thisId] == animatingMouseEnter)
						$.photoGroupAnimation[thisId] = animatingNone;
					else if ($.photoGroupAnimation[thisId] == animatingMouseLeave) {
						$.photoGroupAnimation[thisId] = animatingNone;
						$this.trigger("mouseleave");
					}
				});
			}
			else if ($.photoGroupAnimation[thisId] == animatingMouseLeave) {
				$.photoGroupAnimation[thisId] = animatingMouseEnter;
			}
		}
		//! pGrpImgMouseleave
		$.pGrpImgMouseleave = function(e){
			var $this = $(this), thisId = $this.attr("id");
			if (!$.photoGroupAnimation[thisId]) {
				var scale = $.photoGroupScalars[ $this.attr("id") ];
				$this.css({"z-index":0});
				$.photoGroupAnimation[thisId] = animatingMouseLeave;
				$this.transition({ scale: scale }, 'fast', function(){ 
					if ($.photoGroupAnimation[thisId] == animatingMouseLeave)
						$.photoGroupAnimation[thisId] = animatingNone;
					else if ($.photoGroupAnimation[thisId] == animatingMouseEnter) {
						$.photoGroupAnimation[thisId] = animatingNone;
						$this.trigger("mouseenter");
					}
				});
			}
			else if ($.photoGroupAnimation[thisId] == animatingMouseEnter) {
				$.photoGroupAnimation[thisId] = animatingMouseLeave;
			}
		}
		//! pGrpImgClick
		$.pGrpImgClick = function(e){
			var $this = $(this),
				thisId = $this.attr("id"),
				$prev = $this.prev(),
				$next = $this.next(),
				parentOffset = $this.parent().offset(),
				$window = $(window),
				offsetTop = parentOffset.top - $window.scrollTop(),
				offsetLeft = parentOffset.left - $window.scrollLeft(),
				w = parseInt($this.css("width")),
				h = parseInt($this.css("height")),
				src = $this.attr("src"),
				ww = window.innerWidth,
				wh = window.innerHeight,
				v = $.photoGroupVectors[thisId],
				scale = 1, iw, ih, x, y;
			
			$this.off('mouseleave').off('mouseenter').off('click');
			scale = getScale(ww, wh, w, h);
			iw = parseInt(scale*w);
			ih = parseInt(scale*h);
			x = (ww-iw)/2 - (w-iw)/2;
			y = (wh-ih)/2 - (h-ih)/2;
			var style = " style='position:fixed;font-size:xx-large;font-weight:900;width:40px;height:30px;z-index:5000;top:";
			$("body").append(
				"<div id=imgViewMask style='position:fixed;background-color:rgba(0,0,0,0.5);top:0;left:0;width:"+ww+"px;height:"+wh+"px;' >"+
					"<div id=photoGroupPrev class=photoGroupButton"+style+(wh/2-15)+"px;left:10px;' >&nbsp;&lt;&nbsp;</div>"+
					"<div id=photoGroupNext class=photoGroupButton"+style+(wh/2-15)+"px;left:"+(ww-50)+"px;' >&nbsp;&gt;&nbsp;</div>"+
				"</div>"
			);
			
			var $mask = $currentMask = $("#imgViewMask");
			$mask.append($this);
			
			// if we are navigating, do not animate.
			if ($.photoGroupNavigation)
				$this.css({ translate:[x,y],scale: scale });
			else {
				$this.css({ translate:[v[0]+offsetLeft,v[1]+offsetTop] });
				$.photoGroupAnimation[thisId] = animatingModalShow;
				$this.transition({ translate:[x,y],scale: scale }, function(){ 
					$.photoGroupAnimation[thisId] = animatingNone;
				});
			}
			$.photoGroupNavigation = true; // When the modal is up, we are navigating.
			
			$mask.on("click", function(){
				// Begin animated modal dismissal
				$mask.off("click");
				$this.css({"z-index":0});
				$.photoGroupAnimation[thisId] = animatingModalDismiss;
				$this.transition({ translate:[v[0]+offsetLeft,v[1]+offsetTop], scale: $.photoGroupScalars[thisId] }, "fast", function(){
					$prev.after($this);
					$this.css({ translate:[v[0],v[1]] });
					$.photoGroupAnimation[thisId] = animatingNone;
					$this.on('mouseenter', $.pGrpImgMouseEnter).on('mouseleave', $.pGrpImgMouseleave).on('click', $.pGrpImgClick);
					$mask.remove();
					$.photoGroupNavigation = false;
				});
			});
			
			
			$mask.destroy = function() {
				// Dismiss without animation
				$mask.off("click");
				$this.css({ translate:[v[0],v[1]], scale: $.photoGroupScalars[thisId] });
				$prev.after($this);
				$this.css({"z-index":0});
				$.photoGroupAnimation[thisId] = animatingNone;
				$this.on('mouseenter', $.pGrpImgMouseEnter).on('mouseleave', $.pGrpImgMouseleave).on('click', $.pGrpImgClick);
				this.remove();
			};
			
			// PhotoGroup navigation handlers
			$("#photoGroupPrev").click(function(e){
				e.stopPropagation();
				$mask.destroy();
				$prev.click();
			});
			if (!$prev.hasClass("pGrpImg"))
				$("#photoGroupPrev").hide();
			
			$("#photoGroupNext").click(function(e){
				e.stopPropagation();
				$mask.destroy();
				$next.click();
			});
			if (!$next.hasClass("pGrpImg"))
				$("#photoGroupNext").hide();
		}
	}
	// Set listeners
	$(".pGrpImg").off('mouseenter').on('mouseenter', $.pGrpImgMouseEnter)
		.off('mouseleave').on('mouseleave', $.pGrpImgMouseleave)
		.off('click').on('click', $.pGrpImgClick);
		
	// Re-calculate row and columns on resize. Note: this only works if "this" has a flexible width that resizes, which is left up to your implementation.
	var delayInterval;
	var start, end;
	var self = this;
	function delayedResize(){
		clearInterval(delayInterval);
		outerWidth = parseInt(self.css("width"));
		columns = Math.floor( outerWidth / tOuterWidth );
		rows = Math.ceil( photoUrlsCount / columns );
		$("#pGrpDivO"+idAppend).css({width:outerWidth+"px",height:(rows*(tBorderSize+thumbHeight))+"px" });
		row = 0;
		col = 0;
		for (i=0;i<photoUrlsCount;i++){
			var imgId = 'pGrpImg'+idAppend+i,
				divId = '#pGrpDiv'+idAppend+i,
				thumbId = '#pGrpThumb'+idAppend+i,
				x = col*thumbWidth,
				y = row*thumbHeight;
			$(divId).css({left:x,top:y});
			var $img = $("#"+imgId),
				w = parseInt($img.css("width")),
				h = parseInt($img.css("height")), 
				v = $.photoGroupVectors[imgId] = [x+borderOffset-(w-thumbWidth)/2, y+borderOffset-(h-thumbHeight)/2];
			$img.css({ translate:[v[0],v[1]]});
			
			var $thumb = $(thumbId);
			if ($thumb.length) {
				w = parseInt($thumb.css("width"));
				h = parseInt($thumb.css("height"));
				$thumb.css({ left:x+borderOffset-(w-thumbWidth)/2, top:y+borderOffset-(h-thumbHeight)/2 });
			}
			
			if (col == columns-1) {
				row++;
				col = 0;
			}
			else
				col++;
		}
		if ($currentMask && $currentMask.length) {
			var $img = $currentMask.find("img");
			$currentMask.destroy();
			$img.click();
		}
	}
	$(window).resize(function(){
		clearInterval(delayInterval);
		delayInterval = setInterval(delayedResize,100);
	});
};
