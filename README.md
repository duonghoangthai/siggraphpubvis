#Visualizing SIGGRAPH Publications
###Kui Wu & Duong Hoang

#Overview
When surveying a new field, researchers often want an overview look at the important
papers in the field, how they are related, and how popular trends in topics or techniques
have been evolving over the years. Traditional search engines such as Google Scholar and
digital libraries such as the ACM's can alleviate the task, but only when the researcher has
a good idea of what he should look for. Furthermore, the manual process of parsing the reference list manually and entering search terms into search engines is very tedious. Even when sufficient data is obtained from such search engines, the data is in a non-visual form and not summarized in any ways, making it difficult for the user to see a high-level picture.

Being both interested in doing research in computer graphics, in this project we aim
to develop a tool to visualize connections between papers published over the years in SIG-
GRAPH, the most important conference in computer graphics. The tool shows in
one place: the citation relationships among SIGGRAPH papers, important papers in each
sub-field, prolific authors and their collaboration patterns, popular topics and methods in
recent years. It is our hope that this tool can be particularly helpful to someone who wants to survey a field and summarize major results. It could also help new researchers in finding not only interesting problems to work on but also pointers to relevant publications for reference.

#Project Objectives
Our project aims to answer the following questions:

1. What papers are influential in the field, in terms of citation count?
2. Given a paper of interest, what papers does it cite? What are the papers citing it?
3. What topics and techniques are popular, and in which time periods?
4. Given a set of keywords, what are the most relevant papers/authors to these keywords?

Answering the above questions will put a make a researcher more informed about what
papers/authors/topics/techniques to pay more attention to, thereby saving time in the be-
ginning of a survey task. It can also reveal interesting patterns and trends in the past that
can help him or her better decide on future research directions for a particular topic of
interest.

# Files
0. Our raw data (as crawled from the internet) is stored in https://www.dropbox.com/sh/5k3jrd89fc6i05u/AAAkmbiOZpe_HHkTjYJVi3qza?dl=0
1. ./Data stores all our processed data in the form of JSON files
2. ./DataMiningScripts stores all our scripts, which are used to extract and process data
3. ./sigvis.html is our main html file
4. ./processbook.html is our prcess book html
5. ./scripts.js and ./KeywordVis.js are our main javascript files
6. ./fisheye.js and ./virtualscoller.js are external library we required
7. ./NewProcessBook/processbook.pdf is our final process book
8. Our project also requires the following libraries:
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