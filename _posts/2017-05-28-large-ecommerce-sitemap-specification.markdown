---
author: Sean
comments: true
date: 2017-05-28 17:51:57+00:00
layout: post
title: "Large Ecommerce Sitemap Specifications"
header-img: "img/large-ecommerce-sitemap-specification.jpg"
meta-description: "Here are the specifications I wrote for a bespoke sitemap set up for a large ecommerce website in February 2017 in an attempt to optimise the performance of the site"
categories:
- Blog
- Marketing
---
A sitemap specification I wrote in 2017 for a large ecommerce client with significant inventory churn. The development manager requested the Agile Given/When/Then format. Published here for reference.

---

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
When the assets are published  
Then they should be listed in a XML sitemap file in order to make it quick for the search engines to find  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And these assets are of different types  
And some of them are webpages  
And some of them are images  
And some of them are videos  
When the assets are published  
Then they can be grouped together where these assets all feature on one page  
And we need to group related items together within `<url> </url>` tags  
And we need to encapsulate the items in the correct tags for their type  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And that they belong to a variety of different categories  
And that some of these categories have specific sitemap formats  
When the assets are published and added to an XML sitemap  
Then we need to make sure that these sitemaps are split into various categories  
And each category has its own file  
And if a category has its own format requirement that we use that format  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And we wish to sell our products  
And we have a large amount of stock  
And this stock is categorised by different brands  
When the assets are published and added to an XML sitemap  
Then we need to list products of a given brand in their own sitemap xml  
And this should be called Brand.xml so it is quick for humans to understand what is in it (for example Category.xml)  
And this can contain the URL groups that include pages, images and videos  
And this sitemaps should contain the URLs for the root page for the brand (e.g. https://www.website.co.uk/Category)  
And this sitemaps should contain the URLs for the root page for all series under this brand (e.g. https://www.website.co.uk/Category/SubCategory)  
And where applicable this should contain the URLs for the root page for models and sub models where these pages exists (e.g. https://www.website.co.uk/Category/SubCategory/16618, https://www.website.co.uk/Category/SubCategory/116610-LV, https://www.website.co.uk/Category/SubCategory/116610-LN)  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And we wish to buy products from the general public  
And this stock is categorised by different brands  
When the assets are published and added to an XML sitemap  
Then we need to list products of a given brand in their own sitemap xml  
And this should be called SellBrand.xml  
And this can contain the URL groups that include page URLs only (not images or video)  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And we have a New Arrivals section drives many new sales  
And it would benefit us to make this most regularly crawled section of the website by search engines  
And search engines tailor their crawl frequencies based on files they see changing rapidly  
When the assets are published and added to an XML sitemap  
Then we need to list the latest 100 new arrivals page URLs on their own NewArrivals.xml sitemap  
And new arrivals that are older than the latest 100 need to be removed  
And this sitemaps does need to contain URLs but does not need to list image or video details on it  
But this sitemap can and will list URLs that are on product sitemaps (Category.xml etc.)  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And some of these pages are relating to our service centre  
When the assets are published and added to an XML sitemap  
Then we need to list all servicing pages in a Servicing.xml sitemap  
And this does need to contain images and videos  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And some of these assets are articles  
And some of these assets are news  
When the assets are published and added to an XML sitemap  
Then we need to list all the pages that are in this category in a Articles.xml sitemap  
And this should list all images and videos that relate to the articles  
And we should also add them to specific News.xml for the first 48 hours that they are published  
But then remove them after 48 hours from the News.xml  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And some of them do not fit into the categories listed (homepage, info pages, about us, awards, promos/sale pages etc.)  
And that we do want these to be picked up by the search engines  
When the assets are published and added to an XML sitemap  
Then we need to list these in a mop up sitemap Website.xml  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
When the assets are published and listed in an XML sitemap  
Then we need to make sure the XML file is Encoded correctly  
And we need to tell the search engines it is so by starting each file with `<?xml version="1.0" encoding="UTF-8"?>`  
And we need to tell search engines what types of URL sets we are publishing  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And we need to tell search engines what types of URL sets to publish  
And where they can find the matching schemas  
And that we have pages, images and videos  
When the assets are published and added to an XML sitemap  
Then we need to list these URL schema sets within the `<urlset >` tag  
And for pages the schema is `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`  
And for video the schema is `xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"`  
And for images the schema is `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`  
And it should look like this `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="https://www.google.com/schemas/sitemap-video/1.1">`  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And some of them are web pages  
When the assets are published and added to an XML sitemap  
Then we need to list the locations of URLs using `<loc> </loc>` tags  
And these need to be within the URL group which is wrapped `<URL> </URL>` tags  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And some of them are images  
And we can provide a title which will help the search engines understand what is in an image  
When the assets are published and added to an XML sitemap  
Then we need to list details of images using `<image:image> </image:image>` tags  
And we need to list the URL of an image within `<image:loc> </image:/loc>` tags  
And we need to provide a title in `<image:title> </image:title>` tags  
And this image, where it is a product should contain the H1 of the product page, the angle of the shot and the product code  
And we need to provide license details which will be for every one `<image:license>[https://www.website.co.uk/info/Licensed-Images</image:license>`  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And some of them are videos  
And we can provide additional details about these videos  
And we host all our videos on YouTube  
When the assets are published and added to an XML sitemap  
Then we need to list details of videos using `<video:video> </video:video>` tags within the URL group below the page location details  
And we need to provide a thumbnail by using `<video:thumbnail_loc>https://img.youtube.com/vi/<insert-youtube-video-id-here>/maxresdefault.jpg</video:thumbnail_loc>`  
And we need to provide the title which should match the page's H1 tag and this should be wrapped in `<video:title> </video:title>`  
And we need to provide the title which should match the description from the page (currently wrapped in itemprop="description" tags on page) and be wrapped in `<video:description> </video:description>`  
And we need to provide the content location which will be `<video:content_loc>https://www.youtube.com/embed/<insert-youtube-video-id-here></video:content_loc>`

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And that we have a lot of different types  
And that when we list all of them the lists can become large  
And that speed means a lot to us  
And that aside from splitting up sitemaps we can also compress them  
When the assets are published  
Then we can publish gzipped sitemaps along site unzipped sitemaps  
And provide these gzipped sitemaps to the search engines instead  
And list these in a public sitemap index xml with the filename https://www.website.co.uk/sitemap.xml that we provide to the search engines  
And this should be listed in robots.txt  
And this should be the only one uploaded to search engine webmaster tools  
And list the uncompressed in another file for internal SEO and human use that we publish at /sitemaps.xml  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And the search engines have a 50,000 item limit per sitemap  
When the assets are published and added to an XML sitemap  
Then we need to split any lists that go above this size  
And if this happens it would make sense to split sitemaps into logical categories  
But this should not need to be thought about for a while  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And that we can advise the search engines on when a page was last modified to help with crawl prioritisation  
And that we can advise the search engines on what priority we rate a page from 0.0 (lowest) to 1.0 (highest)  
And that we can advise the search engines on how frequently a page is likely to change (always[changes when accessed]/hourly/daily/weekly/monthly/yearly/never[archived pages])  
When the assets are published and added to an XML sitemap  
Then we need to add this data within the `<url> </url>` tags  
And we need to use the `<lastmod>` tag in W3C datetime format with time omitted (e.g. 2017-12-25)  
And we need to set a priority on pages  
And that should be set to 1.0 for new arrivals, 0.9 for promo pages, 0.8 for all product pages and left to 0.5 (default) for all other pages (we can tweak later if required)  
And we need to use the `<changefreq>` to advise on change frequency (always/hourly/daily/weekly/monthly/yearly/never)  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And we don't want to have duplicate content being pushed to the search engines  
When the assets are published and added to an XML sitemap  
Then we need to list only canonical URLs  
And we don't want any pages that have a query string in them in the url to feature in the sitemap  
And if we have important pages that have query strings in, these need to be changed to non-query based URL's so the search engines don't ignore them  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And we have multiple country sites  
And some we don't provide certain services in some countries (e.g. serving)  
When the assets are published and added to an XML sitemap  
Then we need to have a specific set of sitemaps per country  
And not list in the sitemap services we don't provide in these countries  
But we also need to make sure these pages do not have hreflang tags point them to non-existent pages within the pages themselves (added otherwise I will forget to tell you this)  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And we have multiple country sites  
And these are in multiple languages  
When the assets are published and added to an XML sitemap  
Then we need include hreflang alternatives for each page URL  
But if this does not exist in the language or is not available as a service then we should not list it as an hreflang alternative on any sitemap (e.g. https://www.website.fr/service)  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And sometimes these pages are archived  
When the assets are archived  
Then we need to move them off all lists into an archive.xml  
And give all these pages priority 0.0 
And if this list exceedes 50,000 items we need to split the list and come up with a genius name like archive2.xml  
And if their URL group contains any other assets they need to be included as well  

Given that we have assets on the websites and that we want search engines to find them and index them quickly  
And sometimes are removed  
When the assets are unpublished or deleted  
Then we need them to be removed from all sitemaps  
And if their URL group contains any other assets they need to be removed as well  

---

**Reference documentation:**  

- <a href="https://www.sitemaps.org/protocol.html" target="_blank">Sitemaps.org protocol specification</a>
- <a href="https://support.google.com/webmasters/answer/156184?hl=en" target="_blank">Google Sitemaps documentation</a>
- <a href="https://developers.google.com/webmasters/videosearch/sitemaps" target="_blank">Google Video Sitemaps</a>
- <a href="https://support.google.com/webmasters/answer/178636" target="_blank">Google Image Sitemaps</a>

