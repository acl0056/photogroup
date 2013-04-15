$(document).ready(function(){
	$("#photogroup").photoGroup({
		photoUrls: [
			{image:"/demo_site/images/demo1.jpg",thumb:"/demo_site/images/demo1_thumb.jpg"},
			{image:"/demo_site/images/demo2.jpg",thumb:"/demo_site/images/demo2_thumb.jpg"},
			{image:"/demo_site/images/demo3.jpg",thumb:"/demo_site/images/demo3_thumb.jpg"},
			{image:"/demo_site/images/demo4.jpg",thumb:"/demo_site/images/demo4_thumb.jpg"},
			{image:"/demo_site/images/kitty1.jpg",thumb:"/demo_site/images/kitty1_thumb.jpg"},
			{image:"/demo_site/images/kitty2.jpg",thumb:"/demo_site/images/kitty2_thumb.jpg"},
			{image:"/demo_site/images/kitty3.jpg",thumb:"/demo_site/images/kitty3_thumb.jpg"},
			{image:"/demo_site/images/kitty4.jpg",thumb:"/demo_site/images/kitty4_thumb.jpg"}
		],
		thumbWidth: 160,
		thumbHeight: 140
	});
});