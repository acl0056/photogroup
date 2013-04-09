/*	
	photoUrls - A required array of photo items, which can be a url string or an object with image and thumb properties, {image:"url",thumb:"url"}.
	thumbWidth -
	thumbHeight - 
*/
jQuery.fn.photoGroup = function(options) {
	if (!options || !$.isArray(options.photoUrls))
		throw "PhotoGroup argument photoUrls should be array.";
	
	var photoUrls = options.photoUrls,
		photoUrlsCount = photoUrls.length, i,
		thumbWidth = options.thumbWidth?options.thumbWidth:160,
		thumbHeight =  options.thumbWidth?options.thumbWidth:160,
		$parent = this.parent(),
		parentId = this.attr("id"),
		outerWidth = $parent.innerWidth() - parseInt($parent.css('padding-left')) - parseInt($parent.css('padding-right')),
		w=0, h=0, row=0, col=0, tOuterWidth, tBorderSize,borderOffset, html, rows, columns, backHtml = [], imageHtml = [];
		
	if (!$.photoGroupScalars)
		$.photoGroupScalars = {};
	if (!$.photoGroupVectors)
		$.photoGroupVectors = {};
	if (!$.photoGroupCount)
		$.photoGroupCount = 1;
	
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
	html = ['<div style="width:',outerWidth,'px;height:',(rows*(tBorderSize+thumbHeight+tBorderSize)),'px;" >'];
	
	for (i=0;i<photoUrlsCount;i++){
		var photoUrl = photoUrls[i], imageUrl, thumbUrl, x = col*thumbWidth, y = row*thumbHeight, imgId = 'pGrpImg'+$.photoGroupCount+parentId+i;
		if (typeof photoUrl == "string")
			imageUrl = photoUrl;
		else {
			if (!(photoUrl && photoUrl.image && photoUrl.thumb))
				throw "photoUrls should be a url string or an object with image and thumb properties.";
			imageUrl = photoUrl.image;
			thumbUrl = photoUrl.thumb;
		}
		backHtml = backHtml.concat([
			'<div style="position:absolute;top:',y,'px;left:',x,'px;display:inline;width:',
				thumbWidth-tBorderSize,'px;height:',thumbHeight-tBorderSize,'px;" class=photoGroupBackground />'
		]);
		imageHtml = imageHtml.concat([
			'<img class=pGrpImg id=',imgId,' src="',imageUrl,'" style="position:absolute;top:0;left:0;display:none;"',
			' onload="var $t=$(this);$t.css({display:&quot;&quot;});var w=parseInt($t.css(&quot;width&quot;)),h=parseInt($t.css(&quot;height&quot;));',
			'var v,id=&quot;',imgId,'&quot;,s=$.photoGroupScalars[id]=(w>h?(',thumbWidth,'/w):(',thumbHeight,'/h));',
			'v=$.photoGroupVectors[id]=[',x+borderOffset,'-(w-',thumbWidth,')/2, ',y+borderOffset,'-(h-',thumbHeight,')/2];',
			'$t.css({ translate:[v[0],v[1]], scale:s });" />',
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
	this.resize(function(){
		console.log('resize');
	});
	
	// Define event handlers
	if (!$.pGrpImgMouseEnter) {
		$.pGrpImgMouseEnter = function(e){
			var $this = $(this),
				scale = $.photoGroupScalars[ $this.attr("id")];
			$this.css({"z-index":2});
			$this.transition({ scale: scale*1.5 }, 'fast'); 
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
			var style = " style='position:fixed;width:40px;height:30px;top:";
			$("body").append(
				"<div id=imgViewMask style='position:fixed;background-color:rgba(0,0,0,0.5);top:0;left:0;width:"+ww+"px;height:"+wh+"px;' >"+
					"<div id=photoGroupPrev class=photoGroupButton"+style+(wh/2-15)+"px;left:10px;' >&nbsp;&lt;&nbsp;</div>"+
					"<div id=photoGroupNext class=photoGroupButton"+style+(wh/2-15)+"px;left:"+(ww-50)+"px;' >&nbsp;&gt;&nbsp;</div>"+
				"</div>"
			);
				
			var $mask = $("#imgViewMask");
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
			
			// PhotoGroup navigation handlers
			$("#photoGroupPrev").click(function(e){
				e.stopPropagation();
				$this.css({ translate:[v[0],v[1]], scale: $.photoGroupScalars[thisId] });
				$prev.after($this);
				$this.css({"z-index":1});
				$this.on('mouseenter', $.pGrpImgMouseEnter).on('mouseleave', $.pGrpImgMouseleave).on('click', $.pGrpImgClick);
				$mask.remove();
				$prev.click();
			});
			if (!$prev.hasClass("pGrpImg"))
				$("#photoGroupPrev").hide();
			
			$("#photoGroupNext").click(function(e){
				e.stopPropagation();
				$this.css({ translate:[v[0],v[1]], scale: $.photoGroupScalars[thisId] });
				$prev.after($this);
				$this.css({"z-index":1});
				$this.on('mouseenter', $.pGrpImgMouseEnter).on('mouseleave', $.pGrpImgMouseleave).on('click', $.pGrpImgClick);
				$mask.remove();
				$next.click();
			});
			if (!$next.hasClass("pGrpImg"))
				$("#photoGroupNext").hide();
		}
	}
	$(".pGrpImg").off('mouseenter').on('mouseenter', $.pGrpImgMouseEnter)
		.off('mouseleave').on('mouseleave', $.pGrpImgMouseleave)
		.off('click').on('click', $.pGrpImgClick);
};
