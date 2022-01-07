

# This is care0717's blog
- [about](about)

## Posts
{% for post in site.posts %}
{% unless post.next %}
{% capture year %}{{ post.date | date: '%Y' }}{% endcapture %}
{% capture month %}{{ post.date | date: '%m' }}{% endcapture %}
<h3>{{ year }}/{{ month }}</h2>
<ul>
<li>
<span>{{ post.date | date_to_string }} &raquo;</span>
<a href="{{ post.url }}">{{ post.title }}</a>
</li>
{% else %}
{% capture month %}{{ post.date | date: '%m' }}{% endcapture %}
{% capture nmonth %}{{ post.next.date | date: '%m' }}{% endcapture %}
{% capture year %}{{ post.date | date: '%Y' }}{% endcapture %}
{% if month != nmonth %}
</ul>
<h3>{{ year }}/{{ month }}</h2>
<ul>
{% else %}
{% capture nyear %}{{ post.next.date | date: '%Y' }}{% endcapture %}
{% if year != nyear %}
</ul>
<h3>{{ year }}/{{ month }}</h2>
<ul>
{% endif %}
{% endif %}
<li>
<span>{{ post.date | date_to_string }} &raquo;</span>
<a href="{{ post.url }}">{{ post.title }}</a>
</li>
{% endunless %}
{% endfor %}
</ul>
