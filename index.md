---
# title: Little Black Book
layout: layout.html
heroImg: /assets/chisenhale-hero.webp
---

## Sponsors

<section>
{% for item in collections.sponsors %}
<a href="{{ item.url }}">
<article>
    <img src="{{item.data.heroImg}}" alt=""/>
    <h1 style="view-transition-name: heading-{{ forloop.index }};">{{ item.data.title }}</h1> 
    {% if item.data.strapline %}<p>{{ item.data.strapline }}</p> {% endif %}
</article>
</a>
{% endfor %}
</section>
