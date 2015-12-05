#Visualizing SIGGRAPH Publications
###Kui Wu & Duong Hoang

#Overview
When surveying a new field, researchers often want an overview look at the important
papers in the field, how they are related, and how popular trends in topics or techniques
have been evolving over the years. Traditional search engines such as Google Scholar and
digital libraries such as the ACM's can alleviate the task, but only when the researcher has
a good idea of what he should look for. Even then, the information obtained from those
tools at any given moment is not only too specific but also presented in a non-visual form,
making it dicult for the user to see a bigger picture.

Being both interested in doing research in computer graphics, in this project we aim
to develop a tool to visualize connections between papers published over the years in SIG-
GRAPH, the most important conference in computer graphics. The tool should show in
one place: the citation relationships among SIGGRAPH papers, important papers in each
sub-field, prolific authors and their collaboration patterns, popular topics and methods in
recent years, and active research institutions in each sub-field. It is our hope that such
a tool can be particularly helpful to someone who wants to survey a eld and summarize
major results. It could also help new researchers in finding not only interesting problems to
work on but also pointers to relevant publications for reference. Lastly, prospective graduate
students can use information provided by the tool to make more informed decision in their
application process.

#Project Objectives
Our project aims to answer the following questions:

1. What papers are in uential in the field, in terms of citation count? 
2. Given a paper of interest, what papers does it cite? What are the papers citing it?
3. What topics and techniques are popular, and in which time periods?
4. Given a set of keywords, what are the most relevant papers/authors/institutions to these keywords?
5. Who does each author collaborate with the most?
6. What institutions are more active in a give field, in terms of publication count?

Answering the above questions will put a make a researcher more informed about what
papers/authors/topics/techniques to pay more attention to, thereby saving time in the be-
ginning of a survey task. It can also reveal interesting patterns and trends in the past that
can help him or her better decide on future research directions for a particular topic of
interest.

# Files
1. ./Data stores all our data
2. ./DataMiningScripts stores all our scripts, which are used to extract and process data
3. ./sigvis.html is our main html file
4. ./processbook.html is our prcess book html
5. ./scripts.js and ./KeywordVis.js are our main javascript files
6. ./fisheye.js and ./virtualscoller.js are external library we required
7. Our project also requires the following libraries:
<ul>
	<li>https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js</li>
	<li>https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.19/topojson.min.js</li>
	<li>http://d3js.org/queue.v1.min.js</li>
	<li>https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js</li>
	<li>https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js</li>
</ul>

#Project Website
http://www.cs.utah.edu/~kwu/vis/sigvis.html

#Screencast videos
https://www.youtube.com/watch?v=NDE5lXoJ8Jk