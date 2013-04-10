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
		throw "PhotoGroup argument photoUrls should be array.";
	this.css({width:"100%"});
	var photoUrls = options.photoUrls,
		photoUrlsCount = photoUrls.length, i,
		thumbWidth = options.thumbWidth?options.thumbWidth:160,
		thumbHeight =  options.thumbWidth?options.thumbWidth:160,
		mouseoverScale = options.mouseoverScale?options.mouseoverScale:1.5,
		$parent = this.parent(),
		parentId = this.attr("id"),
		outerWidth = $parent.innerWidth() - parseInt($parent.css('padding-left')) - parseInt($parent.css('padding-right')),
		w=0, h=0, row=0, col=0, tOuterWidth, tBorderSize,borderOffset, html, rows, columns, backHtml = [], imageHtml = [];
		
	if (!$.photoGroupScalars)
		$.photoGroupScalars = {}; // A class scoped scalar dictionary is used to find the original scale by id.
	if (!$.photoGroupVectors)
		$.photoGroupVectors = {}; // A class scoped vector dictionary is used to find the original translation vector by id.
	if (!$.photoGroupCount)
		$.photoGroupCount = 1; // A class scoped instance count is used to help ensure unique ids.
	
	// Test the photoGroupBackground class for border width.  This is needed to calculate the thumbnail cell sizes.
	$("body").append("<div id=photoGroupBackgroundTester class=photoGroupBackground style=display:none; />");
	var tester = $("#photoGroupBackgroundTester");
	tBorderSize = parseInt( tester.css("border-width") );
	tester.remove();
	
	// Calculate number of columns and rows.
	tOuterWidth = tBorderSize + thumbWidth + tBorderSize;
	columns = Math.floor( outerWidth / tOuterWidth );
	rows = Math.ceil( photoUrlsCount / columns );
	borderOffset =  (tBorderSize - (tBorderSize % 2))/2;
	
	// Generate the html
	$.photoGroupReady = function($img, x, y) {
		var w = parseInt($img.css("width")),
			h = parseInt($img.css("height")),
			id = $img.attr("id"),
			s = $.photoGroupScalars[id] = (w>h?(thumbWidth/w):(thumbHeight/h)),
			v = $.photoGroupVectors[id] = [x+borderOffset-(w-thumbWidth)/2, y+borderOffset-(h-thumbHeight)/2];
		$img.css({display:""});
		$img.css({ translate:[v[0],v[1]], scale:s });
	};
	var idAppend = $.photoGroupCount+parentId;
	html = ['<div id=pGrpDivO',idAppend,' style="width:',outerWidth,'px;height:',(rows*(tBorderSize+thumbHeight)),'px;" >'];
	for (i=0;i<photoUrlsCount;i++){
		var photoUrl = photoUrls[i], imageUrl, thumbUrl, x = col*thumbWidth, y = row*thumbHeight,
			imgId = 'pGrpImg'+idAppend+i, divId = 'pGrpDiv'+idAppend+i;
		if (typeof photoUrl == "string")
			imageUrl = photoUrl;
		else {
			if (!(photoUrl && photoUrl.image && photoUrl.thumb))
				throw "photoUrls should be a url string or an object with image and thumb properties.";
			imageUrl = photoUrl.image;
			thumbUrl = photoUrl.thumb;
		}
		backHtml = backHtml.concat([
			'<div id=',divId,' style="position:absolute;top:',y,'px;left:',x,'px;display:inline;width:',
				thumbWidth-tBorderSize,'px;height:',thumbHeight-tBorderSize,'px;" class=photoGroupBackground />'
		]);
		imageHtml = imageHtml.concat([
			'<img class=pGrpImg id=',imgId,' src="',imageUrl,'" style="position:absolute;max-width:none;top:0;left:0;display:none;"',
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
	
	// Unused so far:
	var mobile = false, android = false;
	if(navigator.userAgent.match(/iPhone|iPad|iPod/i))
		mobile = true;
	else if(navigator.userAgent.match(/Android/i)) {
		mobile = true;
		android = true;
	}
	var $currentMask;
	// Define event handlers
	if (!$.pGrpImgMouseEnter) {
		$.pGrpImgMouseEnter = function(e){
			var $this = $(this),
				scale = $.photoGroupScalars[ $this.attr("id")];
			$this.css({"z-index":2});
			$this.transition({ scale: scale*mouseoverScale }, 'fast'); 
		}
		$.pGrpImgMouseleave = function(e){
			var $this = $(this),
				scale = $.photoGroupScalars[ $this.attr("id") ];
			$this.css({"z-index":1});
			$this.transition({ scale: scale }, 'fast');
		}
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
			if (w>h && w>ww)
				scale = ww/w;
			else if (h>wh)
				scale = wh/h;
			iw = parseInt(scale*w);
			ih = parseInt(scale*h);
			x = (ww-iw)/2 - (w-iw)/2;
			y = (wh-ih)/2 - (h-ih)/2;
			var style = " style='position:fixed;font-size:xx-large;font-weight:900;width:40px;height:30px;z-index:3;top:";
			$("body").append(
				"<div id=imgViewMask style='position:fixed;background-color:rgba(0,0,0,0.5);top:0;left:0;width:"+ww+"px;height:"+wh+"px;' >"+
					"<div id=photoGroupPrev class=photoGroupButton"+style+(wh/2-15)+"px;left:10px;' >&nbsp;&lt;&nbsp;</div>"+
					"<div id=photoGroupNext class=photoGroupButton"+style+(wh/2-15)+"px;left:"+(ww-50)+"px;' >&nbsp;&gt;&nbsp;</div>"+
				"</div>"
			);
			
			var $mask = $currentMask = $("#imgViewMask");
			$mask.append($this);
			if ($.photoGroupNavigation)
				$this.css({ translate:[x,y],scale: scale });
			else {
				$this.css({ translate:[v[0]+offsetLeft,v[1]+offsetTop] });
				$this.transition({ translate:[x,y],scale: scale });
			}
			$.photoGroupNavigation = true;
			
			$mask.click(function(){
				$this.transition({ translate:[v[0]+offsetLeft,v[1]+offsetTop], scale: $.photoGroupScalars[thisId] }, "fast", function(){
					$prev.after($this);
					$this.css({"z-index":1});
					$this.css({ translate:[v[0],v[1]] });
					$this.on('mouseenter', $.pGrpImgMouseEnter).on('mouseleave', $.pGrpImgMouseleave).on('click', $.pGrpImgClick);
					$mask.remove();
					$.photoGroupNavigation = false;
				});
			});
			
			$mask.destroy = function() {
				$this.css({ translate:[v[0],v[1]], scale: $.photoGroupScalars[thisId] });
				$prev.after($this);
				$this.css({"z-index":1});
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
	$(".pGrpImg").off('mouseenter').on('mouseenter', $.pGrpImgMouseEnter)
		.off('mouseleave').on('mouseleave', $.pGrpImgMouseleave)
		.off('click').on('click', $.pGrpImgClick);
		
	// Re-calculate row and columns on resize.
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
			var imgId = 'pGrpImg'+idAppend+i, divId = 'pGrpDiv'+idAppend+i;
			var x = col*thumbWidth, y = row*thumbHeight;
			$("#"+divId).css({left:x,top:y});
			var $img = $("#"+imgId), w = parseInt($img.css("width")), h = parseInt($img.css("height")), 
				v = $.photoGroupVectors[imgId] = [x+borderOffset-(w-thumbWidth)/2, y+borderOffset-(h-thumbHeight)/2];
			$img.css({ translate:[v[0],v[1]]});
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
			// TODO move next button.
		}
	}
	$(window).resize(function(){
		clearInterval(delayInterval);
		delayInterval = setInterval(delayedResize,100);
	});
};
