## avg.studio

A personal website for Anthony Gagliardi, an architect based in Brooklyn.
Still in progress (99% there,) can be viewed live [here](http://avg.studio).

![avg.studio](https://i.imgur.com/9lMcw9a.png)

**Project Context**

* I designed and built this website throughout 2020, after the client approached me asking if I could design and develop a portfolio for their architecture work.
* The design prompt asked for a fun way for the user to interact with Anthony's work, starting from the idea of a blank canvas.
* The design and development were somewhat staggered throughout the entire year, mainly happening when the client's free time to provide content & feedback would overlap with my free time to design and implement :) (we had agreed upon this from the very beginning, so it was a fun, casual project.)
* The total design + development time for the entire project is currently clocking at ~160 hours. Around 20-30 of them spent on design, the rest on development. Another 3-4 more hours of polish are needed on my end in order to consider the project finalized (plus some final content from the client.)
* The design & development were iterative throghout the entire timeline, the form we ended up with is quite different from the first "final" design mock-ups from before starting implementation. That might explain the 160 hours, it's not that large of a project, but it was a path with many turns before arriving at this format.

**Technical Information**

* The project is built using React and Next.js
* It uses Sanity CMS for the backend, which can be viewed in [this](https://github.com/CezarMocan/ag-portfolio-cms) repository.
* It uses React Contexts for app-wide state management
* It implements entirely different views for seeing a project on desktop vs mobile, since we ended up landing on a quite complex desktop interaction, heavily dependent on mouse scrolls & clicks, which was impractical to replicate on mobile.
