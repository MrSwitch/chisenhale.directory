---
title: Chisenhale Primary School's <br/>Little Black Book
layout: layout.html
heroImg: /assets/chisenhale.jpg
---

## Sponsors

<section>
{% for item in collections.companies %}
<article>
    <img src="{{item.data.heroImg}}" />
    <h1><a href="{{ item.url }}">{{ item.data.title }}</a></h1> 
     {% if item.data.strapline %}<p>{{ item.data.strapline }}</p> {% endif %}
    
</article>
{% endfor %}
</section>

