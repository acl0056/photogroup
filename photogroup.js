/*	
	photoUrls - A required array of photo items, which can be a url string or an object with image and thumb properties, {image:"url",thumb:"url"}.
	thumbWidth
	thumbHeight
	rowSpacing
	columnSpacing
	thumbBorderStyle
	thumbBorderSize
	thumbBorderColor
*/
jQuery.fn.photoGroup = function(options) {
	if (!options || !$.isArray(options.photoUrls))
		throw "PhotoGroup argument photoUrls should be array.";
	
	var photoUrls = options.photoUrls,
		photoUrlsCount = photoUrls.length, i,
		thumbWidth = options.thumbWidth?options.thumbWidth:160,
		thumbHeight =  options.thumbWidth?options.thumbWidth:160,
		rowSpacing =  options.rowSpacing?options.rowSpacing:10,
		columnSpacing =  options.columnSpacing?options.columnSpacing:10,
		thumbBorderStyle = options.thumbBorderStyle?options.thumbBorderStyle:'solid',
		thumbBorderSize = options.thumbBorderSize?options.thumbBorderSize:'1px',
		thumbBorderColor = options.thumbBorderColor?options.thumbBorderColor:'black',
		tBorder = thumbBorderStyle+" "+thumbBorderSize+" "+thumbBorderColor,
		tBorderSize = parseInt(thumbBorderSize),
		$parent = this.parent(),
		parentId = this.attr("id"),
		outerWidth = $parent.innerWidth() - parseInt($parent.css('padding-left')) - parseInt($parent.css('padding-right')),
		tOuterWidth = tBorderSize + thumbWidth + tBorderSize + columnSpacing,
		columns = Math.floor( outerWidth / tOuterWidth ),
		rows = Math.ceil( photoUrlsCount / columns ),
		w=0,h=0, row=0, col=0,
		html = ['<div style="width:',outerWidth,'px;height:',(rows*(tBorderSize+thumbHeight+tBorderSize)+(rows-1)*rowSpacing),'px;" >'];
		
	if (!window.photoGroupScalars)
		window.photoGroupScalars = {};
	for (i=0;i<photoUrlsCount;i++){
		var photoUrl = photoUrls[i], imageUrl, thumbUrl;
		if (typeof photoUrl == "string")
			imageUrl = photoUrl;
		else {
			if (!(photoUrl && photoUrl.image && photoUrl.thumb))
				throw "photoUrls should be a url string or an object with image and thumb properties.";
			imageUrl = photoUrl.image;
			thumbUrl = photoUrl.thumb;
		}
		
		html = html.concat([
/* 			'<div style="display:inline;width:',thumbWidth,'px;height:',thumbHeight,'px;margin-right:',rowSpacing,'px;border:',tBorder,'" >', */
				'<img class=pGrpImg id=pGrpImg',parentId,i,' src="',photoUrl,'" style="position:absolute;top:0;left:0;display:none;"',
				' onload="var $t=$(this);$t.css({display:&quot;&quot;});var w=parseInt($t.css(&quot;width&quot;)),h=parseInt($t.css(&quot;height&quot;));',
				'var s=window.photoGroupScalars[&quot;pGrpImg',parentId,i,'&quot;]=(w>h?(',thumbWidth,'/w):(',thumbHeight,'/h));',
				'$t.css({ translate:[',col*thumbWidth,'-(w-',thumbWidth,')/2, ',row*thumbHeight,'-(h-',thumbHeight,')/2], ',
				'scale:s });',
				,'" />',
/* 			'</div>' */
		]);
		if (col == columns-1) {
			row++;
			col = 0;
		}
		else
			col++;
	}
	html.push("</div>");
	html = html.join("");
	this.html(html);
	
	$(".pGrpImg").off('mouseenter').on('mouseenter', function(e){
		var $this = $(this),
			scale = window.photoGroupScalars[ $this.attr("id")];
		$this.css({"z-index":2});
		$this.transition({ scale: scale*1.5 }, 'fast'); 
	});
	
	$(".pGrpImg").off('mouseleave').on('mouseleave', function(e){
		var $this = $(this),
			scale = window.photoGroupScalars[ $this.attr("id")];
		$this.css({"z-index":1});
		$this.transition({ scale: scale }, 'fast');
	});
	
	$(".pGrpImg").off('click').on('click', function(e){
		var $this = $(this), 
			w = parseInt($this.css("width")),
			h = parseInt($this.css("height")),
			src = $this.attr("src"),
			ww = window.innerWidth,
			wh = window.innerHeight,
			scale = 1, iw, ih;
			
		if (w>h && w>ww)
			scale = ww/w;
		else if (h>wh)
			scale = wh/h;
		iw = parseInt(scale*w);
		ih = parseInt(scale*h);
		$("body").append(
			"<div id=imgViewMask style='position:fixed;background-color:rgba(0,0,0,0.5);top:0;left:0;width:"+ww+"px;height:"+wh+"px;'>"+
				'<img src="'+src+'" width='+iw+' height='+ih+' style="position:absolute;top:'+((wh-ih)/2)+'px;left:'+((ww-iw)/2)+'px;">'+
			"</div>"
		);
		$("#imgViewMask").click(function(){
			$(this).remove();
		});
	});
};