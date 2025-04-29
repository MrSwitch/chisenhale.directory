---
title: Chisenhale Primary School's Little Black Book
layout: layout.html
heroImg: https://files.schudio.com/chisenhale-primary-school/images/banners/Copy_of_DSC04158.jpg
---

## Sponsors

<section>
{% for item in collections.companies %}
<article>
    <img src="{{item.data.heroImg}}" />
    <h1><a href="{{ item.url }}">{{ item.data.title }}</a></h1> 
</article>
{% endfor %}
</section>
