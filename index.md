

# This is care0717's blog
- [about](about)

## Posts
{% for post in site.posts %}
{% unless post.next %}
{% capture year %}{{ post.date | date: '%Y' }}{% endcapture %}
<h3>{{ year }}</h3>
<ul>
<li>
<span>{{ post.date | date: "%m/%d" }} &raquo;</span>
<a href="{{ post.url }}">{{ post.title }}</a>
</li>
{% else %}
{% capture year %}{{ post.date | date: '%Y' }}{% endcapture %}
{% capture nyear %}{{ post.next.date | date: '%Y' }}{% endcapture %}
{% if year != nyear %}
</ul>
<h3>{{ year }}</h3>
<ul>
{% endif %}
<li>
<span>{{ post.date | date: "%m/%d" }} &raquo;</span>
<a href="{{ post.url }}">{{ post.title }}</a>
</li>
{% endunless %}
{% endfor %}
</ul>
